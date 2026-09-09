// ── SECRET LOGO TAP (5x → admin login) ───────────────────────────────
(function(){
  const logo    = document.getElementById('footerLogo');
  const hint    = document.getElementById('footerTapHint');
  const TAPS    = 5;
  let count     = 0;
  let resetTimer;

  logo.addEventListener('click', () => {
    count++;
    clearTimeout(resetTimer);
    logo.classList.add('tapping');

    const remaining = TAPS - count;
    if (remaining > 0) {
      hint.textContent = remaining === 1 ? 'one more…' : remaining + ' more taps';
    }

    if (count >= TAPS) {
      count = 0;
      hint.textContent = '· · ·';
      logo.classList.remove('tapping');

      // Redirect to admin login → lands on dashboard after auth
      window.location.href = '/admin/login?from=/dashboard.html';

      return;
    }

    resetTimer = setTimeout(() => {
      count = 0;
      hint.textContent = '· · ·';
      logo.classList.remove('tapping');
    }, 3000);
  });
})();

// Fade-up on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible') });
}, {threshold: 0.08});
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// Animate progress bar + count-up on load
window.addEventListener('load', () => {
  setTimeout(() => {
    // Bar spring animation
    const bar = document.getElementById('progress-bar');
    if(bar) bar.style.width = '43%';

    // Count-up with spring overshoot: 0 → 26 → 25
    const countEl = document.getElementById('progress-count');
    if(!countEl) return;
    const target = 26;
    const overshoot = 27;
    const duration = 1000; // ms to reach overshoot
    const start = performance.now();

    function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      // Overshoot phase: 0 → 16
      const current = Math.round(eased * overshoot);
      countEl.textContent = current;
      if(progress < 1) { requestAnimationFrame(tick); return; }
      // Snap-back phase: 16 → 15 after 120ms
      countEl.textContent = overshoot;
      setTimeout(() => { countEl.textContent = target; }, 120);
    }
    requestAnimationFrame(tick);
  }, 400);
});

// Close route modal on Escape key
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    document.getElementById('routeModal')?.classList.remove('open');
    closeGallery();
  }
});

// ── MY STORY DROPDOWN ──────────────────────────────────────────
const storyDropdown = document.getElementById('storyDropdown');
const storyToggle   = document.getElementById('storyToggle');
storyToggle?.addEventListener('click', e => {
  e.stopPropagation();
  storyDropdown.classList.toggle('open');
});
document.addEventListener('click', e => {
  if (!storyDropdown?.contains(e.target)) storyDropdown?.classList.remove('open');
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') storyDropdown?.classList.remove('open');
});

// ── HAMBURGER NAV ──────────────────────────────────────────────
const hamburger = document.getElementById('navHamburger');
const navMobile  = document.getElementById('navMobile');
const navClose   = document.getElementById('navClose');

function openNav(){
  hamburger.classList.add('open');
  navMobile.classList.add('open');
  navMobile.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden'; // lock scroll
}
function closeNav(){
  hamburger.classList.remove('open');
  navMobile.classList.remove('open');
  navMobile.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}

hamburger?.addEventListener('click', e => {
  e.stopPropagation();
  navMobile.classList.contains('open') ? closeNav() : openNav();
});

navClose?.addEventListener('click', closeNav);

// Close when any link inside the drawer is tapped
navMobile?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeNav);
});

// Close on Escape key
document.addEventListener('keydown', e => {
  if(e.key === 'Escape') closeNav();
});

// ── GALLERY LIGHTBOX ──────────────────────────────────────────
// To add more photos to a gallery, just add more image paths to the arrays below.
const galleries = {
  kinabalu: {
    title: 'Mount Kinabalu',
    photos: [
      'images/kk_1.webp',
      'images/kk_2.webp',
      'images/kk_3.webp',
      'images/kk_4.webp',
      'images/kk_5.webp',
      'images/kk_6.webp',
      'images/kk_7.webp',
      'images/kk_8.webp',
      'images/kk_9.webp',
      'images/kk_10.webp',
      'images/kk_11.webp',
      'images/kk_12.webp',
      'images/kk_13.webp',
      'images/kk_14.webp',
      'images/kk_15.webp',
      'images/kk_16.webp',
      'images/kk_17.webp',
      'images/kk_18.webp',
      'images/kk_19.webp',
      'images/kk_20.webp',
      'images/kk_21.webp',
      // Add more Kinabalu photos here, e.g.: 'images/kk_22.webp',
    ]
  },
  rinjani: {
    title: 'Gunung Rinjani',
    photos: [
      'images/rinjani_4.webp',
      'images/rinjani_5.webp',
      'images/rinjani_6.webp',
      'images/rinjani_7.webp',
      'images/rinjani_8.webp',
      'images/rinjani_9.webp',
      'images/rinjani_10.webp',
      'images/rinjani_11.webp',
      'images/rinjani_12.webp',
      'images/rinjani_13.webp',
      'images/rinjani_14.webp',
      'images/rinjani_15.webp',
      'images/rinjani_16.webp',
      // Add more Rinjani photos here, e.g.: 'images/rinjani_17.webp',
    ]
  },
  bromo: {
    title: 'Bromo · Tumpak Sewu · Ijen',
    photos: [
      'images/bromo_1.webp',
      'images/bromo_2.webp',
      'images/bromo_3.webp',
      'images/bromo_4.webp',
      'images/bromo_5.webp',
      'images/bromo_6.webp',
      'images/bromo_7.webp',
      'images/bromo_8.webp',
      // Add more Bromo photos here, e.g.: 'images/bromo_9.jpg',
    ]
  }
};

