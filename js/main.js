/* =========================================================
   ELIAS THORNE — shared site behaviour
   Header + footer are defined ONCE here and injected into every
   page, so they stay identical everywhere. Edit them in one place.
   ========================================================= */

/* ---- Single source of truth for site-wide content ---- */
const SITE = {
  name: 'EVAN LAM',
  email: 'evanlam@hawaii.edu',
  location: 'Honolulu, Hawaiʻi',
  tagline: 'Mechanical engineering student at UH Mānoa — robotics, additive manufacturing, and precision design.',
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/evan-lam323' },
  ],
  nav: [
    { label: 'Projects', href: 'index.html#work', children: 'projects' },
    { label: 'Research', href: 'research.html' },
    { label: 'About',    href: 'about.html' },
  ],
  // Individual project pages — shown in the Projects dropdown.
  projects: [
    { label: 'UH 88″ Weather Sensor',   href: 'project-uh88-weather.html' },
    { label: '6 DOF Arm',               href: 'project-rose-arm.html' },
    { label: '3D-Printed Mini-Bridge',  href: 'project-mini-bridge.html' },
    { label: 'Steel Bridge',            href: 'project-steel-bridge.html' },
    { label: 'Additive Pump Subsystem', href: 'project-soma-pump.html' },
    { label: 'Stair-Climbing Robot',    href: 'project-stair-robot.html' },
    { label: 'FIRST Robotics',          href: 'project-kealakehe.html' },
  ],
};

/* ---- Header ---- */
function buildHeader() {
  const current = document.body.dataset.page || '';
  const links = SITE.nav.map(n => {
    let href = n.href;
    // On the home page, keep same-page anchors in-page (smooth scroll, no reload).
    if (current === 'index' && href.startsWith('index.html#')) {
      href = href.slice('index.html'.length); // -> '#work'
    }
    const active = current === n.href.replace('.html', '') ? ' aria-current="page"' : '';

    // Item with a dropdown (e.g. Projects -> individual project pages).
    if (n.children && Array.isArray(SITE[n.children])) {
      const items = SITE[n.children].map(c =>
        `<a class="dropdown-link" href="${c.href}">${c.label}</a>`
      ).join('');
      return `
        <div class="nav-item has-dropdown">
          <a class="nav-parent" href="${href}"${active}>${n.label}<span class="caret" aria-hidden="true">▾</span></a>
          <div class="dropdown">${items}</div>
        </div>`;
    }
    return `<a href="${href}"${active}>${n.label}</a>`;
  }).join('');

  return `
  <header class="site-header" id="siteHeader">
    <div class="header-inner">
      <a class="logo" href="index.html">${SITE.name}<span class="dot">.</span></a>
      <nav class="nav">${links}</nav>
    </div>
  </header>`;
}

/* ---- Footer ---- */
function buildFooter() {
  const year = new Date().getFullYear();
  const socials = SITE.socials
    .map(s => `<a href="${s.href}" target="_blank" rel="noopener">${s.label}</a>`)
    .join('');

  return `
  <footer class="site-footer">
    <div class="footer-top">
      <div class="footer-brand">
        <div class="logo">${SITE.name}<span class="dot">.</span></div>
        <p>${SITE.tagline}</p>
        <div class="socials">${socials}</div>
      </div>
      <div class="footer-contact">
        <span class="label">GET IN TOUCH</span>
        <a class="email" href="mailto:${SITE.email}">${SITE.email}</a>
        <span class="loc">${SITE.location}</span>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-bottom-inner">
        <span>© ${year} ${titleCase(SITE.name)} / All Rights Reserved</span>
        <span>Designed + Built with Precision</span>
      </div>
    </div>
  </footer>`;
}

function titleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

/* ---- Inject shared parts ---- */
function injectLayout() {
  const headerMount = document.getElementById('header-mount');
  const footerMount = document.getElementById('footer-mount');
  if (headerMount) headerMount.outerHTML = buildHeader();
  if (footerMount) footerMount.outerHTML = buildFooter();
}

/* ---- Header pops up on scroll ---- */
function initScrollHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;
  // Header is pinned to the top on every page and follows as you scroll.
  header.classList.add('is-visible');

  // On the landing page the bar sits transparent over the hero, then gains
  // its dark background once you scroll down into the content.
  if (document.body.dataset.page === 'index') {
    const trigger = 80;
    const update = () => header.classList.toggle('is-transparent', window.scrollY <= trigger);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }
}

/* ---- Reveal-on-scroll for elements marked .reveal ---- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  items.forEach(el => io.observe(el));
}

/* ---- Nav dropdowns (hover on desktop, tap on touch) ---- */
function initDropdowns() {
  const items = document.querySelectorAll('.has-dropdown');
  if (!items.length) return;

  items.forEach(item => {
    const parent = item.querySelector('.nav-parent');
    parent.addEventListener('click', (e) => {
      // On touch devices, the first tap opens the menu instead of navigating.
      const isTouch = window.matchMedia('(hover: none)').matches;
      if (isTouch && !item.classList.contains('open')) {
        e.preventDefault();
        items.forEach(o => { if (o !== item) o.classList.remove('open'); });
        item.classList.add('open');
      }
    });
  });

  // Tap/click outside closes any open menu.
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-dropdown')) {
      items.forEach(o => o.classList.remove('open'));
    }
  });
}

/* ---- Research page filters ---- */
function initFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  const rows = document.querySelectorAll('.rrow');
  if (!buttons.length) return;
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const type = btn.dataset.type;
      rows.forEach(row => {
        row.hidden = !(type === 'all' || row.dataset.type === type);
      });
    });
  });
}

/* ---- Home "Work" grid discipline filters (multi-select) ----
   Click any combination of Robotics / Structures / Additive to show just
   those cards. "All" clears the selection. With nothing selected we fall
   back to showing everything. */
function initWorkFilters() {
  const buttons = document.querySelectorAll('.work-filter');
  const cards = document.querySelectorAll('.project');
  if (!buttons.length) return;
  const allBtn = document.querySelector('.work-filter[data-disc="all"]');

  const apply = () => {
    const active = [...buttons]
      .filter(b => b.classList.contains('is-active') && b.dataset.disc !== 'all')
      .map(b => b.dataset.disc);
    const showAll = active.length === 0;
    if (allBtn) allBtn.classList.toggle('is-active', showAll);
    cards.forEach(card => {
      card.hidden = !(showAll || active.includes(card.dataset.disc));
    });
  };

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.disc === 'all') {
        // "All" resets to a clean slate.
        buttons.forEach(b => b.classList.toggle('is-active', b.dataset.disc === 'all'));
      } else {
        btn.classList.toggle('is-active');
      }
      apply();
    });
  });

  apply();
}

/* ---- Project-page image gallery + lightbox ----
   Builds ONE overlay and reuses it. Tiles whose image hasn't been added yet
   show a placeholder; clicking still opens the lightbox (placeholder view) so
   the interaction can be tested before real photos exist. */
