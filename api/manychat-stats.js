// ManyChat Stats API
// Fetches subscriber count and flow stats for the dashboard

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://kayducreator.com');
  res.setHeader('Cache-Control', 's-maxage=1800'); // Cache 30 mins

  const token = process.env.MANYCHAT_API_KEY;

  if (!token) {
    return res.status(500).json({ error: 'No ManyChat API key configured' });
  }

  try {
    // Debug: fetch page info and return raw response
    const pageRes = await fetch('https://api.manychat.com/fb/page/getInfo', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const rawText = await pageRes.text();

    // Return raw for debugging
    res.status(200).json({
      debug: true,
      status_code: pageRes.status,
      raw_response: rawText.substring(0, 500),
      token_length: token.length,
      fetched_at: new Date().toISOString(),
    });

  } catch (err) {
    console.error('ManyChat stats error:', err);
    res.status(500).json({ error: 'Failed to fetch ManyChat stats', message: err.message });
  }
}
