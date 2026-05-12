// Threads Job Opportunities Monitor
// Uses Apify Threads Search Scraper to find content creator jobs

// Trimmed to best 6 keywords — run sequentially to stay within free plan memory limits
const KEYWORDS = [
  'content creator Malaysia hiring',
  'KOC Malaysia',
  'hiking content creator',
  'videographer Malaysia',
  'outdoor creator Malaysia',
  'kreator konten Malaysia',
];

async function searchKeyword(keyword, apifyToken) {
  try {
    // Start Apify actor run — 256MB memory keeps us within free plan limits
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/igview-owner~threads-search-scraper/runs?token=${apifyToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchQuery: keyword,
          sort: 'recent',
          maxPosts: 10, // minimum required by actor
          memory: 256,  // use 256MB instead of default 4096MB
        }),
      }
    );
    const runData = await runRes.json();
    const runId = runData.data?.id;

    if (!runId) {
      return { keyword, posts: [], error: 'no_run_id', apify_response: runData };
    }

    // Wait for run to finish (poll up to 30 seconds)
    let attempts = 0;
    let status = 'RUNNING';
    while ((status === 'RUNNING' || status === 'READY') && attempts < 10) {
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

    const postArray = Array.isArray(posts) ? posts : [];
    return {
      keyword,
      posts: postArray.map(p => ({
        text: p.text?.substring(0, 200) || '',
        url: p.url || p.post_url || '',
        date: p.created_at || p.timestamp || '',
        likes: p.like_count || 0,
        username: p.username || p.author?.username || '',
      })),
    };
  } catch (e) {
    return { keyword, posts: [], error: e.message };
  }
}

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
    // Run searches SEQUENTIALLY — parallel hits memory limit on free plan
    const results = [];
    for (const keyword of KEYWORDS) {
      const result = await searchKeyword(keyword, apifyToken);
      results.push(result);
    }

    // Flatten all posts
    const allPosts = results.flatMap(r =>
      r.posts.map(p => ({ ...p, searchKeyword: r.keyword }))
    );

    // Light filter — includes Malay + English job/collab terms
    const relevanceKeywords = [
      'hire', 'hiring', 'looking for', 'job', 'vacancy', 'opportunity',
      'join', 'freelance', 'needed', 'wanted', 'dm', 'contact', 'apply',
      'collaboration', 'collab', 'project', 'work with',
      'koc', 'ambassador', 'brand deal', 'sponsored', 'partnership',
      'hiking', 'outdoor', 'sport', 'trail', 'adventure',
      'cari', 'kerja', 'jawatan', 'ambil', 'diperlukan', 'hubungi',
      'kolaborasi', 'peluang', 'tawaran', 'budget', 'sukan', 'alam',
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

    // Fallback: if filter returns nothing, show all raw results
    const seen2 = new Set();
    const allUnique = allPosts.filter(p => {
      if (!p.url || seen2.has(p.url)) return false;
      seen2.add(p.url);
      return true;
    });
    const finalJobs = uniqueJobs.length > 0 ? uniqueJobs : allUnique;

    res.status(200).json({
      jobs: finalJobs.slice(0, 15),
      total_found: finalJobs.length,
      keywords_searched: KEYWORDS,
      fetched_at: new Date().toISOString(),
      _debug: {
        raw_posts: allPosts.length,
        filtered_posts: jobPosts.length,
        errors: results.filter(r => r.error).map(r => ({ keyword: r.keyword, error: r.error })),
      },
    });

  } catch (err) {
    console.error('Job opportunities error:', err);
    res.status(500).json({ error: 'Failed to fetch job opportunities', message: err.message });
  }
}