/* The gallery grid is rebuilt on every (re)render, so the lightbox is created
   ONCE and opens via a delegated click — no per-tile handlers to rebind. Tiles
   can hold an image or a video; video tiles play with controls in the box. */
function initGallery() {
  if (!document.querySelector('[data-gallery], .gallery-item')) return;
  if (document.querySelector('.lightbox')) return;   // already built

  const box = document.createElement('div');
  box.className = 'lightbox';
  box.innerHTML = `
    <button class="lb-close" aria-label="Close">×</button>
    <button class="lb-nav lb-prev" aria-label="Previous image">‹</button>
    <figure class="lb-stage">
      <img class="lb-img" alt="" hidden />
      <video class="lb-video" controls playsinline hidden></video>
      <div class="lb-ph" hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>
        <span class="lb-ph-text">Image coming soon</span>
      </div>
      <figcaption class="lb-caption"></figcaption>
    </figure>
    <button class="lb-nav lb-next" aria-label="Next image">›</button>`;
  document.body.appendChild(box);

  const lbImg = box.querySelector('.lb-img');
  const lbVideo = box.querySelector('.lb-video');
  const lbPh = box.querySelector('.lb-ph');
  const lbPhText = box.querySelector('.lb-ph-text');
  const lbCap = box.querySelector('.lb-caption');
  let items = [];
  let idx = 0;
  const collect = () => { items = [...document.querySelectorAll('.gallery-item')]; };

  const render = () => {
    const item = items[idx];
    if (!item) return;
    const caption = item.dataset.caption || '';
    lbCap.textContent = caption;
    lbVideo.pause();
    if (item.dataset.video) {
      lbVideo.src = (item.dataset.dir ? item.dataset.dir.replace(/\/+$/, '') + '/' : 'images/') + item.dataset.file;
      lbVideo.hidden = false; lbImg.hidden = true; lbPh.hidden = true;
      lbVideo.currentTime = 0;
      lbVideo.play().catch(() => {});
      return;
    }
    lbVideo.removeAttribute('src');
    const img = item.querySelector('img');
    const broken = img && img.complete && img.naturalWidth === 0;
    const hasImage = img && img.getAttribute('src') && !item.classList.contains('is-empty') && !broken;
    if (hasImage) {
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = caption;
      lbImg.hidden = false; lbVideo.hidden = true; lbPh.hidden = true;
    } else {
      lbImg.hidden = true; lbVideo.hidden = true; lbPh.hidden = false;
      lbPhText.textContent = caption || 'Image coming soon';
    }
  };
  const open = i => { idx = i; render(); box.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = () => { box.classList.remove('open'); document.body.style.overflow = ''; lbVideo.pause(); };
  const go = d => { if (!items.length) return; idx = (idx + d + items.length) % items.length; render(); };

  // Delegated open: works for tiles built after this ran (re-renders included).
  const tryOpen = target => {
    const item = target.closest('.gallery-item');
    if (!item) return;
    // Don't hijack the editing controls that live on the tile.
    if (target.closest('.photo-move-btn') || target.closest('[contenteditable="true"]')) return;
    collect();
    const i = items.indexOf(item);
    if (i >= 0) open(i);
  };
  document.addEventListener('click', e => tryOpen(e.target));
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement &&
        document.activeElement.classList && document.activeElement.classList.contains('gallery-item')) {
      e.preventDefault(); tryOpen(document.activeElement);
    }
  });

  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); go(-1); });
  box.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); go(1); });
  box.addEventListener('click', e => { if (e.target === box) close(); });
  document.addEventListener('keydown', e => {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
  });
}

/* ---- Interactive 3D model: arrows switch between preset camera views ----
   Instead of nudging the orbit left/right, the arrows (and ← / → keys) snap
   the camera to named viewpoints. Drag-to-orbit and scroll-to-zoom still work
   via model-viewer's camera-controls. */
function initModelViewer() {
  const mv = document.querySelector('model-viewer');
  if (!mv) return;
  const views = [
    { label: 'Iso',   orbit: '35deg 65deg auto' },
    { label: 'Front', orbit: '0deg 90deg auto'  },
    { label: 'Right', orbit: '90deg 90deg auto' },
    { label: 'Back',  orbit: '180deg 90deg auto'},
    { label: 'Left',  orbit: '-90deg 90deg auto'},
    { label: 'Top',   orbit: '0deg 5deg auto'   },
  ];
  const label = document.querySelector('.model-view-label');
  let i = 0;
  const apply = () => { mv.cameraOrbit = views[i].orbit; if (label) label.textContent = views[i].label; };
  const go = d => { i = (i + d + views.length) % views.length; apply(); };

  document.querySelectorAll('.model-view-btn').forEach(btn =>
    btn.addEventListener('click', () => go(Number(btn.dataset.dir)))
  );

  // Capture arrow keys before model-viewer's own orbit handler runs.
  mv.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); e.stopImmediatePropagation(); go(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); e.stopImmediatePropagation(); go(1); }
  }, true);

  apply();
}

/* ---- Picture-book process: each card is "dropped" onto the pile ----
   All cards are sticky-pinned at the SAME spot, so a card fully lands on top of
   the previous one — you never see the next card peeking as a preview. As a card
   enters its "drop zone" it is held centred on the pin (a translate cancels the
   scroll so it doesn't slide up) while it fades in and shrinks from slightly-
   larger down to 1:1 — so it reads as being placed straight on top of the stack.
   Progress is computed from each card's stable LAYOUT position (offsetTop chain),
   not its live rect, so the transform we apply can't feed back on the maths. */
