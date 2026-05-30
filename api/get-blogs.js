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

    let blogs = [];
    try {
      const { data } = await octokit.repos.getContent({ owner, repo, path: 'content/blogs.json' });
      blogs = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    } catch (_) {}

    return res.status(200).json({ blogs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
