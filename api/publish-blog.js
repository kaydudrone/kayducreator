import { Octokit } from '@octokit/rest';

// Simple markdown → HTML converter (paragraphs, headings, lists, bold, italic, blockquotes)
function mdToHtml(md) {
  if (!md) return '';
  const lines = md.split('\n');
  const html = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,     '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    if (line.startsWith('### ')) {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<h3 class="fade-up">${line.slice(4)}</h3>`);
    } else if (line.startsWith('## ')) {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<h2 class="fade-up">${line.slice(3)}</h2>`);
    } else if (line.startsWith('> ')) {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<blockquote class="fade-up"><p>${line.slice(2)}</p></blockquote>`);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) { html.push('<ul class="fade-up">'); inList = true; }
      html.push(`  <li>${line.slice(2)}</li>`);
    } else if (line.trim() === '') {
      if (inList) { html.push('</ul>'); inList = false; }
    } else {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<p class="fade-up">${line}</p>`);
    }
  }
  if (inList) html.push('</ul>');
  return html.join('\n      ');
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function buildBlogHtml({ title, slug, metaDesc, location, difficulty, distance, peak, coverImage, content, gpxUrl, videoUrl, publishDate }) {
  const year = new Date(publishDate).getFullYear() || new Date().getFullYear();
  const dateFormatted = new Date(publishDate).toLocaleDateString('en-MY', { year:'numeric', month:'long', day:'numeric' });
  const bodyHtml = mdToHtml(content);

  const gpxBtn = gpxUrl
    ? `<a href="${gpxUrl}" class="cta-btn cta-btn-primary" download>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download GPX File
      </a>` : '';

  const videoBtn = videoUrl
    ? `<a href="${videoUrl}" class="cta-btn cta-btn-secondary" target="_blank" rel="noopener noreferrer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
        Watch on Instagram
      </a>` : '';

  const distanceStat = distance
    ? `<div class="stat-item"><div class="stat-val">${parseFloat(distance).toFixed(1)} km</div><div class="stat-lbl">Distance</div></div>` : '';
  const peakStat = peak
    ? `<div class="stat-item"><div class="stat-val">${Math.round(peak)} m</div><div class="stat-lbl">Peak</div></div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<script async src="https://www.googletagmanager.com/gtag/js?id=G-5QCJQYYH49"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-5QCJQYYH49');</script>
<title>${title} · Kay Du</title>
<meta name="description" content="${metaDesc}" />
<link rel="canonical" href="https://kayducreator.com/${slug}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="https://kayducreator.com/${slug}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${metaDesc}" />
<meta property="og:image" content="${coverImage}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${metaDesc}" />
<meta name="twitter:image" content="${coverImage}" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BlogPosting","headline":"${title}","image":"${coverImage}","author":{"@type":"Person","name":"Kay Du","url":"https://kayducreator.com"},"publisher":{"@type":"Person","name":"Kay Du","url":"https://kayducreator.com"},"datePublished":"${publishDate}","dateModified":"${publishDate}","description":"${metaDesc}"}
</script>
<link rel="icon" type="image/png" href="/so_hikers_logo_transparent.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&family=Droid+Serif:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--primary:#1d8aab;--primary-dark:#145f76;--primary-light:#e8f6fa;--bg:#f5f4ef;--surface:#ffffff;--ink:#1a1a1a;--ink-soft:#3d3d3a;--muted:#6b6960;--line:rgba(0,0,0,.07);--shadow:0 4px 24px rgba(0,0,0,.06);--radius:20px;--prose-w:700px}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--ink);line-height:1.6}
nav{position:sticky;top:0;z-index:100;background:rgba(245,244,239,.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--line);padding:0 24px;height:56px;display:flex;align-items:center;justify-content:space-between}
.nav-brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:.95rem;color:var(--ink);text-decoration:none}
.nav-brand img{width:28px;height:28px;object-fit:contain}
.nav-links{display:flex;align-items:center;gap:6px}
.nav-link{padding:.4rem .85rem;border-radius:999px;font-size:.8rem;font-weight:500;color:var(--muted);text-decoration:none;transition:.2s}
.nav-link:hover{background:rgba(29,138,171,.08);color:var(--primary)}
.nav-link.active{background:var(--primary);color:#fff}
.hero{position:relative;height:min(70vh,560px);overflow:hidden}
.hero-img{width:100%;height:100%;object-fit:cover}
.hero-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.75) 0%,rgba(0,0,0,.2) 50%,transparent 100%)}
.hero-content{position:absolute;bottom:0;left:0;right:0;padding:clamp(24px,5vw,56px) clamp(20px,5vw,120px)}
.hero-eyebrow{font-family:'DM Mono',monospace;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.7);margin-bottom:10px}
.hero-title{font-family:'Droid Serif',serif;font-size:clamp(1.6rem,4vw,2.8rem);font-weight:700;color:#fff;line-height:1.2;margin-bottom:14px;max-width:700px}
.hero-meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.hero-date{font-size:.78rem;color:rgba(255,255,255,.65)}
.hero-tag{background:rgba(255,255,255,.15);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:.25rem .75rem;font-size:.72rem;color:#fff;font-weight:500}
.stats-bar{background:#fff;border-bottom:1px solid var(--line);padding:20px clamp(20px,5vw,120px);display:flex;align-items:center;gap:32px;flex-wrap:wrap}
.stat-item{display:flex;flex-direction:column;gap:2px}
.stat-val{font-family:'DM Mono',monospace;font-size:1rem;font-weight:500;color:var(--primary)}
.stat-lbl{font-size:.68rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)}
.section{padding:clamp(40px,6vw,72px) 0}
.prose-container{width:min(var(--prose-w),calc(100% - 2.5rem));margin:0 auto}
.prose{display:flex;flex-direction:column;gap:1.5rem}
.prose p{font-family:'Droid Serif',serif;font-size:1.05rem;line-height:1.85;color:var(--ink-soft)}
.prose h2{font-size:1.5rem;font-weight:700;color:var(--ink);padding-top:.5rem;border-top:2px solid var(--primary-light)}
.prose h3{font-size:1.15rem;font-weight:700;color:var(--ink)}
.prose blockquote{border-left:3px solid var(--primary);padding:14px 20px;background:var(--primary-light);border-radius:0 12px 12px 0}
.prose blockquote p{color:var(--primary-dark);font-style:italic}
.prose ul,.prose ol{padding-left:1.4rem;display:flex;flex-direction:column;gap:.5rem}
.prose ul li,.prose ol li{font-size:1.05rem;line-height:1.8;color:var(--ink-soft)}
.prose strong{color:var(--ink);font-weight:700}
.prose a{color:var(--primary);text-decoration:underline}
.cta-section{background:var(--primary);padding:48px 24px;text-align:center}
.cta-title{font-size:1.3rem;font-weight:700;color:#fff;margin-bottom:8px}
.cta-sub{color:rgba(255,255,255,.75);font-size:.9rem;margin-bottom:24px}
.cta-btns{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}
.cta-btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:999px;font-size:.9rem;font-weight:600;text-decoration:none;transition:.2s}
.cta-btn:hover{transform:translateY(-2px)}
.cta-btn-primary{background:#fff;color:var(--primary)}
.cta-btn-secondary{background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.3)}
footer{background:#1a2332;color:rgba(255,255,255,.6);padding:32px 24px;text-align:center;font-size:.82rem}
footer a{color:rgba(255,255,255,.8);text-decoration:none}
.fade-up{opacity:0;transform:translateY(18px);transition:opacity .5s ease,transform .5s ease}
.fade-up.visible{opacity:1;transform:translateY(0)}
@media(max-width:640px){.stats-bar{gap:20px}.hero-title{font-size:1.5rem}}
</style>
</head>
<body>

<nav>
  <a href="/" class="nav-brand">
    <img src="/so_hikers_logo_transparent.png" alt="Kay Du" onerror="this.style.display='none'" />
    Kay Du
  </a>
  <div class="nav-links">
    <a href="/#trails" class="nav-link">Trails</a>
    <a href="/blog.html" class="nav-link active">Blog</a>
    <a href="/media-kit" class="nav-link">Media Kit</a>
  </div>
</nav>

<!-- HERO -->
<div class="hero">
  <img src="${coverImage}" alt="${title}" class="hero-img" />
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <div class="hero-eyebrow">📍 ${location}</div>
    <h1 class="hero-title">${title}</h1>
    <div class="hero-meta">
      <span class="hero-date">By Kay Du · ${dateFormatted}</span>
      ${difficulty ? `<span class="hero-tag">${difficulty}</span>` : ''}
    </div>
  </div>
</div>

<!-- STATS BAR -->
${(distanceStat || peakStat || difficulty) ? `<div class="stats-bar">
  ${difficulty ? `<div class="stat-item"><div class="stat-val">${difficulty}</div><div class="stat-lbl">Difficulty</div></div>` : ''}
  ${distanceStat}
  ${peakStat}
  <div class="stat-item"><div class="stat-val">Kay Du</div><div class="stat-lbl">Author</div></div>
</div>` : ''}

<!-- CONTENT -->
<article class="section">
  <div class="prose-container">
    <div class="prose">
      ${bodyHtml}
    </div>
  </div>
</article>

<!-- CTA -->
${(gpxBtn || videoBtn) ? `<div class="cta-section">
  <div class="cta-title">Ready to hike ${location}?</div>
  <div class="cta-sub">Download the GPX file or watch the full video on Instagram.</div>
  <div class="cta-btns">
    ${gpxBtn}
    ${videoBtn}
  </div>
</div>` : ''}

<!-- FOOTER -->
<footer>
  <p style="margin-bottom:8px">
    <a href="/">kayducreator.com</a> · 60 Mountains Malaysia Challenge
  </p>
  <p>© ${year} Kay Du. All rights reserved.</p>
</footer>

<script>
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
</script>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const {
      title, slug: rawSlug, metaDesc, location, difficulty,
      distance, peak, coverImage, content,
      gpxUrl, videoUrl, publishDate,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'title and content are required' });
    }

    const slug        = rawSlug || slugify(title);
    const date        = publishDate || new Date().toISOString().split('T')[0];
    const htmlContent = buildBlogHtml({ title, slug, metaDesc, location, difficulty, distance, peak, coverImage, content, gpxUrl, videoUrl, publishDate: date });

    const octokit = new Octokit({ auth: process.env.GITHUB_PAT });
    const owner   = process.env.GITHUB_OWNER || 'kaydudrone';
    const repo    = process.env.GITHUB_REPO  || 'kayduhikingcreator';

    // ── 1. Commit blog post HTML ──────────────────────────────────
    let postSha;
    try {
      const existing = await octokit.repos.getContent({ owner, repo, path: `${slug}.html` });
      postSha = existing.data.sha;
    } catch (_) {}

    await octokit.repos.createOrUpdateFileContents({
      owner, repo,
      path: `${slug}.html`,
      message: `blog: publish "${title}"`,
      content: Buffer.from(htmlContent).toString('base64'),
      ...(postSha ? { sha: postSha } : {}),
    });

    // ── 2. Update blogs.json index ────────────────────────────────
    let blogsSha;
    let blogs = [];
    try {
      const { data } = await octokit.repos.getContent({ owner, repo, path: 'content/blogs.json' });
      blogsSha = data.sha;
      blogs = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    } catch (_) {}

    // Upsert entry
    const existing = blogs.findIndex(b => b.slug === slug);
    const entry = { slug, title, metaDesc, location, difficulty, coverImage, publishDate: date, updatedAt: new Date().toISOString() };
    if (existing >= 0) blogs[existing] = entry;
    else blogs.unshift(entry); // newest first

    await octokit.repos.createOrUpdateFileContents({
      owner, repo,
      path: 'content/blogs.json',
      message: `update: blogs.json — add "${title}"`,
      content: Buffer.from(JSON.stringify(blogs, null, 2)).toString('base64'),
      ...(blogsSha ? { sha: blogsSha } : {}),
    });

    return res.status(200).json({ success: true, slug, url: `https://kayducreator.com/${slug}` });

  } catch (err) {
    console.error('publish-blog error:', err);
    return res.status(500).json({ error: err.message });
  }
}
