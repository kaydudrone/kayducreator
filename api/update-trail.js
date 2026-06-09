import { Octokit } from '@octokit/rest';

const IG_SVG   = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { trailName, videoUrl, meetingUrl, gpxBlobUrl, gpxFilename, gpxBase64 } = req.body;
    if (!trailName) return res.status(400).json({ error: 'trailName required' });

    const octokit = new Octokit({ auth: process.env.GITHUB_PAT });
    const owner   = process.env.GITHUB_OWNER || 'kaydudrone';
    const repo    = process.env.GITHUB_REPO  || 'kayduhikingcreator';

    // ── Commit replacement GPX file to /gpx/ if provided ─────────────
    let resolvedGpxUrl = gpxBlobUrl || null;
    if (gpxBase64 && gpxFilename) {
      const gpxPath = `gpx/${gpxFilename}`;
      let existingSha;
      try {
        const { data } = await octokit.repos.getContent({ owner, repo, path: gpxPath });
        existingSha = data.sha;
      } catch { /* file doesn't exist yet */ }

      // gpxBase64 is raw text from the client; encode with Buffer for GitHub API
      const encodedContent = Buffer.from(gpxBase64, 'utf8').toString('base64');

      await octokit.repos.createOrUpdateFileContents({
        owner, repo,
        path: gpxPath,
        message: `upload: GPX file ${gpxFilename}`,
        content: encodedContent,
        ...(existingSha ? { sha: existingSha } : {}),
      });
      resolvedGpxUrl = `/gpx/${gpxFilename}`;
    }

    // Read index.html
    const { data: indexData } = await octokit.repos.getContent({ owner, repo, path: 'index.html' });
    let html = Buffer.from(indexData.content, 'base64').toString('utf8');

    // Find this trail's article block
    const escapedName = trailName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cardRegex   = new RegExp(
      `(<!--\\s*\\d+\\s+${escapedName}\\s*-->\\s*<article class="trail-card">)([\\s\\S]+?)(<\\/article>)`,
      'g'
    );

    let updated = false;

    html = html.replace(cardRegex, (fullMatch, open, cardBody, close) => {
      updated = true;
      let body = cardBody;

      // ── Update video URL ──────────────────────────────────────────
      if (videoUrl !== undefined) {
        if (videoUrl === '') {
          // Remove video button entirely
          body = body.replace(/\n?\s*<a class="btn btn-ig btn-sm"[^>]*>[\s\S]*?<\/a>/g, '');
        } else {
          const existingVideo = body.match(/class="btn btn-ig btn-sm"\s+href="([^"]+)"/);
          if (existingVideo) {
            // Update existing video button href
            body = body.replace(
              /(<a class="btn btn-ig btn-sm"\s+href=")[^"]+(")/,
              `$1${videoUrl}$2`
            );
          } else {
            // Insert video button before the last closing </div> in cardBody (trail-actions)
            body = body.replace(
              /(\s*<\/div>\s*)$/,
              `\n          <a class="btn btn-ig btn-sm" href="${videoUrl}" target="_blank" rel="noopener noreferrer">${IG_SVG} Video</a>$1`
            );
          }
        }
      }

      // ── Update GPX download URL ───────────────────────────────────
      if (resolvedGpxUrl) {
        const gpxHref = resolvedGpxUrl;
        body = body.replace(
          /(<a class="btn btn-primary btn-sm"\s+href=")[^"]+(" download>)/,
          `$1${gpxHref}$2`
        );
      }

      // ── Update meeting point URL ──────────────────────────────────
      if (meetingUrl !== undefined) {
        if (meetingUrl === '') {
          body = body.replace(/\n?\s*<a class="btn btn-outline btn-sm"[^>]*>Meeting Point<\/a>/g, '');
        } else {
          const existingMeet = body.match(/class="btn btn-outline btn-sm"\s+href="([^"]+)"/);
          if (existingMeet) {
            body = body.replace(
              /(<a class="btn btn-outline btn-sm"\s+href=")[^"]+(")/,
              `$1${meetingUrl}$2`
            );
          } else {
            // Insert meeting point button after GPX button
            body = body.replace(
              /(<a class="btn btn-primary btn-sm"[^>]*>[\s\S]*?<\/a>)/,
              `$1\n          <a class="btn btn-outline btn-sm" href="${meetingUrl}" target="_blank" rel="noopener noreferrer">Meeting Point</a>`
            );
          }
        }
      }

      return open + body + close;
    });

    if (!updated) {
      return res.status(404).json({ error: `Trail "${trailName}" not found in index.html` });
    }

    // Write back to GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner, repo,
      path: 'index.html',
      message: `update: trail card — ${trailName}${resolvedGpxUrl ? ' (GPX replaced)' : ''}`,
      content: Buffer.from(html).toString('base64'),
      sha: indexData.sha,
    });

    return res.status(200).json({ success: true, trailName });

  } catch (err) {
    console.error('update-trail error:', err);
    return res.status(500).json({ error: err.message });
  }
}
