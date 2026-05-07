// ManyChat Stats API — uses only verified endpoints
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
    // Page info — confirmed working
    const pageRes = await fetch('https://api.manychat.com/fb/page/getInfo', { headers });
    const pageData = await pageRes.json();

    if (pageData.status !== 'success') {
      return res.status(401).json({ error: 'ManyChat auth failed', details: pageData });
    }

    // Tags list — used to track MOSSY requests
    const tagsRes = await fetch('https://api.manychat.com/fb/page/getTags', { headers });
    const tagsText = await tagsRes.text();
    let tagsData = null;
    try { tagsData = JSON.parse(tagsText); } catch {}

    // Custom fields — may contain GPX request counts
    const fieldsRes = await fetch('https://api.manychat.com/fb/page/getCustomFields', { headers });
    const fieldsText = await fieldsRes.text();
    let fieldsData = null;
    try { fieldsData = JSON.parse(fieldsText); } catch {}

    // Find MOSSY-related tags
    const allTags = tagsData?.data || [];
    const mossyTags = allTags.filter(t =>
      t.name?.toLowerCase().includes('mossy') ||
      t.name?.toLowerCase().includes('gpx') ||
      t.name?.toLowerCase().includes('genting')
    );

    res.status(200).json({
      page: {
        name: pageData.data?.name,
        is_pro: pageData.data?.is_pro,
        timezone: pageData.data?.timezone,
      },
      tags: {
        total: allTags.length,
        gpx_tags: mossyTags,
      },
      custom_fields: fieldsData?.data || [],
      fetched_at: new Date().toISOString(),
    });

  } catch (err) {
    console.error('ManyChat stats error:', err);
    res.status(500).json({ error: 'Failed', message: err.message });
  }
}