function initProcessPile() {
  const pile = document.querySelector('.process-pile .pile');
  if (!pile) return;
  const cards = [...pile.querySelectorAll('.pile-card')];
  if (!cards.length) return;

  const header = document.getElementById('siteHeader');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tilts = cards.map(c =>
    (getComputedStyle(c).getPropertyValue('--tilt') || '0deg').trim() || '0deg');

  // Document-flow top of an element, independent of sticky offset and transforms.
  const docTop = el => { let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop; return y; };

  let pinTop = 140;
  let naturals = [];
  const DROP = 300; // px of scroll over which a card grows -> shrinks & fades in

  const render = () => {
    const sy = window.scrollY || window.pageYOffset || 0;
    let front = 0, frontP = -1;                       // the card the viewer perceives as "on top"
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (reduce) {
        card.style.opacity = 1; card.style.transform = `rotate(${tilts[i]})`; card.style.pointerEvents = 'auto';
        front = i; continue;                          // last card sits on top of the static stack
      }
      const approachTop = naturals[i] - sy;          // where the card would sit before sticky/transform
      let p = (pinTop + DROP - approachTop) / DROP;   // 0 = entering the drop zone, 1 = landed
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      const scale = 1.16 - 0.16 * p;
      const ty = -(1 - p) * DROP;                     // hold the card on the pin instead of sliding up
      card.style.opacity = p;
      card.style.transform = `translateY(${ty.toFixed(1)}px) scale(${scale.toFixed(3)}) rotate(${tilts[i]})`;
      // Front card = the last one to have (mostly) landed — the one the viewer
      // sees on top. Its per-photo pager arrows/dots live OUTSIDE the card
      // border, so we hide the ones on the cards stacked behind it (avoids
      // ghosted duplicate arrows) and route all clicks to it.
      if (p >= 0.5 || p >= frontP) { front = i; frontP = p; }
    }
    for (let i = 0; i < cards.length; i++) {
      cards[i].classList.toggle('is-front', i === front);
      // Only the front card receives clicks; the transparent/behind cards are
      // still stacked on top of things and would otherwise swallow them.
      if (!reduce) cards[i].style.pointerEvents = i === front ? 'auto' : 'none';
    }
  };

  const layout = () => {
    const headH = header ? header.offsetHeight : 72;
    const tallest = Math.max(...cards.map(c => c.offsetHeight));
    pinTop = Math.max(headH + 20, Math.round((window.innerHeight - tallest) / 2));
    cards.forEach(c => { c.style.top = pinTop + 'px'; });
    naturals = cards.map(docTop);
    render();
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { render(); ticking = false; });
  };

  layout();
  window.addEventListener('resize', layout, { passive: true });
  window.addEventListener('load', layout);
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---- Per-step photo pager (mini-bridge) ----
   A process card can hold several sub-photos (1.0, 1.1, …). Left/right arrows
   and the dots page between them. Rather than sliding a filmstrip, each swap
   sweeps the whole grey card: the outgoing card drifts off to one side and fades
   out while the incoming one sweeps in from the arrow's side, lands on top, and
   settles upright. Each card takes its OWN small random tilt during the sweep,
   so every swap feels hand-placed.
   Sizing is CSS-driven, not JS-measured: the current slide keeps `position:
   relative` (see .js-pager .pager-slide.is-current) so it flows and gives the
   viewport its height on its own — no offsetHeight reads that can fail to stick.
   Each slide carries its own [data-file] + [data-cap], so the live caption
   editor still picks them up. */
function initCardPagers() {
  const pagers = document.querySelectorAll('[data-pager]');
  if (!pagers.length) return;

  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = (min, max) => Math.random() * (max - min) + min;

  pagers.forEach(pager => {
    // Guard against re-wiring on a live re-render: only touch fresh pagers.
    if (pager.dataset.wired) return;
    pager.dataset.wired = '1';
    const slides = [...pager.querySelectorAll('.pager-slide')];
    const dotsWrap = pager.querySelector('.pager-dots');

    // A single photo needs no controls — strip them out and leave the image.
    if (slides.length <= 1) {
      pager.querySelectorAll('.pager-arrow').forEach(el => el.remove());
      if (dotsWrap) dotsWrap.remove();
      return;
    }

    const prev = pager.querySelector('.pager-prev');
    const next = pager.querySelector('.pager-next');
    let i = 0;
    let animating = false;

    // Take over: stack the slides so they can overlap during the sweep. Only the
    // .is-current slide flows (and sizes the box); the rest sit absolutely on top.
    pager.classList.add('js-pager');

    const dots = slides.map((_, n) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pager-dot';
      b.setAttribute('aria-label', `Photo ${n + 1}`);
      b.addEventListener('click', () => go(n, Math.sign(n - i)));
      dotsWrap.appendChild(b);
      return b;
    });

    // Each slide rests at its OWN small tilt, independent of the parent card's
    // tilt, so the bordered grey square sits askew of the pile rather than
    // aligned with it. (The viewport is overflow:visible so this tilt isn't
    // clipped — see CSS.)
    slides.forEach(s => { s._rest = rnd(-3.5, 3.5); });
    // Open on the first slide, already at its resting tilt.
    slides.forEach((s, n) => {
      s.classList.toggle('is-current', n === 0);
      s.setAttribute('aria-hidden', n === 0 ? 'false' : 'true');
      if (n === 0) s.style.transform = `rotate(${s._rest.toFixed(2)}deg)`;
    });
    dots.forEach((d, n) => d.classList.toggle('is-active', n === 0));

    const go = (n, dir) => {
      n = (n + slides.length) % slides.length;
      if (n === i || animating) return;
      // Which way the new card sweeps in from. Arrows say so explicitly (next
      // enters from the right); dots infer it from the jump direction.
      dir = dir || Math.sign(n - i) || 1;
      const cur = slides[i];
      const nxt = slides[n];

      dots.forEach((d, k) => d.classList.toggle('is-active', k === n));
      cur.setAttribute('aria-hidden', 'true');
      nxt.setAttribute('aria-hidden', 'false');

      if (REDUCE) {
        cur.classList.remove('is-current');
        nxt.classList.add('is-current');
        cur.style.cssText = '';
        nxt.style.cssText = '';
        nxt.style.transform = `rotate(${nxt._rest.toFixed(2)}deg)`;
        i = n;
        return;
      }

      animating = true;
      // The incoming card sweeps in from a full frame off (on the arrow's side)
      // and settles upright; the outgoing card drifts off the other way and
      // fades. Each card gets its own small random tilt during the sweep.
      const enterX = dir > 0 ? 108 : -108;   // % of its own width, fully off-frame
      const leaveX = dir > 0 ? -64 : 64;
      const enterTilt = rnd(-5, 5);
      const leaveTilt = rnd(-5, 5);
      const pose = (x, tilt) => `translateX(${x}%) rotate(${tilt.toFixed(2)}deg)`;

      // Outgoing: drop out of flow (absolute) so the incoming slide, now current,
      // sizes the viewport; then slide it off and fade it.
      cur.classList.remove('is-current');
      cur.classList.add('is-swapping');

      // Incoming: becomes current, but pre-posed off-frame with transitions off,
      // then a reflow flush so it animates FROM that pose instead of jumping.
      nxt.classList.add('is-current', 'is-swapping');
      nxt.style.transition = 'none';
      nxt.style.opacity = '0';
      nxt.style.transform = pose(enterX, enterTilt);
      void nxt.offsetWidth;                  // commit the start pose
      nxt.style.transition = '';

      // End pose — both cards animate: incoming sweeps in and settles at its own
      // resting tilt, outgoing slides off and fades.
      nxt.style.opacity = '1';
      nxt.style.transform = pose(0, nxt._rest);
      cur.style.opacity = '0';
      cur.style.transform = pose(leaveX, leaveTilt);

      const finish = e => {
        // Ignore the opacity transitionend (fires first); wait for the transform
        // sweep to land — or the fallback timer, if the event never arrives.
        if (e && e.propertyName !== 'transform') return;
        nxt.removeEventListener('transitionend', finish);
        clearTimeout(timer);
        cur.classList.remove('is-swapping');
        nxt.classList.remove('is-swapping');
        cur.style.cssText = '';            // back to hidden absolute default
        nxt.style.cssText = '';            // clear the transition/opacity overrides
        nxt.style.transform = `rotate(${nxt._rest.toFixed(2)}deg)`;  // hold rest tilt
        animating = false;
      };
      nxt.addEventListener('transitionend', finish);
      const timer = setTimeout(finish, 850); // fallback if transitionend misses

      i = n;
    };

    prev.addEventListener('click', () => go(i - 1, -1));
    next.addEventListener('click', () => go(i + 1, 1));
  });
}

