import { Octokit } from '@octokit/rest';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const octokit = new Octokit({ auth: process.env.GITHUB_PAT });
    const owner   = process.env.GITHUB_OWNER || 'kaydudrone';
    const repo    = process.env.GITHUB_REPO  || 'kayduhikingcreator';

    const { data } = await octokit.repos.getContent({ owner, repo, path: 'index.html' });
    const html = Buffer.from(data.content, 'base64').toString('utf8');

    // Extract each trail card
    const trails = [];
    const cardRegex = /<!--\s*(\d+)\s+(.+?)\s*-->\s*<article class="trail-card">([\s\S]+?)<\/article>/g;
    let match;

    while ((match = cardRegex.exec(html)) !== null) {
      const [, num, name, cardBody] = match;

      // Extract video URL (btn-ig link)
      const videoMatch  = cardBody.match(/class="btn btn-ig btn-sm"\s+href="([^"]+)"/);
      // Extract meeting point URL (btn-outline link)
      const meetMatch   = cardBody.match(/class="btn btn-outline btn-sm"\s+href="([^"]+)"/);
      // Extract GPX URL (btn-primary link)
      const gpxMatch    = cardBody.match(/class="btn btn-primary btn-sm"\s+href="([^"]+)"/);
      // Extract location
      const locMatch    = cardBody.match(/class="trail-loc">[^<]*<\/svg>\s*([^<]+)<\/div>/);
      // Extract difficulty label
      const diffMatch   = cardBody.match(/class="difficulty[^"]*">[^<]*<\/svg>\s*([^<]+)<\/span>/);

      trails.push({
        num:          parseInt(num),
        name:         name.trim(),
        location:     locMatch    ? locMatch[1].trim()  : '',
        difficulty:   diffMatch   ? diffMatch[1].trim() : '',
        gpxUrl:       gpxMatch    ? gpxMatch[1]         : '',
        meetingUrl:   meetMatch   ? meetMatch[1]        : '',
        videoUrl:     videoMatch  ? videoMatch[1]       : '',
      });
    }

    trails.sort((a, b) => a.num - b.num);
    return res.status(200).json({ trails });

  } catch (err) {
    console.error('get-trails error:', err);
    return res.status(500).json({ error: err.message });
  }
}
