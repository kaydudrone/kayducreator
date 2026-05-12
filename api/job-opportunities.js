// Threads Job Opportunities Monitor
// Uses Apify Threads Search Scraper to find content creator jobs

const KEYWORDS = [
  'content creator Malaysia hiring',
  'videographer Malaysia',
  'drone pilot Malaysia',
  'video editor Malaysia',
  'kreator konten Malaysia',
  'content creator KL',
  'photographer videographer hired',
  'social media creator Malaysia',
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://kayducreator.com');
  res.setHeader('Cache-Control', 's-maxage=3600'); // Cache 1 hour — avoid excessive Apify costs

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
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
                maxPosts: 8, // 8 per keyword = ~64 raw posts across 8 keywords
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

    // Flatten all posts — search keywords are already targeted enough
    const allPosts = results.flatMap(r =>
      r.posts.map(p => ({ ...p, searchKeyword: r.keyword }))
    );

    // Light filter: exclude clearly irrelevant posts (no text, or just tourist posts)
    // Allow Malay terms: cari, kerja, ambil, join, dm, hubungi, kolaborasi, kreator
    const relevanceKeywords = [
      'hire', 'hiring', 'looking for', 'job', 'vacancy', 'opportunity',
      'join', 'freelance', 'needed', 'wanted', 'dm', 'contact', 'apply',
      'collaboration', 'collab', 'project', 'work with',
      // Malay terms
      'cari', 'kerja', 'jawatan', 'ambil', 'diperlukan', 'hubungi',
      'kolaborasi', 'peluang', 'tawaran', 'budjet', 'budget',
      'creator', 'videographer', 'photographer', 'editor',
    ];

    const jobPosts = allPosts.filter(p =>
      p.text && relevanceKeywords.some(k => p.text.toLowerCase().includes(k))
    );

    // Deduplicate by URL
    const seen = new Set();
    const uniqueJobs = jobPosts.filter(p => {
      if (!p.url || seen.has(p.url)) return false;
      seen.add(p.url);
      return true;
    });

    // If still nothing after filter, return all results (search was targeted)
    const finalJobs = uniqueJobs.length > 0 ? uniqueJobs : allPosts.filter(p => {
      if (!p.url || seen.has(p.url)) return false;
      seen.add(p.url);
      return true;
    });

    res.status(200).json({
      jobs: finalJobs.slice(0, 15), // Up to 15 results
      total_found: finalJobs.length,
      keywords_searched: KEYWORDS,
      fetched_at: new Date().toISOString(),
    });

  } catch (err) {
    console.error('Job opportunities error:', err);
    res.status(500).json({ error: 'Failed to fetch job opportunities', message: err.message });
  }
}