/* ---- Photo label sheet: place each photo from js/photos.js into its slot ----
   Every project page carries data-project on <body>. This reads window.PHOTOS,
   keeps only the rows for this project, and drops each one into place:
     step "cover"        -> the .project-cover image
     step "process-N"    -> the pile card marked data-slot="process-N"
     step "gallery"      -> a tile built into the [data-gallery] grid
   Captions come from the sheet but can be overridden live by the editor
   (stored per-file in localStorage) — see initCaptionEditor. */
const CAPTION_KEY = 'photoCaptions';
const MOVES_KEY   = 'photoMoves';

function loadCaptionOverrides() {
  try { return JSON.parse(localStorage.getItem(CAPTION_KEY) || '{}'); }
  catch { return {}; }
}
function captionFor(entry, overrides) {
  const o = overrides[entry.file];
  return (o != null ? o : entry.caption) || '';
}

/* Live photo moves set by the on-page mover (#edit): { file: {project, step} }.
   These override a row's slot without touching js/photos.js until you "Copy
   label sheet". */
function loadPhotoMoves() {
  try { return JSON.parse(localStorage.getItem(MOVES_KEY) || '{}'); }
  catch { return {}; }
}
function savePhotoMoves(moves) { localStorage.setItem(MOVES_KEY, JSON.stringify(moves)); }
// Effective {project, step} for a raw PHOTOS row, applying any live move.
function resolveRow(p, moves) {
  const m = moves && moves[p.file];
  return m ? { ...p, project: m.project, step: m.step } : p;
}

// A file whose name ends in a video extension renders as <video>, not <img>.
const VIDEO_RE = /\.(mp4|webm|mov|m4v|ogv|ogg)$/i;
const isVideoFile = f => VIDEO_RE.test(f || '');

// Media lives in images/ by default; rows injected from a videos/<project>/ folder
// (see initVideoFolder) carry a `dir`, so their src resolves there instead.
const mediaSrc = entry => (entry && entry.dir ? String(entry.dir).replace(/\/+$/, '') + '/' : 'images/') + entry.file;

const MOVE_PROJECTS = ['uh88-weather', 'rose-arm', 'mini-bridge', 'steel-bridge', 'soma-pump', 'stair-robot', 'kealakehe', 'personal'];
// How many process-step cards each project page actually has. The mover only
// offers slots that exist on the target page — moving a photo to a step the page
// doesn't have would just make it disappear.
const PROCESS_STEP_COUNTS = {
  'uh88-weather': 5, 'rose-arm': 5, 'mini-bridge': 5, 'steel-bridge': 5,
  'soma-pump': 4, 'stair-robot': 5, 'kealakehe': 5, 'personal': 0,
};

/* A process step can hold several photos, shown as a mini-bridge-style pager
   whose slides are numbered N.0, N.1, N.2… A photo's slot is therefore either a
   plain step ("process-5", = position 0) or a sub-slot ("process-5.2"). These
   two helpers split a step string into its base card and its sub-index. */
const PROC_RE = /^process-(\d+)(?:\.(\d+))?$/;
function baseStep(step) { const m = PROC_RE.exec(step || ''); return m ? ('process-' + m[1]) : step; }
function stepIndex(step) { const m = PROC_RE.exec(step || ''); return (m && m[2] != null) ? parseInt(m[2], 10) : null; }
function baseNumOf(step) { const m = PROC_RE.exec(step || ''); return m ? parseInt(m[1], 10) : null; }

/* Empty photo slots the author reserved with the on-page "+" button (edit mode).
   Stored as a per-project minimum slide count per step: { project: { "process-5": 3 } }.
   Photos carry their own sub-index; this only keeps *empty* trailing slots alive
   across re-renders so a photo can be moved into them. */
const PROCSLOTS_KEY = 'processSlots';
function loadProcSlots() {
  try { return JSON.parse(localStorage.getItem(PROCSLOTS_KEY) || '{}'); }
  catch { return {}; }
}
function saveProcSlots(o) { localStorage.setItem(PROCSLOTS_KEY, JSON.stringify(o)); }
function reservedFor(project, base) { const o = loadProcSlots(); return (o[project] && o[project][base]) || 0; }
function setReserved(project, base, n) {
  const o = loadProcSlots();
  o[project] = o[project] || {};
  if (n > 0) o[project][base] = n; else delete o[project][base];
  if (!Object.keys(o[project]).length) delete o[project];
  saveProcSlots(o);
}

/* Turn a step's photos + reserved-empty count into an ordered array of slide
   positions. Each entry is a photo row (filled slide) or null (empty slide).
   Photos with an explicit sub-index land at that position; un-indexed ("bare")
   photos fill the lowest free positions in order; the array is padded to the
   reserved minimum so author-added empty slots stay put. */
function layoutStepSlots(group, reserved) {
  const explicit = [], bare = [];
  group.forEach(r => { const idx = stepIndex(r.step); if (idx == null) bare.push(r); else explicit.push({ idx, r }); });
  let count = reserved || 0;
  explicit.forEach(e => { count = Math.max(count, e.idx + 1); });
  const arr = new Array(count).fill(null);
  explicit.forEach(e => { if (e.idx < arr.length) arr[e.idx] = e.r; });
  bare.forEach(r => { const k = arr.indexOf(null); if (k === -1) arr.push(r); else arr[k] = r; });
  return arr;
}

/* Placement templates: process/cover slots get rebuilt destructively (single ->
   pager, empty -> filled, filled -> empty), so we snapshot their pristine markup
   once and restore from it on every (re)render. That makes renderPhotos()
   idempotent — which the live mover relies on to re-place photos without a page
   reload. */
let PHOTO_TEMPLATES = null;
function snapshotPhotoTemplates() {
  PHOTO_TEMPLATES = { cover: null, process: new Map() };
  const cover = document.querySelector('[data-photo-cover]');
  if (cover) PHOTO_TEMPLATES.cover = cover.innerHTML;
  document.querySelectorAll('[data-slot^="process-"]').forEach(slot => {
    PHOTO_TEMPLATES.process.set(slot, slot.innerHTML);
  });
}

function initPhotos() {
  if (!document.body.dataset.project || !Array.isArray(window.PHOTOS)) return;
  snapshotPhotoTemplates();
  renderPhotos();
}

/* Re-runnable placement. Restores each slot from its template, then drops the
   project's photos (or videos) into place. Safe to call again after a live edit
   (see rerenderPhotos). */
