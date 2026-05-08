// ManyChat Stats API — uses only verified endpoints
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://kayducreator.com');
  res.setHeader('Cache-Control', 's-maxage=1800');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.DASHBOARD_SECRET;
  if (secret && req.headers['x-dashboard-token'] !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

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
    if (pageData.status !== 'success') {
      return res.status(401).json({ error: 'ManyChat auth failed', details: pageData });
    }

    // Tags list
    const tagsRes = await fetch('https://api.manychat.com/fb/page/getTags', { headers });
    const tagsText = await tagsRes.text();
    let tagsData = null;
    try { tagsData = JSON.parse(tagsText); } catch {}

    const allTags = tagsData?.data || [];

    // Count "link_clicked" tags — each one = someone who clicked the GPX link
    const linkClickedTags = allTags.filter(t => t.name?.toLowerCase().includes('link_clicked'));
    const sortedClicks = linkClickedTags.sort((a, b) => b.name.localeCompare(a.name));
    const latestClick = sortedClicks[0]?.name || null;

    // Extract date from latest click tag name e.g. "link_clicked (2026-05-07 13:20:36)"
    const latestDateMatch = latestClick?.match(/\(([^)]+)\)/);
    const latestDate = latestDateMatch ? latestDateMatch[1] : null;

    // Also check for GPX_MOSSY tag if manually added
    const mossyTag = allTags.find(t =>
      t.name?.toLowerCase().includes('gpx_mossy') ||
      t.name?.toLowerCase().includes('mossy')
    );

    res.status(200).json({
      page: {
        name: pageData.data?.name,
        is_pro: pageData.data?.is_pro,
        timezone: pageData.data?.timezone,
      },
      tags: {
        total: allTags.length,
      },
      gpx: {
        tag_exists: true,
        requests: linkClickedTags.length,
        latest_click: latestDate,
        mossy_tag: !!mossyTag,
      },
      fetched_at: new Date().toISOString(),
    });

  } catch (err) {
    console.error('ManyChat stats error:', err);
    res.status(500).json({ error: 'Failed', message: err.message });
  }
}
