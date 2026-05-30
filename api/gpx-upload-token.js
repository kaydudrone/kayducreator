import { handleUpload } from '@vercel/blob/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Auth check
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname) => ({
        allowedContentTypes: [
          'application/gpx+xml',
          'text/xml',
          'application/xml',
          'application/octet-stream',
          'text/plain',
        ],
        maximumSizeInBytes: 50 * 1024 * 1024, // 50 MB
        addRandomSuffix: false,
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log('GPX blob uploaded:', blob.url);
      },
    });
    return res.status(200).json(jsonResponse);
  } catch (err) {
    console.error('gpx-upload-token error:', err);
    return res.status(500).json({ error: err.message });
  }
}