function renderPhotos() {
  const project = document.body.dataset.project;
  if (!project || !Array.isArray(window.PHOTOS)) return;
  const overrides = loadCaptionOverrides();
  const moves = loadPhotoMoves();
  const rows = window.PHOTOS.map(p => resolveRow(p, moves)).filter(p => p.project === project);
  const find = step => rows.find(p => p.step === step);

  // -- Cover --
  const cover = document.querySelector('[data-photo-cover]');
  if (cover) {
    if (PHOTO_TEMPLATES && PHOTO_TEMPLATES.cover != null) cover.innerHTML = PHOTO_TEMPLATES.cover;
    cover.classList.remove('is-empty');
    delete cover.dataset.file;
    const entry = find('cover');
    if (entry) {
      cover.dataset.file = entry.file;
      setSlotMedia(cover, entry, overrides);
    } else {
      cover.classList.add('is-empty');
      cover.querySelectorAll('img, video').forEach(el => el.remove());
    }
  }

  // -- Process steps --
  //  A step gathers every photo whose slot's base card matches it (process-5,
  //  process-5.0, process-5.2 …) plus any empty slots the author reserved.
  //  0/1 slide -> single card (or empty placeholder); 2+ -> mini-bridge pager
  //  with slides numbered N.0, N.1, N.2…
  document.querySelectorAll('[data-slot^="process-"]').forEach(slot => {
    if (PHOTO_TEMPLATES && PHOTO_TEMPLATES.process.has(slot)) {
      slot.innerHTML = PHOTO_TEMPLATES.process.get(slot);
      delete slot.dataset.file;
    }
    const base = slot.dataset.slot;
    const group = rows.filter(p => baseStep(p.step) === base);
    const arr = layoutStepSlots(group, reservedFor(project, base));

    if (arr.length <= 1) {
      const media = slot.querySelector('.card-media, .step-media') || slot;
      const cap = slot.querySelector('.card-photo-cap');
      const entry = arr[0] || null;
      if (!entry) {
        if (media && media.classList) media.classList.add('is-empty');
        slot.querySelectorAll('img, video').forEach(el => el.remove());
      } else {
        slot.dataset.file = entry.file;
        setSlotMedia(media, entry, overrides);
        if (cap) cap.textContent = captionFor(entry, overrides);
      }
      return;
    }
    buildProcessPager(slot, arr, overrides);
  });

  // -- Gallery (built from every "gallery" row) --
  const grid = document.querySelector('[data-gallery]');
  if (grid) {
    const gal = rows.filter(p => p.step === 'gallery');
    grid.innerHTML = '';
    if (!gal.length) {
      grid.innerHTML = `<p class="gallery-empty">No gallery photos yet — add rows with <code>step: "gallery"</code> in <code>js/photos.js</code>.</p>`;
    }
    gal.forEach(entry => grid.appendChild(buildGalleryItem(entry, overrides)));
  }
}

/* Drop the right media node (img OR video) into a .card-media / cover container,
   replacing whatever media node the template left there. */
function setSlotMedia(media, entry, overrides) {
  const cap = captionFor(entry, overrides);
  const markEmpty = () => { if (media && media.classList) media.classList.add('is-empty'); };
  if (isVideoFile(entry.file)) {
    media.querySelectorAll('img').forEach(el => el.remove());
    let v = media.querySelector('video');
    if (!v) { v = document.createElement('video'); media.insertBefore(v, media.firstChild); }
    v.className = 'card-video';
    v.src = mediaSrc(entry);
    v.muted = true; v.loop = true; v.controls = true; v.preload = 'metadata';
    v.setAttribute('playsinline', '');
    v.setAttribute('aria-label', cap);
    v.onerror = () => { markEmpty(); v.remove(); };
  } else {
    media.querySelectorAll('video').forEach(el => el.remove());
    let img = media.querySelector('img');
    if (!img) { img = document.createElement('img'); img.loading = 'lazy'; media.insertBefore(img, media.firstChild); }
    img.src = mediaSrc(entry);
    img.alt = cap;
    img.onerror = () => { markEmpty(); img.remove(); };
  }
}

const GALLERY_PH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>';

/* One gallery tile — an <img>, or for a video file a muted first-frame <video>
   with a ▶ badge (it plays with controls in the lightbox). */
function buildGalleryItem(entry, overrides) {
  const cap = captionFor(entry, overrides);
  const fig = document.createElement('figure');
  fig.className = 'gallery-item';
  fig.tabIndex = 0;
  fig.dataset.caption = cap;
  fig.dataset.file = entry.file;
  if (entry.dir) fig.dataset.dir = entry.dir;

  const ph = document.createElement('div');
  ph.className = 'gallery-ph';
  ph.innerHTML = `${GALLERY_PH_SVG}<span>${entry.file}</span>`;
  const capEl = document.createElement('figcaption');
  capEl.dataset.cap = '';
  capEl.textContent = cap;

  if (isVideoFile(entry.file)) {
    fig.dataset.video = '1';
    const v = document.createElement('video');
    v.className = 'gallery-video';
    v.src = mediaSrc(entry) + '#t=0.1';   // show the first frame as a poster
    v.muted = true; v.preload = 'metadata';
    v.setAttribute('playsinline', '');
    v.addEventListener('error', () => { fig.classList.add('is-empty'); v.remove(); });
    const badge = document.createElement('span');
    badge.className = 'gallery-play';
    badge.setAttribute('aria-hidden', 'true');
    badge.textContent = '▶';
    fig.append(v, badge, ph, capEl);
  } else {
    const img = document.createElement('img');
    img.src = mediaSrc(entry);
    img.alt = cap;
    img.loading = 'lazy';
    img.addEventListener('error', () => { fig.classList.add('is-empty'); img.remove(); });
    fig.append(img, ph, capEl);
  }
  return fig;
}

/* Turn a single-photo process card into the mini-bridge photo pager so a step
   can hold several photos/videos. Each becomes its own grey card (keeping the
   step's number, title and description) that sweeps in on arrow/dot paging.
   initCardPagers() — which runs after this — wires up the sweep animation. */
