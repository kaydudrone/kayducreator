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

    // Find GPX_MOSSY tag specifically
    const mossyTag = allTags.find(t =>
      t.name?.toLowerCase().includes('gpx_mossy') ||
      t.name?.toLowerCase() === 'gpx mossy' ||
      t.name?.toLowerCase().includes('mossy')
    );

    // Search subscribers with GPX_MOSSY tag to get count
    let gpxCount = 0;
    if (mossyTag) {
      try {
        const searchRes = await fetch(
          `https://api.manychat.com/fb/subscriber/search?tag_id=${mossyTag.id}&limit=1`,
          { headers }
        );
        const searchText = await searchRes.text();
        const searchData = JSON.parse(searchText);
        // ManyChat returns total count in the response
        gpxCount = searchData?.data?.total || searchData?.total || 0;
      } catch {}
    }

    res.status(200).json({
      page: {
        name: pageData.data?.name,
        is_pro: pageData.data?.is_pro,
        timezone: pageData.data?.timezone,
      },
      tags: {
        total: allTags.length,
        all: allTags.map(t => ({ id: t.id, name: t.name })),
      },
      gpx: {
        tag_exists: !!mossyTag,
        tag_name: mossyTag?.name || null,
        tag_id: mossyTag?.id || null,
        requests: gpxCount,
      },
      fetched_at: new Date().toISOString(),
    });

  } catch (err) {
    console.error('ManyChat stats error:', err);
    res.status(500).json({ error: 'Failed', message: err.message });
  }
}