let currentGallery = null;
let currentIndex   = 0;

function openGallery(key) {
  currentGallery = key;
  currentIndex   = 0;
  renderGallery();
  document.getElementById('galleryModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeGallery() {
  document.getElementById('galleryModal').classList.remove('open');
  document.body.style.overflow = '';
}

function renderGallery() {
  const data   = galleries[currentGallery];
  const photos = data.photos;
  const total  = photos.length;
  const modal  = document.getElementById('galleryModal');

  modal.querySelector('.glb-title').textContent   = data.title;
  modal.querySelector('.glb-counter').textContent = total ? `${currentIndex + 1} / ${total}` : '';

  const stage = modal.querySelector('.glb-stage');
  stage.querySelectorAll('.glb-img,.glb-empty').forEach(el => el.remove());
  if (total === 0) {
    const msg = document.createElement('p');
    msg.className = 'glb-empty';
    msg.textContent = 'No photos yet — add some image paths in the galleries object!';
    stage.appendChild(msg);
  } else {
    const img = document.createElement('img');
    img.className = 'glb-img';
    img.src = photos[currentIndex];
    img.alt = data.title;
    stage.appendChild(img);
  }

  modal.querySelector('.glb-arrow.prev').disabled = currentIndex === 0;
  modal.querySelector('.glb-arrow.next').disabled = currentIndex >= total - 1;

  const thumbsEl = modal.querySelector('.glb-thumbs');
  thumbsEl.innerHTML = '';
  photos.forEach((src, i) => {
    const t = document.createElement('img');
    t.className = 'glb-thumb' + (i === currentIndex ? ' active' : '');
    t.src = src;
    t.alt = data.title + ' ' + (i + 1);
    t.addEventListener('click', () => { currentIndex = i; renderGallery(); });
    thumbsEl.appendChild(t);
  });
  if (total > 0) thumbsEl.children[currentIndex]?.scrollIntoView({inline:'center',behavior:'smooth'});
}

function galleryNav(dir) {
  const total = galleries[currentGallery].photos.length;
  currentIndex = Math.max(0, Math.min(total - 1, currentIndex + dir));
  renderGallery();
}

// Inject modal HTML
document.body.insertAdjacentHTML('beforeend', `
<div id="galleryModal" role="dialog" aria-modal="true" aria-label="Photo gallery">
  <div class="glb-header">
    <span class="glb-title"></span>
    <span class="glb-counter"></span>
    <button class="glb-close" onclick="closeGallery()" aria-label="Close gallery">&#x2715;</button>
  </div>
  <div class="glb-stage">
    <button class="glb-arrow prev" onclick="galleryNav(-1)">&#8249;</button>
    <button class="glb-arrow next" onclick="galleryNav(1)">&#8250;</button>
  </div>
  <div class="glb-thumbs"></div>
</div>
`);

// Open gallery on card click
document.querySelectorAll('.beyond-card[data-gallery]').forEach(card => {
  card.addEventListener('click', () => openGallery(card.dataset.gallery));
});

// Close on backdrop click
document.getElementById('galleryModal').addEventListener('click', function(e){
  if(e.target === this) closeGallery();
});

// Keyboard navigation
document.addEventListener('keydown', e => {
  if(!document.getElementById('galleryModal').classList.contains('open')) return;
  if(e.key === 'ArrowRight') galleryNav(1);
  if(e.key === 'ArrowLeft')  galleryNav(-1);
});

// Touch swipe support for lightbox
(function(){
  let touchStartX = 0;
  const modal = document.getElementById('galleryModal');
  modal.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, {passive:true});
  modal.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if(Math.abs(diff) > 40) galleryNav(diff > 0 ? 1 : -1);
  }, {passive:true});
})();