function buildProcessPager(slot, entries, overrides) {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // Reuse the step's heading title, but replace its number per slide with the
  // sub-number N.i so each photo reads 5.0, 5.1, 5.2… (like mini-bridge).
  const titleHTML = slot.querySelector('.card-head h4')?.outerHTML || '';
  const cardNum = (slot.querySelector('.card-num')?.textContent || '').trim();
  const baseNum = parseInt(cardNum.replace(/\D/g, ''), 10) || parseInt((slot.dataset.slot || '').replace('process-', ''), 10) || '';
  // Each slide can carry its own title (e.g. mini-bridge's per-photo headings);
  // fall back to the step's shared title when a photo row has none.
  const headFor = (sub, entry) => {
    const t = (entry && entry.title) ? `<h4>${esc(entry.title)}</h4>` : titleHTML;
    return `<div class="card-head"><span class="card-num">${esc(sub)}</span>${t}</div>`;
  };
  // The step's written description is the plain <p> that isn't the photo caption.
  const descEl = [...slot.querySelectorAll(':scope > p')].find(p => !p.classList.contains('card-photo-cap'));
  const descHTML = descEl ? descEl.innerHTML : '';
  const phSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>';

  const slides = entries.map((entry, i) => {
    const sub = `${baseNum}.${i}`;
    // Empty slot the author reserved with "+": a labelled placeholder, no photo.
    // Fill it by opening another photo's Move and picking this sub-slot.
    if (!entry) {
      return `
      <div class="pager-slide pager-slide--blank" data-blank data-sub="${esc(sub)}">
        ${headFor(sub)}
        <div class="card-media is-empty">
          <div class="media-ph">${phSvg}<span>${esc(sub)} · empty</span></div>
        </div>
        <p class="pager-blank-hint">Empty slot <b>${esc(sub)}</b> — open any photo's <b>Move</b> and choose <code>${esc(sub)}</code> to drop it here.</p>
        ${descHTML ? `<p class="card-desc">${descHTML}</p>` : ''}
      </div>`;
    }
    const cap = captionFor(entry, overrides);
    const mediaHTML = isVideoFile(entry.file)
      ? `<video class="card-video" src="${esc(mediaSrc(entry))}" muted loop controls playsinline preload="metadata"
                aria-label="${esc(cap)}"
                onerror="this.closest('.card-media').classList.add('is-empty'); this.remove();"></video>`
      : `<img alt="${esc(cap)}" loading="lazy" src="${esc(mediaSrc(entry))}"
               onerror="this.closest('.card-media').classList.add('is-empty'); this.remove();" />`;
    return `
      <div class="pager-slide" data-file="${esc(entry.file)}">
        ${headFor(sub, entry)}
        <div class="card-media">
          ${mediaHTML}
          <div class="media-ph">${phSvg}<span>${esc(sub)}</span></div>
        </div>
        <p class="card-photo-cap" data-cap>${esc(cap)}</p>
        ${descHTML ? `<p class="card-desc">${descHTML}</p>` : ''}
      </div>`;
  }).join('');

  slot.innerHTML = `
    <div class="card-pager" data-pager>
      <div class="pager-viewport"><div class="pager-track">${slides}</div></div>
      <button class="pager-arrow pager-prev" type="button" aria-label="Previous photo">‹</button>
      <button class="pager-arrow pager-next" type="button" aria-label="Next photo">›</button>
      <div class="pager-dots"></div>
    </div>`;
}

/* Re-run placement after a live move: re-place photos, wire any new pagers,
   re-decorate for editing, and let the sticky pile re-measure card heights. */
function rerenderPhotos() {
  renderPhotos();
  initCardPagers();
  if (document.body.classList.contains('editing-captions')) decorateEditing();
  window.dispatchEvent(new Event('resize'));
}

/* ---- Live caption editor ----
   Add  #edit  to any project-page URL (…/project-uh88-weather.html#edit) to
   turn on editing. Captions become type-in fields; changes save to this
   browser instantly. "Copy label sheet" hands you the full js/photos.js text
   with your captions merged in — paste it over the file to make them
   permanent (and visible to everyone / on every device). */
function editingRequested() {
  return location.hash.replace('#', '') === 'edit'
      || new URLSearchParams(location.search).has('edit');
}

function initCaptionEditor() {
  if (!document.body.dataset.project) return;

  const enable = () => {
    if (document.body.classList.contains('editing-captions')) return;
    document.body.classList.add('editing-captions');
    buildCaptionToolbar();
    decorateEditing();
  };

  if (editingRequested()) enable();
  // Allow toggling on without a reload if the hash is added later.
  window.addEventListener('hashchange', () => { if (editingRequested()) enable(); });
}

// Wire (or re-wire, after a live re-render) the editing affordances on every
// photo/video host: an editable caption, a "Move" button, and a per-step "+".
function decorateEditing() {
  wireEditableCaptions();
  wireMovers();
  wireStepAdders();
}

// Effective slide positions for a step (photos + reserved empties), used by the
// per-step +/− buttons to know the current count and whether a blank is trailing.
function stepLayout(project, base) {
  const moves = loadPhotoMoves();
  const group = window.PHOTOS.map(p => resolveRow(p, moves))
    .filter(p => p.project === project && baseStep(p.step) === base);
  return layoutStepSlots(group, reservedFor(project, base));
}

/* The per-step "+" (top-right of every process card, edit mode only): reserve
   one more empty photo slot in this step. That flips a single-photo card into
   the mini-bridge pager (arrows + dots) with a labelled empty slot you can then
   fill by Move-ing a photo into that sub-slot. A "−" on the pager cards removes
   an accidentally-added trailing empty slot again. */
function wireStepAdders() {
  const project = document.body.dataset.project;
  document.querySelectorAll('[data-slot^="process-"]').forEach(slot => {
    if (slot.querySelector(':scope > .step-add-btn')) return;   // idempotent per render
    const base = slot.dataset.slot;

    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'step-add-btn';
    add.textContent = '+';
    add.title = 'Add another photo slot to this step';
    add.setAttribute('aria-label', 'Add another photo slot to this step');
    add.addEventListener('click', ev => {
      ev.stopPropagation(); ev.preventDefault();
      setReserved(project, base, stepLayout(project, base).length + 1);
      rerenderPhotos();
      photoToast('Added an empty slot — open a photo’s Move and pick it to fill.');
    });
    slot.appendChild(add);

    // "−" only on the horizontal (pager) cards, to undo an extra empty slot.
    if (!slot.querySelector('.card-pager')) return;
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'step-del-btn';
    del.textContent = '−';
    del.title = 'Remove the empty slot from this step';
    del.setAttribute('aria-label', 'Remove the empty slot from this step');
    del.addEventListener('click', ev => {
      ev.stopPropagation(); ev.preventDefault();
      const arr = stepLayout(project, base);
      if (!arr.length || arr[arr.length - 1] !== null) {
        photoToast('No empty slot to remove — move a photo out of the last slot first.');
        return;
      }
      setReserved(project, base, arr.length - 1);
      // If no empty slots remain, drop the reservation entirely so the step
      // collapses naturally when photos are later moved out.
      if (!stepLayout(project, base).some(x => x === null)) setReserved(project, base, 0);
      rerenderPhotos();
      photoToast('Removed the empty slot.');
    });
    slot.appendChild(del);
  });
}

function wireEditableCaptions() {
  document.querySelectorAll('[data-cap]').forEach(el => {
    if (el.classList.contains('cap-editable')) return;   // idempotent
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('spellcheck', 'true');
    el.classList.add('cap-editable');
    if (!el.textContent.trim()) el.dataset.empty = '';
    el.addEventListener('focus', () => delete el.dataset.empty);
    el.addEventListener('input', () => {
      const host = el.closest('[data-file]');
      if (!host) return;
      const text = el.textContent.replace(/\s+/g, ' ').trim();
      const ov = loadCaptionOverrides();
      ov[host.dataset.file] = text;
      localStorage.setItem(CAPTION_KEY, JSON.stringify(ov));
      const fig = el.closest('.gallery-item');
      if (fig) fig.dataset.caption = text; // keep lightbox in sync
    });
    // Enter commits instead of adding newlines.
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
    });
  });
}

