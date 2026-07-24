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
    if(bar) bar.style.width = '35%';

    // Count-up with spring overshoot: 0 → 21 → 20
    const countEl = document.getElementById('progress-count');
    if(!countEl) return;
    const target = 21;
    const overshoot = 22;
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
      'images/kk_1.jpg',
      'images/kk_2.jpg',
      'images/kk_3.jpg',
      'images/kk_4.jpg',
      'images/kk_5.jpg',
      'images/kk_6.jpg',
      'images/kk_7.jpg',
      'images/kk_8.jpg',
      'images/kk_9.jpg',
      'images/kk_10.jpg',
      'images/kk_11.jpg',
      'images/kk_12.jpg',
      'images/kk_13.jpg',
      'images/kk_14.jpg',
      'images/kk_15.jpg',
      'images/kk_16.jpg',
      'images/kk_17.jpg',
      'images/kk_18.jpg',
      'images/kk_19.jpg',
      'images/kk_20.jpg',
      'images/kk_21.jpg',
      // Add more Kinabalu photos here, e.g.: 'images/kk_22.jpg',
    ]
  },
  rinjani: {
    title: 'Gunung Rinjani',
    photos: [
      'images/rinjani_4.jpg',
      'images/rinjani_5.jpg',
      'images/rinjani_6.jpg',
      'images/rinjani_7.jpg',
      'images/rinjani_8.jpg',
      'images/rinjani_9.jpg',
      'images/rinjani_10.jpg',
      'images/rinjani_11.jpg',
      'images/rinjani_12.jpg',
      'images/rinjani_13.jpg',
      'images/rinjani_14.jpg',
      'images/rinjani_15.jpg',
      'images/rinjani_16.jpg',
      // Add more Rinjani photos here, e.g.: 'images/rinjani_17.jpg',
    ]
  },
  bromo: {
    title: 'Bromo · Tumpak Sewu · Ijen',
    photos: [
      'images/bromo_1.jpg',
      'images/bromo_2.jpg',
      'images/bromo_3.jpg',
      'images/bromo_4.jpg',
      'images/bromo_5.jpg',
      'images/bromo_6.jpg',
      'images/bromo_7.jpg',
      'images/bromo_8.jpg',
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

  function applyFilters() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    let shown = 0;
    cards.forEach(card => {
      const badge = card.querySelector('.difficulty');
      const matchesDifficulty = activeFilter === 'all' || (badge && badge.classList.contains('diff-' + activeFilter));
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
