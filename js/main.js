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

/* ---- boot ---- */
document.addEventListener('DOMContentLoaded', () => {
  injectLayout();
  initScrollHeader();
  initDropdowns();
  initReveal();
  initFilters();
});