function buildCaptionToolbar() {
  const bar = document.createElement('div');
  bar.className = 'cap-toolbar';
  bar.innerHTML = `
    <span class="cap-grip" title="Drag to move" aria-hidden="true">⠿</span>
    <span class="cap-badge">✎ Editing photos</span>
    <button type="button" data-act="copy">Copy label sheet</button>
    <button type="button" data-act="reset">Reset my edits</button>
    <button type="button" data-act="done">Done</button>`;
  document.body.appendChild(bar);
  makeToolbarDraggable(bar);

  bar.addEventListener('click', e => {
    const act = e.target.dataset.act;
    if (act === 'copy') {
      const text = buildLabelSheetText();
      navigator.clipboard.writeText(text).then(
        () => photoToast('Copied — paste it over js/photos.js to save for good.'),
        () => showCopyFallback(text)
      );
    } else if (act === 'reset') {
      // Clear caption edits, photo moves, and reserved empty slots.
      localStorage.removeItem(CAPTION_KEY);
      localStorage.removeItem(MOVES_KEY);
      localStorage.removeItem(PROCSLOTS_KEY);
      photoToast('Your local edits were cleared. Reloading…');
      setTimeout(() => location.reload(), 700);
    } else if (act === 'done') {
      history.replaceState(null, '', location.pathname + location.search);
      location.reload();
    }
  });
}

/* Let the editing toolbar be dragged out of the way. Drag anywhere on the bar
   except the buttons; the position is remembered (localStorage) and re-clamped
   into view on resize. */
const CAP_POS_KEY = 'capToolbarPos';
function clampToolbar(bar, x, y) {
  const w = bar.offsetWidth, h = bar.offsetHeight;
  return [
    Math.max(6, Math.min(x, window.innerWidth - w - 6)),
    Math.max(6, Math.min(y, window.innerHeight - h - 6)),
  ];
}
function placeToolbar(bar, x, y) {
  const [cx, cy] = clampToolbar(bar, x, y);
  bar.style.transform = 'none';
  bar.style.left = cx + 'px';
  bar.style.top = cy + 'px';
  bar.style.bottom = 'auto';
}
function makeToolbarDraggable(bar) {
  try {
    const p = JSON.parse(localStorage.getItem(CAP_POS_KEY) || 'null');
    if (p && typeof p.left === 'number') placeToolbar(bar, p.left, p.top);
  } catch { /* ignore */ }

  let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0, moved = false;
  bar.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;   // buttons still click normally
    dragging = true; moved = false;
    const r = bar.getBoundingClientRect();
    ox = r.left; oy = r.top; sx = e.clientX; sy = e.clientY;
    placeToolbar(bar, ox, oy);                // convert from centered to absolute
    bar.classList.add('dragging');
    try { bar.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    e.preventDefault();
  });
  bar.addEventListener('pointermove', e => {
    if (!dragging) return;
    if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 3) moved = true;
    placeToolbar(bar, ox + (e.clientX - sx), oy + (e.clientY - sy));
  });
  const end = e => {
    if (!dragging) return;
    dragging = false;
    bar.classList.remove('dragging');
    try { bar.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
    if (moved) {
      const r = bar.getBoundingClientRect();
      localStorage.setItem(CAP_POS_KEY, JSON.stringify({ left: r.left, top: r.top }));
    }
  };
  bar.addEventListener('pointerup', end);
  bar.addEventListener('pointercancel', end);
  window.addEventListener('resize', () => {
    if (!bar.style.left) return;
    const r = bar.getBoundingClientRect();
    placeToolbar(bar, r.left, r.top);
  });
}

