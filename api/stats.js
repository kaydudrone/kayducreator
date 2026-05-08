// Instagram Stats API
// Fetches your latest IG stats and returns them as JSON for the dashboard

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://kayducreator.com');
  res.setHeader('Cache-Control', 's-maxage=3600');

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Shared secret check — blocks direct curl/script abuse
  const secret = process.env.DASHBOARD_SECRET;
  if (secret && req.headers['x-dashboard-token'] !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
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

    // Fetch latest 10 posts with insights
    const mediaRes = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,timestamp,like_count,comments_count,thumbnail_url,media_url&limit=10&access_token=${token}`
    );
    const mediaData = await mediaRes.json();

    // Fetch insights for each post (reach, saved, shares)
    const posts = await Promise.all(
      (mediaData.data || []).map(async (post) => {
        try {
          const insightRes = await fetch(
            `https://graph.instagram.com/${post.id}/insights?metric=reach,saved,shares&access_token=${token}`
          );
          const insights = await insightRes.json();

          const reach = insights.data?.find(m => m.name === 'reach')?.values?.[0]?.value || 0;
          const saved = insights.data?.find(m => m.name === 'saved')?.values?.[0]?.value || 0;
          const shares = insights.data?.find(m => m.name === 'shares')?.values?.[0]?.value || 0;

          return {
            id: post.id,
            caption: post.caption?.substring(0, 80) || '',
            type: post.media_type,
            date: post.timestamp,
            likes: post.like_count || 0,
            comments: post.comments_count || 0,
            reach,
            saved,
            shares,
          };
        } catch {
          return { ...post, reach: 0, saved: 0, shares: 0 };
        }
      })
    );

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
