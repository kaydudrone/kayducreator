// ManyChat Stats API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://kayducreator.com');
  res.setHeader('Cache-Control', 's-maxage=1800');

  const token = process.env.MANYCHAT_API_KEY;
  if (!token) return res.status(500).json({ error: 'No ManyChat API key configured' });

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    // Page info
    const pageRes = await fetch('https://api.manychat.com/fb/page/getInfo', { headers });
    const pageData = await pageRes.json();

    // Flows list
    const flowsRes = await fetch('https://api.manychat.com/fb/flows/getFlows', { headers });
    const flowsData = await flowsRes.json();

    // Keywords/Growth Tools
    const growthRes = await fetch('https://api.manychat.com/fb/page/getGrowthTools', { headers });
    const growthData = await growthRes.json();

    // Find MOSSY / GPX related flows
    const allFlows = flowsData.data || [];
    const gpxFlows = allFlows.filter(f =>
      f.name?.toLowerCase().includes('mossy') ||
      f.name?.toLowerCase().includes('gpx') ||
      f.name?.toLowerCase().includes('genting') ||
      f.name?.toLowerCase().includes('trail')
    );

    // Find MOSSY keyword in growth tools
    const growthTools = growthData.data || [];
    const mossyTool = growthTools.find(t =>
      t.name?.toLowerCase().includes('mossy') ||
      t.keywords?.some(k => k.toLowerCase().includes('mossy'))
    );

    res.status(200).json({
      page: {
        name: pageData.data?.name || 'Kay Du',
        is_pro: pageData.data?.is_pro || false,
        timezone: pageData.data?.timezone,
      },
      flows: {
        total: allFlows.length,
        gpx_flows: gpxFlows.map(f => ({ name: f.name, id: f.id })),
      },
      mossy_tool: mossyTool ? {
        name: mossyTool.name,
        id: mossyTool.id,
        status: mossyTool.status,
      } : null,
      growth_tools_total: growthTools.length,
      fetched_at: new Date().toISOString(),
    });

  } catch (err) {
    console.error('ManyChat stats error:', err);
    res.status(500).json({ error: 'Failed to fetch ManyChat stats', message: err.message });
  }
}
