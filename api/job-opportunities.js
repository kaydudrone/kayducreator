// Threads Job Opportunities Monitor
// Uses Apify Threads Search Scraper to find content creator jobs

const KEYWORDS = [
  'content creator Malaysia',
  'videographer job Malaysia',
  'drone pilot job',
  'video editor KL',
  'content creator hired',
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://kayducreator.com');
  res.setHeader('Cache-Control', 's-maxage=3600'); // Cache 1 hour — avoid excessive Apify costs

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.DASHBOARD_SECRET;
  if (secret && req.headers['x-dashboard-token'] !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const apifyToken = process.env.APIFY_TOKEN;
  if (!apifyToken) {
    return res.status(500).json({ error: 'No Apify token configured' });
  }

  try {
    // Run searches for all keywords in parallel
    const results = await Promise.all(
      KEYWORDS.map(async (keyword) => {
        try {
          // Start Apify actor run
          const runRes = await fetch(
            `https://api.apify.com/v2/acts/igview-owner~threads-search-scraper/runs?token=${apifyToken}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                searchQuery: keyword,
                sort: 'recent',
                maxPosts: 5, // Keep costs low — 5 results per keyword
              }),
            }
          );
          const runData = await runRes.json();
          const runId = runData.data?.id;

          if (!runId) return { keyword, posts: [] };

          // Wait for run to finish (poll up to 30 seconds)
          let attempts = 0;
          let status = 'RUNNING';
          while (status === 'RUNNING' && attempts < 10) {
            await new Promise(r => setTimeout(r, 3000));
            const statusRes = await fetch(
              `https://api.apify.com/v2/acts/igview-owner~threads-search-scraper/runs/${runId}?token=${apifyToken}`
            );
            const statusData = await statusRes.json();
            status = statusData.data?.status;
            attempts++;
          }

          // Get results
          const dataRes = await fetch(
            `https://api.apify.com/v2/acts/igview-owner~threads-search-scraper/runs/${runId}/dataset/items?token=${apifyToken}`
          );
          const posts = await dataRes.json();

          return {
            keyword,
            posts: (posts || []).map(p => ({
              text: p.text?.substring(0, 200) || '',
              url: p.url || p.post_url || '',
              date: p.created_at || p.timestamp || '',
              likes: p.like_count || 0,
              username: p.username || p.author?.username || '',
            })),
          };
        } catch {
          return { keyword, posts: [] };
        }
      })
    );

    // Flatten and filter posts that look like job opportunities
    const jobKeywords = ['hire', 'hiring', 'looking for', 'job', 'vacancy', 'opportunity', 'join', 'freelance', 'needed', 'wanted', 'dm me'];
    const allPosts = results.flatMap(r =>
      r.posts.map(p => ({ ...p, searchKeyword: r.keyword }))
    );

    const jobPosts = allPosts.filter(p =>
      jobKeywords.some(k => p.text.toLowerCase().includes(k))
    );

    // Deduplicate by URL
    const seen = new Set();
    const uniqueJobs = jobPosts.filter(p => {
      if (!p.url || seen.has(p.url)) return false;
      seen.add(p.url);
      return true;
    });

    res.status(200).json({
      jobs: uniqueJobs.slice(0, 10), // Max 10 results
      total_found: uniqueJobs.length,
      keywords_searched: KEYWORDS,
      fetched_at: new Date().toISOString(),
    });

  } catch (err) {
    console.error('Job opportunities error:', err);
    res.status(500).json({ error: 'Failed to fetch job opportunities', message: err.message });
  }
}
