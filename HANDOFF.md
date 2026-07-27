# Handoff — Evan Lam Portfolio (`personal-hero` branch)

Context for another chat/session to continue the work. Delete this file when done.

## Project
- **What:** Static multi-page mechanical-engineering portfolio for **Evan Lam** (UH Mānoa student).
- **Stack:** Plain HTML/CSS/JS, no build step. Google Fonts (Archivo / Inter / Space Mono). One 3rd-party runtime dep: Google `<model-viewer>` via CDN (only on the RoSE page).
- **Repo:** https://github.com/evanlam-323/website
- **Active branch:** `personal-hero`. `main` still has the old "featured project (MK-IV)" placeholder — leave it alone.
- **Local preview:** `python -m http.server 8123` from the project root → `http://localhost:8123/index.html`. `.claude/launch.json` holds the preview configs (**`portfolio`** 8123, **`portfolio-alt`** 8137, plus this session's **`site-preview`** 8150 for the site and **`photo-organizer`** 8199 which serves the staging folder — the last one has an absolute path and can be deleted once photo work is done). **`.claude/` is git-ignored**, so `launch.json` is local-only.

## Architecture / conventions (read before editing)
- **Shared header + footer are injected by JS**, not hard-coded per page. They live in the `SITE` object and `buildHeader()` / `buildFooter()` in `js/main.js`. Each page has `<div id="header-mount"></div>` and `<div id="footer-mount"></div>`. **Edit header/footer/nav/socials/project-dropdown in `js/main.js` only.**
- `SITE.name`, `SITE.email` (`evanlam@hawaii.edu`), `SITE.location`, `SITE.tagline`, `SITE.socials` (LinkedIn only), `SITE.projects` (dropdown list) drive the whole site.
- **`.brand` CSS class** (`text-transform: none`) preserves mixed-case names like **RoSE** / **SoMa** inside otherwise-uppercased labels. Wrap just the brand word: `Team <span class="brand">RoSE</span>`.
- **`.reveal`** = fade-in-on-scroll (IntersectionObserver in main.js).
- **Theme:** near-black `--bg: #0b0b0c`, industrial red-orange `--accent: #ea4a2a`. Panels `--bg-2: #0f0f11`, `--panel: #141416`. Change `--accent` to re-theme everything.
- **✅ Cache-busting is in place — currently `?v=8`.** Every page links shared assets with a version query — `css/style.css?v=8`, `js/main.js?v=8`, `js/photos.js?v=8`. **After editing CSS or JS you MUST bump the number on ALL html files** (one command below) so browsers load the new file.
  ```bash
  # from project root — bump v=8 to v=9 everywhere
  sed -i 's/?v=8/?v=9/g' *.html
  ```
  ⚠️ **This bit us hard this session.** If you edit CSS/JS and DON'T bump the version, the browser keeps serving the cached old file at the identical URL and your change appears to "do nothing" — you can burn a lot of time thinking the code is wrong when it's just stale. Bump the version every time.

## Pages
- `index.html` — hero + **Work grid** with a **multi-select discipline filter** (All / Robotics / Structures / Additive Mfg), per-card **metric chips**, and image-ready thumbnails.
- `research.html` — **"Research & Certifications"** (5 certifications). Sidebar filter All / Certifications. Awards live in About.
- `about.html` — bio / **Capabilities** / **Timeline** + an **"Awards & Honors"** section (each award its own `.award-box`, 5 awards).
- Seven project detail pages: `project-uh88-weather.html`, `project-rose-arm.html`, `project-mini-bridge.html`, `project-steel-bridge.html`, `project-soma-pump.html`, `project-stair-robot.html`, `project-kealakehe.html` (FIRST Robotics).

## Project-page conventions
- **Standardized specs:** every project's `.project-specs` has **Role · Team · Process · Organization** (UH-88 has an extended spec list). Specific metrics live in the overview prose, not the spec table.
- **Team sizes:** RoSE = "Multidisciplinary (mech · EE · CS)", Mini-Bridge = 4, Steel Bridge = 20, SoMa Pump = 5, Stair Robot = 6, FIRST = 30, UH-88 = sole designer.

## ⭐ Process section — the "index" pile (ALL projects now use it)
Every project's **"How it was made" → Process** section is now the SAME skin: `.process-section.process-pile.process-pile--index`. (The old white "polaroid" skin and the plain `.steps` list were both **retired** — the user chose the grey index card as the single style.)

- **Look:** dark grey card `#23232a`, accent step number, image inset (`.card-media`, 4∶3), white uppercase title, dim description.
- **Card markup (standard):**
  ```html
  <article class="pile-card" data-slot="process-1">
    <div class="card-head"><span class="card-num">01</span><h4>Title</h4></div>
    <div class="card-media"> <img …onerror→placeholder> <div class="media-ph">…</div> </div>
    <p class="card-photo-cap" data-cap></p>   <!-- hidden except in #edit mode -->
    <p>Step description.</p>
  </article>
  ```
- **Behaviour:** `initProcessPile()` in `js/main.js`. All cards are `position: sticky`, pinned at the SAME `top` (JS-centred), stacked by z-index so each lands fully on top of the previous as you scroll. JS drives per-card `opacity`/`transform` (scale-down + fade-in) over a `DROP` window, plus a per-card random `--tilt`.
- **Front-card logic (added this session):** `initProcessPile()` marks the top-most (last-landed) card with class **`.is-front`** and sets `pointer-events:auto` on it / `none` on the rest. This (a) routes clicks to the card you actually see and (b) hides the pager arrows/dots on cards stacked behind (see mini-bridge). Non-front control hiding is in CSS: `.pile-card:not(.is-front) .pager-arrow, …{ opacity:0; pointer-events:none }`.
- **Photos:** driven by the label sheet `js/photos.js` via `data-slot="process-N"` (see Photo system). As of this session **all seven projects have photo rows** (regenerated from the Photo Organizer); a `process-N` slot with 2+ rows auto-becomes the sweep pager. Note **mini-bridge has no `data-slot` process cards** (its process is the hand-authored pager) and **soma-pump only has `process-1…4`**.

### Per-page extras
- **RoSE (`project-rose-arm.html`):** after the process pile → gallery → **interactive 3D model** (`<model-viewer>`, `models/rose-arm.glb`, camera-view arrows via `initModelViewer()`). Two-phase role "Contributor → Mechanical Lead".
- **UH-88 (`project-uh88-weather.html`):** adds a **Key Constraints** list and a **Safety Features** grid around the process pile.

## ⭐⭐ Per-step photo pager — Mini-Bridge (hand-authored) + auto-built elsewhere
Each mini-bridge process card is a **photo pager**: you page through multiple sub-photos, and the **whole polaroid sweeps sideways** to swap in the next one. **As of this session the same pager is also built dynamically** on any other project whose `process-N` slot has 2+ photos — see `buildProcessPager()` in `js/main.js` (Photo system). The two differ only in origin: mini-bridge's slides are **hand-written in the HTML** (with per-photo sub-titles like `1.0 Rules → 1.1 Extra Research`); the auto-built ones reuse the step's existing head + description on every slide and get their images/captions from `js/photos.js`. Both are wired by the same `initCardPagers()`.

- **Structure per card** (no `data-slot` — the single-photo loader `initPhotos()` deliberately ignores these; the pager owns its own images):
  ```html
  <article class="pile-card">
    <div class="card-pager" data-pager>
      <div class="pager-viewport">           <!-- overflow:hidden -->
        <div class="pager-track">            <!-- height animated by JS -->
          <div class="pager-slide" data-file="mini-bridge-p1a.jpg">
            <div class="card-head"><span class="card-num">1.0</span><h4>Rules &amp; Requirements</h4></div>
            <div class="card-media"> <img src="images/…"onerror→ph> <div class="media-ph">…</div> </div>
            <p class="card-desc" data-cap>Caption for this photo.</p>
          </div>
          … more .pager-slide …
        </div>
      </div>
      <button class="pager-arrow pager-prev">‹</button>   <!-- OUTSIDE the card border -->
      <button class="pager-arrow pager-next">›</button>
      <div class="pager-dots"></div>                       <!-- built by JS -->
    </div>
  </article>
  ```
- **Each slide is a full "polaroid face":** its own heading (`card-head`), photo, and bottom caption (`card-desc`) all live inside the slide and move together. Headings change per photo: `1.0 Rules & Requirements → 1.1 Extra Research`, `2.0 Team Coordination → 2.1 Weekly Syncs`, etc. (These sub-titles were authored as placeholders — edit them in the HTML.)
- **⭐ Swap animation (reworked this session — this is what the user cares about):** NOT a filmstrip anymore. `initCardPagers()` adds a `.js-pager` class that switches the slides to an **absolutely-stacked overlay** (`position:absolute; top/left/right:0`, opaque `#23232a` background). On a swap, the **incoming polaroid sweeps in from a full card-width off-frame**, scales down from `1.06 → 1` as it lands (the same "drop" feel as the scroll pile, but horizontal), and fades up on top (higher `z-index` + a `.is-sliding` drop-shadow). The **outgoing polaroid slides out the opposite way** (~0.62× width), shrinks to `0.94`, and fades beneath it. `next` enters from the right, `prev` from the left, dots infer direction from the jump; each lands at a **small random tilt**. `prefers-reduced-motion` → instant swap, no animation.
  - **How the transition is triggered (important pattern):** set the start pose with `transition:none`, force a reflow (`void nxt.offsetWidth`), then re-enable transition and set the end pose — this animates reliably WITHOUT `requestAnimationFrame` (rAF is throttled when the tab isn't compositing, which broke an earlier attempt).
  - **Height:** slides are absolute, so the track has no natural height — `sizeTo()` sets `track.style.height` to the visible slide's `offsetHeight` (animated via a CSS `height` transition) and recomputes on resize. Captions of different lengths therefore don't cause a jump.
  - **Durations:** transform `.6s`, opacity `.4s` (CSS). `finish()` waits for the **transform** `transitionend` (ignores the earlier opacity one), with an `800ms` fallback timer; an `animating` flag blocks re-entrancy mid-swap.
- **CSS lives in `css/style.css`** under "per-step photo pager": `.js-pager .pager-slide`, `.is-current`, `.is-sliding`, plus the arrows/dots. A single-photo card auto-hides its arrows/dots (handled in JS).
- **Arrows sit OUTSIDE the grey border:** absolutely positioned against `.pile-card` (`.card-pager` is `position:static`, `.pile-card` is the sticky/positioned ancestor). `left:-54px` / `right:-54px`; a `@media (max-width:640px)` query tucks them to `left/right:6px` so they don't overflow on mobile.
- **JS:** `initCardPagers()` in `js/main.js` (wires each `[data-pager]`). Relies on the shared `.is-front` logic so only the visible card's arrows show and only it is clickable.
- **Image slots (inline `src`, placeholder until the file exists):**
  `mini-bridge-p1a/-p1b`, `-p2a/-p2b`, `-p3a/-p3b/-p3c`, `-p4a/-p4b`, `-p5a/-p5b/-p5c` (`.jpg`, in `images/`). Add/remove `.pager-slide` blocks to change photo count per step.
- **Caption editing caveat:** the pager captions (`.card-desc[data-cap]`) are live-editable via `#edit` and persist in `localStorage`, but they are **inline in the HTML**, so the editor's "Copy label sheet" (which only regenerates `window.PHOTOS`) does NOT capture them. To change them permanently, edit `project-mini-bridge.html` directly. (If you want them managed like every other page, migrate them into `js/photos.js` and generalise `initPhotos()`.)

## Photo system (`js/photos.js` + live caption editor)
- **`window.PHOTOS`** is one row per photo: `{ file, project, step, caption }`. `step` is `cover`, `process-1…5`, `gallery`, or (personal only) `portrait`. `initPhotos()` (main.js) filters by `<body data-project>` and drops each file into its slot; missing files fall back to an SVG placeholder via `onerror`.
- **Project ids:** `uh88-weather · rose-arm · mini-bridge · steel-bridge · soma-pump · stair-robot · kealakehe · personal`.
- **⭐ Multi-photo process steps → auto-pager (added this session):** `initPhotos()` now gathers **all** rows for a `process-N` slot. **0** → placeholder, **1** → the card's single `.card-media` (old behaviour), **2+** → `buildProcessPager()` rebuilds the card as the mini-bridge sweep pager (see below), one photo per grey card. So the pager is **no longer mini-bridge-only** — any project can hold several photos in one process step just by adding more `process-N` rows.
- **Currently populated (regenerated this session from the Photo Organizer):** all seven projects have process/gallery rows; see the table in `PHOTOS.md`/commit. `personal` has 5 `gallery` + 2 `portrait` rows **that have no render target yet** (see TODO). **No project has a `cover` row** — every project banner is currently empty.
- **`personal` category:** organizer-only bucket with slots `portrait` (intended for the homepage hero `images/portrait.jpg`) and `gallery`. Nothing on the site reads `data-project="personal"` yet.
- **Live editor:** open any project page with `#edit` (e.g. `project-rose-arm.html#edit`) → captions become editable, saved to `localStorage`. "Copy label sheet" hands you the full `js/photos.js` text to paste back for permanence. See `PHOTOS.md` for the user-facing how-to.

## Photo Organizer tool (staging — outside the repo)
- Lives in **`C:\Users\ninja\Downloads\photo-staging\`** (NOT in git). Built this session to place a ~2 GB Google-Drive photo drop.
- `original/` = untouched HEIC/JPG; `web/` = converted+resized web JPGs (66 unique, dupes dropped); `thumbs/` = organizer thumbnails; `convert.py` / `build_organizer.py` regenerate them; `copy_to_site.py` copies `web/*.jpg` into the repo's `images/`.
- **`organizer.html`** = a visual picker (double-click, or served via the `photo-organizer` launch config). Each photo gets a project + slot + caption dropdown; picks auto-save to `localStorage` (key `photoOrganizerV1`); "Copy photos.js" emits the label sheet. Slot menu is project-aware (mini-bridge = cover/gallery only; soma-pump = process-1..4; personal = portrait/gallery).
- **67 videos** (.mov/.mp4) from the drop were **skipped** — still only inside the original zip in Downloads; they need compression + a player.

## 3D model pipeline (RoSE only)
- `models/rose-arm.glb` is committed (3.44 MB). Built with:
  `npx --yes @gltf-transform/cli optimize "<in>.glb" "models/rose-arm.glb" --compress draco --texture-compress webp`
- **Must use `--compress draco`, NOT meshopt** — model-viewer 4.x has no meshopt decoder. (The `Mesh is missing primitive index association` console warnings on the RoSE page come from this GLB and are harmless.)

## Key JS entry points (`js/main.js`, all called in the `DOMContentLoaded` boot block)
`injectLayout` · `initScrollHeader` · `initDropdowns` · `initReveal` · `initFilters` (research) · `initWorkFilters` (home) · `initPhotos` · `initGallery` (lightbox) · `initModelViewer` (RoSE camera arrows) · `initProcessPile` (pile drop + `.is-front`/pointer-events) · **`initCardPagers`** (mini-bridge photo pager) · `initCaptionEditor`.

## Git state
- Prior base: `d8a4d78` "Unify process piles to grey index skin; add mini-bridge photo pager" on `personal-hero`.
- **Committed this session — the mini-bridge pager animation rework:**
  - `js/main.js` → `initCardPagers()` rewritten: filmstrip `translateX` → absolute-stacked **horizontal sweep** (off-frame slide-in + scale "drop" + fade + random tilt, outgoing slides out the other way). Adds `sizeTo()` height management, reflow-flush transition trigger, `.is-sliding` shadow, transform-`transitionend` finish + fallback, and an `animating` re-entrancy guard.
  - `css/style.css` → per-step pager block rewritten for the overlay/crossfade: `.js-pager .pager-slide` (absolute, opaque `#23232a`), `.is-current`, `.is-sliding` shadow, animated track `height`, reduced-motion off-switch.
  - All `*.html` → cache-busters bumped **`?v=6` → `?v=8`** (two bumps this session while iterating).
- **Uncommitted — this session's photo placement (2026-07-26):**
  - `js/photos.js` → **regenerated** from the Photo Organizer: 66 real photos across all 7 projects + `personal`. All captions blank (user adds later). Replaced the old sample rows (the old `uh88-weather-*.jpg` / `rose-arm-p*.jpg` demo rows are gone).
  - `js/main.js` → `initPhotos()` process block rewritten for 0/1/2+ photos; new **`buildProcessPager()`** builds the sweep pager for multi-photo steps.
  - `images/` → **66 new web JPGs added** (converted from the Drive drop; originals live in `photo-staging/`). Old 12 sample images still present but mostly unreferenced now.
  - `.claude/launch.json` → added `site-preview` + `photo-organizer` configs (local-only, git-ignored).
  - Cache-busters **bumped `?v=8` → `?v=9`** across all `*.html` (this change touched `js/*`).
- **Nothing pushed** yet — `personal-hero` is ahead of `origin/personal-hero`. Confirm with the user before `git push`.
- Commit trailer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Verified live at normal + slowed speed on `http://localhost:8137/project-mini-bridge.html`: the whole polaroid sweeps horizontally, settles at a random tilt, one `.is-current` slide, no stray state, no console errors.

## Open decisions / TODO for next session

### ⭐ Requested feature — live on-page photo mover (gallery ↔ process)
**The user explicitly wants this.** Today, re-slotting a photo (moving it between `gallery` and `process-N`, or between projects) is done in the **Photo Organizer** (`photo-staging/organizer.html`) → change the slot dropdown → "Copy photos.js" → paste. The ask is to do it **live on the project page itself**, without the organizer round-trip:
- In an edit mode (extend the existing `#edit` mode in `initCaptionEditor()`), let the user **drag a gallery tile onto a process step (and vice-versa)**, or pick a new slot from a small menu on each photo.
- Update `window.PHOTOS` in memory + `localStorage` immediately, re-run the placement so the page reflects it live (same as caption edits do now).
- Extend the existing **"Copy label sheet"** so it serializes the moved `step`/`project` too (right now `buildLabelSheetText()` only re-emits captions — it already rewrites the whole `window.PHOTOS`, so it mostly works, but it reads `p.step`/`p.project` from the original rows, not from any in-browser move — that's the gap to close).
- Watch the multi-photo → pager transition: moving a 2nd photo into a `process-N` slot should rebuild that card via `buildProcessPager()` on the live re-render.

### Other items
1. **Covers:** no project has a `cover` photo — every banner is empty. Pick one photo per project to promote to `cover` (organizer or a `photos.js` row).
2. **Personal photos have no home:** 2 `portrait` + 5 `gallery` rows sit in `photos.js` but nothing renders `data-project="personal"`. Wire the homepage hero to a `personal`/`portrait` photo (currently hard-codes `images/portrait.jpg`) and/or add a personal gallery section.
3. **Captions:** all photos placed this session have blank captions — the user will fill them via `#edit`.
4. **Cache-busters** are at `?v=9` — bump again on the next CSS/JS edit.
5. Consider **GitHub Pages** for a live URL (personal-hero is pushed but not deployed).
6. **Mini-bridge:** its process still shows the hand-authored placeholder steps (`mini-bridge-p*.jpg`) — the user only assigned mini-bridge photos to the gallery. Review/rewrite those sub-titles/captions or migrate them into `js/photos.js`.
7. **Videos** (67 skipped): compress + add a player if wanted.
8. **Optional:** tighter pile stack offset / stronger fade of behind-cards (offered, not done).
9. Nice-to-have (not started): résumé/CV PDF download button.