function photoToast(msg) {
  let t = document.querySelector('.cap-toast');
  if (!t) { t = document.createElement('div'); t.className = 'cap-toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600);
}

// Regenerate the whole window.PHOTOS array with edited captions AND live moves
// (new project/step) merged in.
function buildLabelSheetText() {
  const overrides = loadCaptionOverrides();
  const moves = loadPhotoMoves();
  const esc = s => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const rows = window.PHOTOS.map(p => {
    const r = resolveRow(p, moves);
    const caption = overrides[p.file] != null ? overrides[p.file] : p.caption;
    const dir = p.dir ? `, dir: "${esc(p.dir)}"` : '';
    const title = p.title ? `, title: "${esc(p.title)}"` : '';
    return `  { file: "${esc(r.file)}", project: "${esc(r.project)}", step: "${esc(r.step)}", caption: "${esc(caption)}"${title}${dir} },`;
  }).join('\n');
  return `window.PHOTOS = [\n${rows}\n];\n`;
}

/* ---- On-page photo mover ----
   In edit mode each photo/video gets a "Move" button; it opens a small popover
   to pick a new project + slot. Applying records the move (localStorage) and
   re-places photos live — no organizer round-trip, no reload. */
function wireMovers() {
  const managed = new Set((window.PHOTOS || []).map(p => p.file));
  document.querySelectorAll('[data-file]').forEach(host => {
    // Only photos driven by js/photos.js can be moved. (Mini-bridge's pager
    // slides are hand-authored inline and aren't in window.PHOTOS.)
    if (!managed.has(host.dataset.file)) return;
    // Key off the button actually being present: a slot's template is restored
    // on re-render (wiping the button) while any dataset flag would persist.
    if ([...host.children].some(c => c.classList && c.classList.contains('photo-move-btn'))) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'photo-move-btn';
    btn.textContent = '⤢ Move';
    btn.title = 'Move this photo to another project / slot';
    btn.addEventListener('click', ev => { ev.stopPropagation(); ev.preventDefault(); openMoveMenu(host, btn); });
    host.appendChild(btn);
  });
}

function closeMoveMenu() {
  const m = document.querySelector('.photo-move-menu');
  if (m) m.remove();
  document.removeEventListener('click', onMoveAway, true);
}
function onMoveAway(e) {
  if (!e.target.closest('.photo-move-menu') && !e.target.closest('.photo-move-btn')) closeMoveMenu();
}

const escHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const shortFile = f => (f && f.length > 24) ? (f.slice(0, 11) + '…' + f.slice(-9)) : (f || '');

// The process steps a given project's page actually has — read live from the
// DOM for the current page (so numbers + titles match what you see), or from the
// static count map for other projects. Never offers a step the page lacks.
function processStepsFor(project) {
  if (project === document.body.dataset.project) {
    // Number comes from data-slot (stable) — the visible .card-num may already
    // be a rebuilt sub-number like "2.0" once the step is a pager.
    return [...document.querySelectorAll('[data-slot^="process-"]')].map(s => ({
      base: s.dataset.slot,
      num: parseInt(s.dataset.slot.replace('process-', ''), 10),
      title: (s.querySelector('.card-head h4')?.textContent || '').trim(),
    }));
  }
  const n = PROCESS_STEP_COUNTS[project] || 0;
  return Array.from({ length: n }, (_, k) => ({ base: `process-${k + 1}`, num: k + 1, title: '' }));
}

// Build the Slot <select> body for a project: cover, then each step broken into
// its sub-slots (N.0, N.1 …) tagged occupied/empty, plus an "add new" position;
// then gallery (and portrait for personal). curFile lets the current slot show
// "this photo" and stay selected.
function slotOptionsHTML(project, curStep, curFile) {
  const moves = loadPhotoMoves();
  const placed = (window.PHOTOS || []).map(p => resolveRow(p, moves)).filter(p => p.project === project);
  const selAttr = v => v === curStep ? ' selected' : '';
  let html = `<optgroup label="Cover"><option value="cover"${selAttr('cover')}>cover</option></optgroup>`;

  processStepsFor(project).forEach(st => {
    const group = placed.filter(p => baseStep(p.step) === st.base);
    const arr = layoutStepSlots(group, reservedFor(project, st.base));
    const count = Math.max(arr.length, 1);
    const glabel = st.title ? `Step ${st.num} — ${st.title}` : `Step ${st.num}`;
    let opts = '';
    for (let k = 0; k < count; k++) {
      const val = `${st.base}.${k}`;
      const occ = arr[k];
      const mine = occ && occ.file === curFile;
      const tag = mine ? 'this photo' : occ ? ('occupied: ' + shortFile(occ.file)) : 'empty';
      const isSel = val === curStep
        || (mine && (curStep === st.base || stepIndex(curStep) === k));
      opts += `<option value="${val}"${isSel ? ' selected' : ''}>${st.num}.${k} · ${escHtml(tag)}</option>`;
    }
    opts += `<option value="${st.base}.${count}">${st.num}.${count} · add new</option>`;
    html += `<optgroup label="${escHtml(glabel)}">${opts}</optgroup>`;
  });

  html += `<optgroup label="Gallery"><option value="gallery"${selAttr('gallery')}>gallery</option></optgroup>`;
  if (project === 'personal')
    html += `<optgroup label="Personal"><option value="portrait"${selAttr('portrait')}>portrait</option></optgroup>`;
  return html;
}

function openMoveMenu(host, anchor) {
  closeMoveMenu();
  const file = host.dataset.file;
  const moves = loadPhotoMoves();
  const raw = (window.PHOTOS || []).find(p => p.file === file) || { file };
  const cur = resolveRow(raw, moves);

  const pop = document.createElement('div');
  pop.className = 'photo-move-menu';
  pop.innerHTML = `
    <div class="pm-title">Move <code>${escHtml(file)}</code></div>
    <label class="pm-row"><span>Project</span>
      <select data-pm="project">${MOVE_PROJECTS.map(p => `<option value="${p}"${p === cur.project ? ' selected' : ''}>${p}</option>`).join('')}</select></label>
    <label class="pm-row"><span>Slot</span>
      <select data-pm="step">${slotOptionsHTML(cur.project, cur.step, file)}</select></label>
    <div class="pm-actions">
      <button type="button" data-pm-act="apply">Move here</button>
      <button type="button" data-pm-act="cancel">Cancel</button>
    </div>`;
  document.body.appendChild(pop);

  // Position under the button, kept on-screen.
  const r = anchor.getBoundingClientRect();
  const w = 280, h = 210;
  pop.style.top = Math.max(8, Math.min(r.bottom + 8, window.innerHeight - h - 8)) + 'px';
  pop.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + 'px';

  // Changing the project rebuilds the slot list from that project's real steps.
  const stepSel = pop.querySelector('[data-pm="step"]');
  pop.querySelector('[data-pm="project"]').addEventListener('change', e => {
    stepSel.innerHTML = slotOptionsHTML(e.target.value, null, file);
  });

  pop.querySelector('[data-pm-act="cancel"]').addEventListener('click', closeMoveMenu);
  pop.querySelector('[data-pm-act="apply"]').addEventListener('click', () => {
    const project = pop.querySelector('[data-pm="project"]').value;
    const step = pop.querySelector('[data-pm="step"]').value;
    closeMoveMenu();
    applyMove(file, project, step);
  });
  // Defer so this same click doesn't immediately close the menu.
  setTimeout(() => document.addEventListener('click', onMoveAway, true), 0);
}

function applyMove(file, project, step) {
  const moves = loadPhotoMoves();
  const raw = (window.PHOTOS || []).find(p => p.file === file);
  // Back to its original slot? Drop the override instead of storing a no-op.
  if (raw && raw.project === project && raw.step === step) delete moves[file];
  else moves[file] = { project, step };
  savePhotoMoves(moves);
  rerenderPhotos();
  // Pretty label: "process-5.2" -> "step 5.2", others stay as-is.
  const m = PROC_RE.exec(step);
  const pretty = m ? ('step ' + m[1] + (m[2] != null ? '.' + m[2] : '')) : step;
  const gone = project !== document.body.dataset.project;
  photoToast(gone
    ? `Moved to ${project} / ${pretty} — it now lives on that project's page.`
    : `Moved to ${pretty}.`);
}

function showCopyFallback(text) {
  const wrap = document.createElement('div');
  wrap.className = 'cap-fallback';
  wrap.innerHTML = `<div class="cap-fallback-inner">
    <p>Copy this and paste it over <code>js/photos.js</code>:</p>
    <textarea readonly></textarea>
    <button type="button">Close</button></div>`;
  wrap.querySelector('textarea').value = text;
  wrap.querySelector('button').addEventListener('click', () => wrap.remove());
  wrap.addEventListener('click', e => { if (e.target === wrap) wrap.remove(); });
  document.body.appendChild(wrap);
  wrap.querySelector('textarea').select();
}

/* ---- Auto-pull videos dropped into videos/<project>/ ----
   The site can't rely on the browser writing files, so trimmed clips are just
   downloaded and dragged into videos/<project-id>/. On a project page this fetches
   that folder's directory listing (the local python http.server provides one) and
   injects any video it finds as a gallery row — so it renders, and is movable /
   re-captionable in #edit like any other photo. On a static host with no directory
   listing this simply no-ops; bake the rows via "Copy label sheet" for deploy. */
async function initVideoFolder() {
  const project = document.body.dataset.project;
  if (!project || !Array.isArray(window.PHOTOS)) return;
  const dir = 'videos/' + project;
  let html;
  try {
    const res = await fetch(dir + '/', { cache: 'no-store' });
    if (!res.ok) return;
    html = await res.text();
  } catch { return; }
  const found = [];
  const re = /href="([^"?#]+)"/gi;
  let m;
  while ((m = re.exec(html))) {
    let f = m[1];
    if (f.startsWith('/') || f.includes('/')) continue;   // skip parent link + subdirs
    f = decodeURIComponent(f);
    if (VIDEO_RE.test(f)) found.push(f);
  }
  found.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  let added = 0;
  found.forEach(f => {
    if (window.PHOTOS.some(p => p.file === f)) return;     // already a managed row
    window.PHOTOS.push({ file: f, project, step: 'gallery', caption: '', dir });
    added++;
  });
  if (added && typeof rerenderPhotos === 'function') rerenderPhotos();
}

/* ---- boot ---- */
document.addEventListener('DOMContentLoaded', () => {
  injectLayout();
  initScrollHeader();
  initDropdowns();
  initReveal();
  initFilters();
  initWorkFilters();
  initPhotos();
  initGallery();
  initModelViewer();
  initProcessPile();
  initCardPagers();
  initCaptionEditor();
  initVideoFolder();
});
