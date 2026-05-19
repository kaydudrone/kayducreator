// Instagram Stats API
// Fetches your latest IG stats and returns them as JSON for the dashboard

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://kayducreator.com');
  res.setHeader('Cache-Control', 's-maxage=3600');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.IG_ACCESS_TOKEN;

  if (!token) {
    return res.status(500).json({ error: 'No access token configured' });
  }

  try {
    // Fetch profile info + follower count
    const profileRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username,followers_count,media_count&access_token=${token}`
    );
    const profile = await profileRes.json();

    if (profile.error) {
      return res.status(401).json({ error: 'Token expired or invalid', message: profile.error.message || 'Check IG_ACCESS_TOKEN in Vercel' });
    }

    // Fetch up to 200 posts (2 pages of 100) with insights
    const FIELDS = 'id,caption,media_type,timestamp,like_count,comments_count';
    let allMedia = [];

    // Page 1 — latest 100
    const mediaRes = await fetch(
      `https://graph.instagram.com/me/media?fields=${FIELDS}&limit=100&access_token=${token}`
    );
    const mediaData = await mediaRes.json();
    allMedia = allMedia.concat(mediaData.data || []);

    // Page 2 — next 100 (if cursor exists)
    const nextCursor = mediaData.paging?.cursors?.after;
    if (nextCursor) {
      const mediaRes2 = await fetch(
        `https://graph.instagram.com/me/media?fields=${FIELDS}&limit=100&after=${nextCursor}&access_token=${token}`
      );
      const mediaData2 = await mediaRes2.json();
      allMedia = allMedia.concat(mediaData2.data || []);
    }

    // Fetch insights for each post (reach, saved, shares)
    // Run in batches of 10 to avoid overwhelming the API
    const BATCH = 10;
    let posts = [];
    for (let i = 0; i < allMedia.length; i += BATCH) {
      const batch = allMedia.slice(i, i + BATCH);
      const batchResults = await Promise.all(
        batch.map(async (post) => {
          try {
            const insightRes = await fetch(
              `https://graph.instagram.com/${post.id}/insights?metric=reach,saved,shares&access_token=${token}`
            );
            const insights = await insightRes.json();

            // Handle both old (values[0].value) and new (value) API response formats
            const getVal = (name) => {
              const m = insights.data?.find(m => m.name === name);
              return m?.value ?? m?.values?.[0]?.value ?? 0;
            };

            return {
              id: post.id,
              caption: post.caption?.substring(0, 80) || '',
              type: post.media_type,
              date: post.timestamp,
              likes: post.like_count || 0,
              comments: post.comments_count || 0,
              reach: getVal('reach'),
              saved: getVal('saved'),
              shares: getVal('shares'),
            };
          } catch {
            return { id: post.id, caption: post.caption?.substring(0,80)||'', type: post.media_type, date: post.timestamp, likes: post.like_count||0, comments: post.comments_count||0, reach: 0, saved: 0, shares: 0 };
          }
        })
      );
      posts = posts.concat(batchResults);
    }

    // Sort by reach descending — best posts always first
    posts.sort((a, b) => b.reach - a.reach);

    // Return clean stats
    res.status(200).json({
      profile: {
        username: profile.username,
        followers: profile.followers_count,
        total_posts: profile.media_count,
      },
      posts,
      fetched_at: new Date().toISOString(),
    });

  } catch (err) {
    console.error('Stats fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
