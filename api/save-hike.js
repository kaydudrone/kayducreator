import { Octokit } from '@octokit/rest';

// Increase body parser limit — GPX files arrive as base64 text and can exceed the 1MB default
export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
};

const PIN_SVG    = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
const DOT_SVG    = `<svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>`;
const DIST_SVG   = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`;
const ELEV_SVG   = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`;
const PEAK_SVG   = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>`;
const DL_SVG     = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
const IG_SVG     = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`;
const LOCK_SVG   = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

const DIFF_CLASS = {
  'Easy': 'easy',
  'Moderate': 'moderate',
  'Slightly Hard': 'slightly-hard',
  'Hard': 'hard',
  'Extreme': 'extreme',
};

// Marker in index.html just before the BEYOND MALAYSIA section
const INSERTION_MARKER = `    </div>
  </div>
</section>

<!-- BEYOND MALAYSIA -->`;

function buildTrailCard({ num, name, location, difficulty, distance, elevGain, peak, gpxDownloadUrl, meetingPointUrl, videoUrl, permitRequired, guideNeeded }) {
  const numPadded  = String(num).padStart(2, '0');
  const diffClass  = DIFF_CLASS[difficulty] || 'easy';
  const distKm     = parseFloat(distance).toFixed(1);
  const elevM      = Math.round(parseFloat(elevGain));
  const peakM      = Math.round(parseFloat(peak));

  const permitBadge = permitRequired
    ? `\n          <span class="permit-badge">${LOCK_SVG} Permit Required</span>`
    : '';

  const guideBadge = guideNeeded
    ? `\n          <span class="permit-badge">Guide Needed</span>`
    : '';

  const meetingBtn = meetingPointUrl
    ? `\n          <a class="btn btn-outline btn-sm" href="${meetingPointUrl}" target="_blank" rel="noopener noreferrer">Meeting Point</a>`
    : '';

  const videoBtn = videoUrl
    ? `\n          <a class="btn btn-ig btn-sm" href="${videoUrl}" target="_blank" rel="noopener noreferrer">${IG_SVG} Video</a>`
    : '';

  return `
      <!-- ${numPadded} ${name} -->
      <article class="trail-card">
        <div class="trail-header">
          <div class="trail-num">${numPadded} · Completed</div>
          <div class="trail-name">${name}</div>
          <div class="trail-loc">${PIN_SVG} ${location}</div>
          <span class="difficulty diff-${diffClass}">${DOT_SVG} ${difficulty}</span>${permitBadge}${guideBadge}
        </div>
        <div class="trail-stats">
          <div class="trail-stat">${DIST_SVG}<span class="s-val">${distKm} km</span><span class="s-lbl">Distance</span></div>
          <div class="trail-stat">${ELEV_SVG}<span class="s-val">${elevM} m</span><span class="s-lbl">Elev. Gain</span></div>
          <div class="trail-stat">${PEAK_SVG}<span class="s-val">${peakM} m</span><span class="s-lbl">Peak</span></div>
        </div>
        <div class="trail-actions">
          <a class="btn btn-primary btn-sm" href="${gpxDownloadUrl}" download>${DL_SVG} GPX</a>${meetingBtn}${videoBtn}
        </div>
      </article>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const {
      gpxFilename,
      gpxBlobUrl,
      name, location, difficulty,
      distance, elevGain, peak,
      meetingPointUrl, videoUrl,
      permitRequired, guideNeeded,
    } = req.body;

    const safeFilename = gpxFilename.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.{2,}/g, '_');

    const octokit = new Octokit({ auth: process.env.GITHUB_PAT });
    const owner   = process.env.GITHUB_OWNER || 'kaydudrone';
    const repo    = process.env.GITHUB_REPO  || 'kayduhikingcreator';

    // ── 1. GPX file is pre-committed to /gpx/ folder ─────────────────
    // (not uploaded via API due to file size — commit GPX to repo separately)

    // ── 2. Read index.html from GitHub ───────────────────────────────
    let indexData;
    try {
      const res2 = await octokit.repos.getContent({ owner, repo, path: 'index.html' });
      indexData = res2.data;
    } catch (e) {
      e.step = 'step2-read-index';
      throw e;
    }

    const indexContent = Buffer.from(indexData.content, 'base64').toString('utf8');
    const existingCount = (indexContent.match(/class="trail-num">/g) || []).length;
    const nextNum  = existingCount + 1;

    // ── 3. Build trail card HTML ──────────────────────────────────────
    // Use blob URL if provided, otherwise fall back to /gpx/ path
    const gpxDownloadUrl = gpxBlobUrl || `/gpx/${safeFilename}`;

    const card = buildTrailCard({
      num: nextNum, name, location, difficulty,
      distance, elevGain, peak,
      gpxDownloadUrl,
      meetingPointUrl, videoUrl,
      permitRequired: Boolean(permitRequired),
      guideNeeded: Boolean(guideNeeded),
    });

    // ── 4. Inject into index.html ─────────────────────────────────────
    if (!indexContent.includes(INSERTION_MARKER)) {
      return res.status(500).json({ error: 'Insertion marker not found in index.html' });
    }

    const updatedIndex = indexContent.replace(
      INSERTION_MARKER,
      card + '\n\n' + INSERTION_MARKER
    );

    try {
      await octokit.repos.createOrUpdateFileContents({
        owner, repo,
        path: 'index.html',
        message: `feat: add trail #${nextNum} — ${name}`,
        content: Buffer.from(updatedIndex).toString('base64'),
        sha: indexData.sha,
      });
    } catch (e) {
      e.step = 'step4-update-index';
      throw e;
    }

    // ── 5. Update hikes.json ──────────────────────────────────────────
    let hikesSha;
    let hikes = [];
    try {
      const { data } = await octokit.repos.getContent({ owner, repo, path: 'content/hikes.json' });
      hikesSha = data.sha;
      hikes = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    } catch (_) { /* file may not exist yet */ }

    hikes.push({
      id: Date.now().toString().slice(-6),
      num: nextNum,
      status: 'COMPLETED',
      name, location, difficulty,
      distance, elevGain, peak,
      gpxPath: `/gpx/${safeFilename}`,
      meetingPointUrl, videoUrl,
      permitRequired: Boolean(permitRequired),
      guideNeeded: Boolean(guideNeeded),
      addedAt: new Date().toISOString(),
    });

    await octokit.repos.createOrUpdateFileContents({
      owner, repo,
      path: 'content/hikes.json',
      message: `Update hikes.json: add ${name}`,
      content: Buffer.from(JSON.stringify(hikes, null, 2)).toString('base64'),
      ...(hikesSha ? { sha: hikesSha } : {}),
    });

    return res.status(200).json({ success: true, trailNum: nextNum, name });

  } catch (error) {
    console.error('Error saving hike:', error);
    return res.status(500).json({
      error: error.message,
      step: error.step || 'unknown',
      details: error.response?.data || null
    });
  }
}
