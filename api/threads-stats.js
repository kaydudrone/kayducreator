// Threads Stats API
// Fetches your Threads profile stats and recent posts

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://kayducreator.com');
  res.setHeader('Cache-Control', 's-maxage=3600');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.THREADS_ACCESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'No Threads access token configured' });
  }

  try {
    // Fetch profile info
    const profileRes = await fetch(
      `https://graph.threads.net/v1.0/me?fields=id,username,name,threads_profile_picture_url,threads_biography,followers_count&access_token=${token}`
    );
    const profile = await profileRes.json();

    if (profile.error) {
      return res.status(401).json({ error: 'Token expired or invalid', message: profile.error.message });
    }

    // Fetch recent posts
    const postsRes = await fetch(
      `https://graph.threads.net/v1.0/me/threads?fields=id,text,media_type,timestamp,like_count,replies_count,repost_count,views&limit=10&access_token=${token}`
    );
    const postsData = await postsRes.json();

    // Fetch account insights
    const insightsRes = await fetch(
      `https://graph.threads.net/v1.0/me/threads_publishing_limit?fields=config,quota_usage&access_token=${token}`
    );
    const insightsData = await insightsRes.json();

    const posts = (postsData.data || []).map(p => ({
      id: p.id,
      text: p.text?.substring(0, 150) || '',
      type: p.media_type,
      date: p.timestamp,
      likes: p.like_count || 0,
      replies: p.replies_count || 0,
      reposts: p.repost_count || 0,
      views: p.views || 0,
    }));

    // Calculate totals from recent posts
    const totalLikes = posts.reduce((a, p) => a + p.likes, 0);
    const totalViews = posts.reduce((a, p) => a + p.views, 0);
    const avgLikes = posts.length > 0 ? Math.round(totalLikes / posts.length) : 0;

    res.status(200).json({
      profile: {
        username: profile.username,
        name: profile.name,
        followers: profile.followers_count || 0,
        bio: profile.threads_biography || '',
      },
      posts,
      summary: {
        total_posts_fetched: posts.length,
        total_likes: totalLikes,
        total_views: totalViews,
        avg_likes: avgLikes,
      },
      fetched_at: new Date().toISOString(),
    });

  } catch (err) {
    console.error('Threads stats error:', err);
    res.status(500).json({ error: 'Failed to fetch Threads stats', message: err.message });
  }
}