// Trail difficulty filter + search
(function() {
  const btns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('#trailGrid .trail-card');
  const searchInput = document.getElementById('trailSearch');
  const emptyMsg = document.getElementById('trailEmpty');
  let activeFilter = 'all';

  // Multi-route trails carry more than one .difficulty badge, so match against all of them.
  function hasDifficulty(card, diff) {
    return [...card.querySelectorAll('.difficulty')].some(b => b.classList.contains('diff-' + diff));
  }

  // Label each filter with its live count — a hardcoded number goes stale on every new trail.
  btns.forEach(btn => {
    const diff = btn.dataset.filter;
    const n = diff === 'all'
      ? cards.length
      : [...cards].filter(card => hasDifficulty(card, diff)).length;
    btn.textContent = btn.textContent.replace(/\s*\(\d+\)\s*$/, '').trim() + ' (' + n + ')';
  });

  function applyFilters() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    let shown = 0;
    cards.forEach(card => {
      const matchesDifficulty = activeFilter === 'all' || hasDifficulty(card, activeFilter);
      const name = card.querySelector('.trail-name')?.textContent.toLowerCase() || '';
      const loc = card.querySelector('.trail-loc')?.textContent.toLowerCase() || '';
      const matchesSearch = !query || name.includes(query) || loc.includes(query);
      const matches = matchesDifficulty && matchesSearch;
      card.style.display = matches ? '' : 'none';
      if (matches) shown++;
    });
    if (emptyMsg) emptyMsg.style.display = shown === 0 ? 'block' : 'none';
  }

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  searchInput?.addEventListener('input', applyFilters);
})();

// Back to top
(function(){
  const btn = document.getElementById('backToTop');
  if(!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, {passive:true});
  btn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
})();

// ── 2026 COUNTDOWN (live, client-side) ─────────────────────────
(function(){
  const box = document.getElementById('cdDigits');
  if(!box) return;

  // Trail count self-syncs from the cards on this page
  const trailsEl = document.getElementById('cdTrails');
  if(trailsEl){
    const n = document.querySelectorAll('#trailGrid .trail-card').length;
    if(n > 0) trailsEl.textContent = n;
  }

  const target = new Date('2026-12-31T23:59:59');
  const pad = n => String(n).padStart(2, '0');
  const LABELS = ['Months','Days','Hours','Minutes','Seconds'];

  box.innerHTML = LABELS.map((l,i) =>
    `<div class="cd-unit"><div class="cd-val">00</div><div class="cd-lbl">${l}</div></div>` +
    (i < 4 ? '<div class="cd-sep">:</div>' : '')
  ).join('');
  const cells = [...box.querySelectorAll('.cd-val')];

  function remaining(){
    const now = new Date();
    // Calendar months first, remainder as d/h/m/s
    let months = 0, cursor = new Date(now);
    if(target > now){
      for(;;){
        const next = new Date(cursor);
        next.setMonth(next.getMonth() + 1);
        if(next > target) break;
        cursor = next; months++;
      }
    }
    let rem = Math.max(0, target - cursor);
    const d = Math.floor(rem / 864e5); rem -= d * 864e5;
    const h = Math.floor(rem / 36e5);  rem -= h * 36e5;
    const m = Math.floor(rem / 6e4);   rem -= m * 6e4;
    return [months, d, h, m, Math.floor(rem / 1e3)];
  }

  // The clock runs from first paint. `locked` is how many cells the clock
  // owns; the spin below borrows the rest for about a second.
  let locked = cells.length;
  function tick(){
    const real = remaining();
    cells.forEach((el,i) => { if(i < locked) el.textContent = pad(real[i]); });
  }
  tick();
  setInterval(tick, 1000);

  // Decoration only: scramble the digits, then lock them left to right so the
  // numbers read as counted rather than printed.
  function spin(){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    locked = 0;
    const iv = setInterval(() => {
      cells.forEach((el,i) => {
        if(i >= locked) el.textContent = pad(Math.floor(Math.random()*60));
      });
    }, 55);
    cells.forEach((el,i) => setTimeout(() => {
      locked = i + 1;
      el.classList.add('cd-lock');
      tick();
      if(locked === cells.length) clearInterval(iv);
    }, 420 + i * 170));
  }

  new IntersectionObserver((entries, obs) => {
    if(entries[0].isIntersecting){ obs.disconnect(); spin(); }
  }, {threshold:.4}).observe(box);
})();
