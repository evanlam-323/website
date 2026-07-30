/* =========================================================
   Launch splash + media warm-up.

   Shows a brief branded overlay on page load, preloads the
   images already in the page (hero, cover, work thumbnails —
   whatever is on THIS page), then fades out. It never blocks
   the visitor: a hard cap guarantees the splash always clears,
   even on a slow connection or if something fails to load.

   Loaded from <head> so the overlay exists before first paint
   (no flash of unstyled content). Styles live in css/style.css
   under "LAUNCH SPLASH".
   ========================================================= */
(function () {
  'use strict';

  var MIN_SHOW = 350;   // ms — floor so a fast load doesn't just blink
  var MAX_WAIT = 2500;  // ms — ceiling so we never trap the visitor
  var MAX_IMGS = 14;    // only warm the first N images, not a whole gallery
  var start = Date.now();

  var root = document.documentElement;
  root.classList.add('is-loading');

  var el = document.createElement('div');
  el.id = 'site-loader';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-label', 'Loading');
  el.innerHTML =
    '<div class="site-loader__inner">' +
      '<div class="site-loader__mark">EVAN LAM</div>' +
      '<div class="site-loader__bar"><span></span></div>' +
    '</div>';
  (document.body || root).appendChild(el);

  var done = false;
  function hide() {
    if (done) return;
    done = true;
    var wait = Math.max(0, MIN_SHOW - (Date.now() - start));
    setTimeout(function () {
      el.classList.add('is-done');
      root.classList.remove('is-loading');
      // remove after the fade so it can't intercept clicks
      setTimeout(function () { if (el.parentNode) el.remove(); }, 550);
    }, wait);
  }

  function run() {
    var bar = el.querySelector('.site-loader__bar span');

    // Make every image on the page decode off the main thread.
    var imgs = [].slice.call(document.querySelectorAll('img'));
    imgs.forEach(function (i) { try { i.decoding = 'async'; } catch (e) {} });

    // Collect unique sources to warm, capped so we never wait on
    // the full gallery — just what a visitor sees first.
    var srcs = [];
    imgs.forEach(function (i) {
      var s = i.currentSrc || i.getAttribute('src');
      if (s && srcs.indexOf(s) === -1) srcs.push(s);
    });
    srcs = srcs.slice(0, MAX_IMGS);

    var total = srcs.length || 1, loaded = 0;
    function bump() {
      loaded++;
      if (bar) bar.style.width = Math.min(100, Math.round(loaded / total * 100)) + '%';
    }

    var all = srcs.map(function (src) {
      return new Promise(function (res) {
        var im = new Image();
        im.onload = im.onerror = function () { bump(); res(); };
        im.src = src;
        if (im.complete) { bump(); res(); }
      });
    });

    Promise.all(all).then(hide);
    setTimeout(hide, MAX_WAIT); // hard cap — always clears the splash
  }

  // main.js (end of <body>) injects project media, so wait for the
  // parsed DOM before collecting sources.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
