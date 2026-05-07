// YouTube Stats API
// Fetches channel stats and latest videos for the dashboard

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600'); // Cache 1 hour

  const apiKey = process.env.YT_API_KEY;
  const channelId = 'UCKPBoGOccuNArR6eJgnPPKg';

  if (!apiKey) {
    return res.status(500).json({ error: 'No YouTube API key configured' });
  }

  try {
    // Fetch channel stats
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${apiKey}`
    );
    const channelData = await channelRes.json();

    if (!channelData.items || channelData.items.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const stats = channelData.items[0].statistics;
    const snippet = channelData.items[0].snippet;

    // Fetch latest 10 videos
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=10&order=date&type=video&key=${apiKey}`
    );
    const videosData = await videosRes.json();

    // Get video IDs for view counts
    const videoIds = (videosData.items || []).map(v => v.id.videoId).join(',');

    let videos = [];
    if (videoIds) {
      const videoStatsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${apiKey}`
      );
      const videoStatsData = await videoStatsRes.json();

      videos = (videoStatsData.items || []).map(v => ({
        id: v.id,
        title: v.snippet.title,
        date: v.snippet.publishedAt,
        views: parseInt(v.statistics.viewCount || 0),
        likes: parseInt(v.statistics.likeCount || 0),
        comments: parseInt(v.statistics.commentCount || 0),
        thumbnail: v.snippet.thumbnails?.medium?.url,
      }));
    }

    res.status(200).json({
      channel: {
        name: snippet.title,
        subscribers: parseInt(stats.subscriberCount || 0),
        total_views: parseInt(stats.viewCount || 0),
        total_videos: parseInt(stats.videoCount || 0),
      },
      videos,
      fetched_at: new Date().toISOString(),
    });

  } catch (err) {
    console.error('YouTube stats error:', err);
    res.status(500).json({ error: 'Failed to fetch YouTube stats' });
  }
}
