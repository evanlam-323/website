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
function initGallery() {
  const items = [...document.querySelectorAll('.gallery-item')];
  if (!items.length) return;

  const box = document.createElement('div');
  box.className = 'lightbox';
  box.innerHTML = `
    <button class="lb-close" aria-label="Close">×</button>
    <button class="lb-nav lb-prev" aria-label="Previous image">‹</button>
    <figure class="lb-stage">
      <img class="lb-img" alt="" hidden />
      <div class="lb-ph" hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>
        <span class="lb-ph-text">Image coming soon</span>
      </div>
      <figcaption class="lb-caption"></figcaption>
    </figure>
    <button class="lb-nav lb-next" aria-label="Next image">›</button>`;
  document.body.appendChild(box);

  const lbImg = box.querySelector('.lb-img');
  const lbPh = box.querySelector('.lb-ph');
  const lbPhText = box.querySelector('.lb-ph-text');
  const lbCap = box.querySelector('.lb-caption');
  let idx = 0;

  const render = () => {
    const item = items[idx];
    const img = item.querySelector('img');
    const caption = item.dataset.caption || '';
    lbCap.textContent = caption;
    // Guard against a broken/half-loaded image slipping into the lightbox.
    const broken = img && img.complete && img.naturalWidth === 0;
    const hasImage = img && img.getAttribute('src') && !item.classList.contains('is-empty') && !broken;
    if (hasImage) {
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = caption;
      lbImg.hidden = false; lbPh.hidden = true;
    } else {
      lbImg.hidden = true; lbPh.hidden = false;
      lbPhText.textContent = caption || 'Image coming soon';
    }
  };
  const open = i => { idx = i; render(); box.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = () => { box.classList.remove('open'); document.body.style.overflow = ''; };
  const go = d => { idx = (idx + d + items.length) % items.length; render(); };

  items.forEach((item, i) => {
    item.addEventListener('click', () => open(i));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
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

function loadCaptionOverrides() {
  try { return JSON.parse(localStorage.getItem(CAPTION_KEY) || '{}'); }
  catch { return {}; }
}
function captionFor(entry, overrides) {
  const o = overrides[entry.file];
  return (o != null ? o : entry.caption) || '';
}

function initPhotos() {
  const project = document.body.dataset.project;
  if (!project || !Array.isArray(window.PHOTOS)) return;
  const overrides = loadCaptionOverrides();
  const rows = window.PHOTOS.filter(p => p.project === project);
  const find = step => rows.find(p => p.step === step);

  // -- Cover --
  const cover = document.querySelector('[data-photo-cover]');
  if (cover) {
    const entry = find('cover');
    const img = cover.querySelector('img');
    if (entry && img) {
      cover.dataset.file = entry.file;
      img.src = 'images/' + entry.file;
      img.alt = captionFor(entry, overrides);
    } else {
      cover.classList.add('is-empty');
      if (img) img.remove();
    }
  }

  // -- Process steps --
  //  0 photos  -> leave the placeholder (marked empty)
  //  1 photo   -> drop it straight into the card's single .card-media
  //  2+ photos -> rebuild the card as the mini-bridge photo pager (each photo
  //               becomes its own grey card that sweeps in; arrows/dots page them)
  document.querySelectorAll('[data-slot^="process-"]').forEach(slot => {
    const stepRows = rows.filter(p => p.step === slot.dataset.slot);
    const img = slot.querySelector('img');
    const media = (img && img.closest('.card-media, .step-media')) || slot.querySelector('.card-media, .step-media') || slot;
    const cap = slot.querySelector('.card-photo-cap');

    if (stepRows.length === 0) {
      if (media && media.classList) media.classList.add('is-empty');
      if (img) img.remove();
      return;
    }

    if (stepRows.length === 1) {
      const entry = stepRows[0];
      slot.dataset.file = entry.file;
      if (img) {
        img.src = 'images/' + entry.file;
        img.alt = captionFor(entry, overrides);
      }
      if (cap) cap.textContent = captionFor(entry, overrides);
      return;
    }

    buildProcessPager(slot, stepRows, overrides);
  });

  // -- Gallery (built from every "gallery" row) --
  const grid = document.querySelector('[data-gallery]');
  if (grid) {
    const gal = rows.filter(p => p.step === 'gallery');
    grid.innerHTML = '';
    if (!gal.length) {
      grid.innerHTML = `<p class="gallery-empty">No gallery photos yet — add rows with <code>step: "gallery"</code> in <code>js/photos.js</code>.</p>`;
    }
    gal.forEach(entry => {
      const cap = captionFor(entry, overrides);
      const fig = document.createElement('figure');
      fig.className = 'gallery-item';
      fig.tabIndex = 0;
      fig.dataset.caption = cap;
      fig.dataset.file = entry.file;
      const img = document.createElement('img');
      img.src = 'images/' + entry.file;
      img.alt = cap;
      img.loading = 'lazy';
      img.addEventListener('error', () => {
        fig.classList.add('is-empty'); img.remove();
      });
      const ph = document.createElement('div');
      ph.className = 'gallery-ph';
      ph.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg><span>${entry.file}</span>`;
      const capEl = document.createElement('figcaption');
      capEl.dataset.cap = '';
      capEl.textContent = cap;
      fig.append(img, ph, capEl);
      grid.appendChild(fig);
    });
  }
}

/* Turn a single-photo process card into the mini-bridge photo pager so a step
   can hold several photos. Each photo becomes its own grey card (keeping the
   step's number, title and description) that sweeps in on arrow/dot paging.
   initCardPagers() — which runs after this — wires up the sweep animation. */
function buildProcessPager(slot, entries, overrides) {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const head = slot.querySelector('.card-head');
  const headHTML = head ? head.outerHTML : '';
  const num = (slot.querySelector('.card-num')?.textContent || slot.dataset.slot || '').trim();
  // The step's written description is the plain <p> that isn't the photo caption.
  const descEl = [...slot.querySelectorAll(':scope > p')].find(p => !p.classList.contains('card-photo-cap'));
  const descHTML = descEl ? descEl.innerHTML : '';
  const phSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>';

  const slides = entries.map(entry => {
    const cap = captionFor(entry, overrides);
    return `
      <div class="pager-slide" data-file="${esc(entry.file)}">
        ${headHTML}
        <div class="card-media">
          <img alt="${esc(cap)}" loading="lazy" src="images/${esc(entry.file)}"
               onerror="this.closest('.card-media').classList.add('is-empty'); this.remove();" />
          <div class="media-ph">${phSvg}<span>${esc(num)}</span></div>
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
    wireEditableCaptions();
  };

  if (editingRequested()) enable();
  // Allow toggling on without a reload if the hash is added later.
  window.addEventListener('hashchange', () => { if (editingRequested()) enable(); });
}

function wireEditableCaptions() {
  document.querySelectorAll('[data-cap]').forEach(el => {
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
    <span class="cap-badge">✎ Editing captions</span>
    <button type="button" data-act="copy">Copy label sheet</button>
    <button type="button" data-act="reset">Reset my edits</button>
    <button type="button" data-act="done">Done</button>`;
  document.body.appendChild(bar);

  const toast = msg => {
    let t = document.querySelector('.cap-toast');
    if (!t) { t = document.createElement('div'); t.className = 'cap-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600);
  };

  bar.addEventListener('click', e => {
    const act = e.target.dataset.act;
    if (act === 'copy') {
      const text = buildLabelSheetText();
      navigator.clipboard.writeText(text).then(
        () => toast('Copied — paste it over js/photos.js to save for good.'),
        () => showCopyFallback(text)
      );
    } else if (act === 'reset') {
      localStorage.removeItem(CAPTION_KEY);
      toast('Your local caption edits were cleared. Reloading…');
      setTimeout(() => location.reload(), 700);
    } else if (act === 'done') {
      history.replaceState(null, '', location.pathname + location.search);
      location.reload();
    }
  });
}

// Regenerate the whole window.PHOTOS array with edited captions merged in.
function buildLabelSheetText() {
  const overrides = loadCaptionOverrides();
  const esc = s => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const rows = window.PHOTOS.map(p => {
    const caption = overrides[p.file] != null ? overrides[p.file] : p.caption;
    return `  { file: "${esc(p.file)}", project: "${esc(p.project)}", step: "${esc(p.step)}", caption: "${esc(caption)}" },`;
  }).join('\n');
  return `window.PHOTOS = [\n${rows}\n];\n`;
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
});
