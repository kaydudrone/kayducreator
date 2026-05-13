import { put } from '@vercel/blob';
import { Octokit } from '@octokit/rest';

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
      gpxBase64,
      gpxFilename,
      name,
      location,
      difficulty,
      distance,
      elevGain,
      peak,
      meetingPointUrl,
      videoUrl,
      permitRequired,
      guideNeeded
    } = req.body;

    // 1. Upload GPX to Vercel Blob
    const gpxBuffer = Buffer.from(gpxBase64, 'base64');
    const blobResult = await put(`gpx/${gpxFilename}`, gpxBuffer, {
      access: 'public',
      contentType: 'application/gpx+xml',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    const gpxUrl = blobResult.url;

    // 2. Prepare new hike object
    const newHike = {
      id: Date.now().toString().slice(-6), // simple ID
      status: 'COMPLETED',
      name,
      location,
      difficulty,
      distance,
      elevGain,
      peak,
      gpxUrl,
      meetingPointUrl,
      videoUrl,
      permitRequired: Boolean(permitRequired),
      guideNeeded: Boolean(guideNeeded),
      addedAt: new Date().toISOString()
    };

    // 3. Update GitHub hikes.json
    const octokit = new Octokit({ auth: process.env.GITHUB_PAT });
    const owner = process.env.GITHUB_OWNER || 'kaydu'; // Needs to be set or adjust logic
    const repo = process.env.GITHUB_REPO || 'kayducreator';
    const path = 'content/hikes.json';

    let fileSha;
    let hikes = [];

    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });
      fileSha = data.sha;
      const contentDecoded = Buffer.from(data.content, 'base64').toString('utf8');
      hikes = JSON.parse(contentDecoded);
    } catch (error) {
      // If file doesn't exist, we start with empty array
      if (error.status !== 404) {
        throw error;
      }
    }

    hikes.push(newHike);

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Add hike: ${name}`,
      content: Buffer.from(JSON.stringify(hikes, null, 2)).toString('base64'),
      sha: fileSha
    });

    return res.status(200).json({ success: true, hike: newHike });
  } catch (error) {
    console.error('Error saving hike:', error);
    return res.status(500).json({ error: error.message });
  }
}
