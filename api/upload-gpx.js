import { Octokit } from '@octokit/rest';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { filename, content } = req.body;
    if (!filename || !content) {
      return res.status(400).json({ error: 'filename and content (base64) required' });
    }
    if (!filename.endsWith('.gpx')) {
      return res.status(400).json({ error: 'Only .gpx files allowed' });
    }

    const octokit = new Octokit({ auth: process.env.GITHUB_PAT });
    const owner   = process.env.GITHUB_OWNER || 'kaydudrone';
    const repo    = process.env.GITHUB_REPO  || 'kayduhikingcreator';
    const path    = `gpx/${filename}`;

    // Check if file already exists (need sha to update)
    let sha;
    try {
      const { data } = await octokit.repos.getContent({ owner, repo, path });
      sha = data.sha;
    } catch {
      // File doesn't exist yet — that's fine, sha stays undefined
    }

    await octokit.repos.createOrUpdateFileContents({
      owner, repo, path,
      message: `upload: GPX file ${filename}`,
      content,   // already base64
      ...(sha ? { sha } : {}),
    });

    return res.status(200).json({ url: `/gpx/${filename}` });

  } catch (err) {
    console.error('upload-gpx error:', err);
    return res.status(500).json({ error: err.message });
  }
}
