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
    // Fetch subscriber stats
    const subRes = await fetch('https://api.manychat.com/fb/subscriber/getInfo', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Fetch page info (total subscribers)
    const pageRes = await fetch('https://api.manychat.com/fb/page/getInfo', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const pageData = await pageRes.json();

    if (pageData.status === 'error') {
      return res.status(401).json({ error: 'Invalid ManyChat API key', details: pageData.message });
    }

    // Fetch flows to find MOSSY keyword flow
    const flowsRes = await fetch('https://api.manychat.com/fb/sending/getFlows', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const flowsData = await flowsRes.json();

    // Find flows related to GPX/MOSSY
    const gpxFlows = (flowsData.data || []).filter(f =>
      f.name?.toLowerCase().includes('mossy') ||
      f.name?.toLowerCase().includes('gpx') ||
      f.name?.toLowerCase().includes('genting')
    );

    res.status(200).json({
      page: {
        name: pageData.data?.name || 'Kay Du',
        total_subscribers: pageData.data?.total_subscribers || 0,
        active_subscribers: pageData.data?.active_subscribers || 0,
      },
      gpx_flows: gpxFlows.map(f => ({
        name: f.name,
        id: f.id,
      })),
      total_flows: (flowsData.data || []).length,
      fetched_at: new Date().toISOString(),
    });

  } catch (err) {
    console.error('ManyChat stats error:', err);
    res.status(500).json({ error: 'Failed to fetch ManyChat stats' });
  }
}
