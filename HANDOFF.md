# Handoff — Evan Lam Portfolio (`personal-hero` branch)

Context for another chat/session to continue the work. Delete this file when done.

## Project
- **What:** Static multi-page mechanical-engineering portfolio for **Evan Lam** (UH Mānoa student).
- **Stack:** Plain HTML/CSS/JS, no build step. Google Fonts (Archivo / Inter / Space Mono). One 3rd-party runtime dep: Google `<model-viewer>` via CDN (only on the RoSE page).
- **Repo:** https://github.com/evanlam-323/website
- **Active branch:** `personal-hero`. `main` still has the old "featured project (MK-IV)" placeholder — leave it alone.
- **Local preview:** `python -m http.server 8123` from the project root → `http://localhost:8123/index.html`. `.claude/launch.json` (git-ignored, local-only) holds preview configs: **`portfolio`** 8123, **`portfolio-alt`** 8137, **`site-preview`** 8150 (this session), and **`photo-organizer`** 8199 (serves the staging folder; absolute path — deletable when photo work is done).

## Architecture / conventions (read before editing)
- **Shared header + footer are injected by JS**, not hard-coded per page. They live in the `SITE` object and `buildHeader()` / `buildFooter()` in `js/main.js`. Each page has `<div id="header-mount"></div>` and `<div id="footer-mount"></div>`. **Edit header/footer/nav/socials/project-dropdown in `js/main.js` only.**
- `SITE.name`, `SITE.email` (`evanlam@hawaii.edu`), `SITE.location`, `SITE.tagline`, `SITE.socials` (LinkedIn only), `SITE.projects` (dropdown list) drive the whole site.
- **`.brand` CSS class** (`text-transform: none`) preserves mixed-case names like **RoSE** / **SoMa**. Wrap just the brand word: `Team <span class="brand">RoSE</span>`.
- **`.reveal`** = fade-in-on-scroll (IntersectionObserver in main.js).
- **Theme:** near-black `--bg: #0b0b0c`, industrial red-orange `--accent: #ea4a2a`. Panels `--bg-2: #0f0f11`, `--panel: #141416`. Change `--accent` to re-theme everything.
- **✅ Cache-busting — currently `?v=15`.** Every page links shared assets with a version query — `css/style.css?v=15`, `js/main.js?v=15`, `js/photos.js?v=15`. **After editing CSS or JS you MUST bump the number on ALL html files** so browsers load the new file:
  ```bash
  # from project root — bump v=15 to v=16 everywhere
  sed -i 's/?v=15/?v=16/g' *.html
  ```
  ⚠️ If you edit CSS/JS and DON'T bump the version, the browser serves the cached old file at the same URL and your change appears to do nothing. Bump every time.

## Pages
- `index.html` — hero + **Work grid** with a multi-select discipline filter (All / Robotics / Structures / Additive Mfg), per-card metric chips, image-ready thumbnails.
- `research.html` — "Research & Certifications" (5 certifications). Sidebar filter All / Certifications.
- `about.html` — bio / Capabilities / Timeline + "Awards & Honors" (5 awards).
- Seven project detail pages: `project-uh88-weather.html`, `project-rose-arm.html`, `project-mini-bridge.html`, `project-steel-bridge.html`, `project-soma-pump.html`, `project-stair-robot.html`, `project-kealakehe.html` (FIRST Robotics).
- `video-trimmer.html` — **author-only tool** (see below), not linked from the public site.

## Project-page conventions
- **Standardized specs:** every project's `.project-specs` has Role · Team · Process · Organization (UH-88 has an extended list).
- **Process pile** — every project's "How it was made → Process" section uses the SAME grey index-card skin `.process-section.process-pile.process-pile--index`. Cards are `position: sticky`, pinned at the same JS-centred `top`, stacked by z-index so each lands on top as you scroll (`initProcessPile()` drives opacity/scale + a per-card random `--tilt`, and marks the top card `.is-front` so only it takes clicks / shows pager controls).
- **Per-step photo pager** — a `process-N` slot with 2+ photos becomes a horizontal sweep pager (`buildProcessPager()` + `initCardPagers()`): each photo is its own grey card that sweeps in from the arrow side, scales down as it lands, at a small random tilt. Mini-bridge's pager is **hand-authored inline** (files like `mini-bridge-p1a.jpg`, NOT in `window.PHOTOS`); all others are auto-built from `photos.js` rows.

## Photo/video system (`js/photos.js` + `initPhotos`/`renderPhotos` in main.js)
- **`window.PHOTOS`** is one row per asset: `{ file, project, step, caption }`. `step` ∈ `cover` · `process-1…5` · `gallery` · (personal only) `portrait`. Project ids: `uh88-weather · rose-arm · mini-bridge · steel-bridge · soma-pump · stair-robot · kealakehe · personal`.
- **Placement is re-runnable (new this session).** `initPhotos()` snapshots each process/cover slot's pristine markup into `PHOTO_TEMPLATES`, then `renderPhotos()` restores from the template and re-places everything. That makes single↔pager↔empty transitions idempotent, which the live mover needs. Boot calls `initPhotos()`; live edits call `rerenderPhotos()` (re-place → wire new pagers → re-decorate editing → dispatch `resize` so the pile re-measures).
- **Videos render through the same system (new this session).** A row whose `file` ends in `.webm/.mp4/.mov/...` (`isVideoFile()`) renders a `<video>` instead of `<img>` in process steps and gallery, via `setSlotMedia()` (single) / `buildProcessPager()` (pager string) / `buildGalleryItem()` (gallery). Gallery video tiles show a first-frame poster + ▶ badge and play with controls in the lightbox (`initGallery()` now has an `.lb-video`, opens via a **delegated** click so it survives re-renders, and rebuilds items live). **Use `.webm`** — iPhone `.mov` (HEVC) usually won't play in browsers; trim them first.

## ⭐ Live caption editor + on-page photo mover (`#edit` mode)
Add `#edit` to any project-page URL. `initCaptionEditor()` adds `.editing-captions`, builds the bottom toolbar, and calls `decorateEditing()` (= `wireEditableCaptions()` + `wireMovers()`, both idempotent).
- **Captions:** every `[data-cap]` becomes contenteditable; edits save per-file to `localStorage[photoCaptions]`.
- **Mover (new this session):** every managed photo/video (`[data-file]` whose file is in `window.PHOTOS`) gets a **⤢ Move** button → popover to pick a new **project** and **slot**. `applyMove()` writes `localStorage[photoMoves]` (`{ file: {project, step} }`), then `rerenderPhotos()` re-places live (no reload). Moving a 2nd photo into a `process-N` step rebuilds it into the pager on the spot; moving to another project makes it leave this page.
- **Sub-slots + per-step `+` (latest):** a process step can hold multiple photos as a mini-bridge-style pager numbered `N.0 · N.1 · N.2…`. A photo's `step` is now either `process-N` (=position 0) or a sub-slot `process-N.k`; `baseStep()`/`stepIndex()` parse it and `layoutStepSlots()` orders photos + author-reserved blanks into slide positions. The Move menu's slot list is **built dynamically** (`slotOptionsHTML()` + `processStepsFor()`): the current page reads its real `data-slot` steps + titles from the DOM, other projects use `PROCESS_STEP_COUNTS` — so it **only offers steps that exist** (fixes photos vanishing into a nonexistent slot, e.g. `process-5` on 4-step soma-pump, or any process slot on inline-pager mini-bridge). Each step lists its exact sub-slots (occupied/empty) + an "add new" position. A `.step-add-btn` (`+`, top-right of every process card, edit mode) calls `setReserved()` → `localStorage[processSlots]` (`{project:{"process-5":count}}`) to reserve an empty slide you then fill via Move; a `.step-del-btn` (`−`, only on pager cards) removes a trailing empty slot again (via `stepLayout()`, and clears the reservation once no blanks remain). `buildProcessPager()` renders blank slides for unfilled positions and stamps each slide's `.card-num` with `N.i`. **Reset my edits** now also clears `processSlots`.
- **`resolveRow(p, moves)`** applies a move to a raw row; used by both `renderPhotos()` and `buildLabelSheetText()`.
- **Toolbar buttons:** **Copy label sheet** (regenerates the whole `window.PHOTOS` with captions **and** moves merged in — paste over `js/photos.js` to persist), **Reset my edits** (clears both `photoCaptions` + `photoMoves`), **Done**.
- Mini-bridge's inline pager slides are deliberately skipped by the mover (their files aren't in `window.PHOTOS`).
- See `PHOTOS.md` for the user-facing how-to.

## ⭐ Video Trimmer (`video-trimmer.html`, new this session, self-contained, no deps)
Author-only page to turn long clips into short web-ready ones. Zero dependencies — pure `<video>` + `<canvas>` + `MediaRecorder`. Nothing is uploaded.
- **Source picker = a grid of video previews** (styled like the photo organizer): **📁 Open video folder…** (`showDirectoryPicker`) lists every video in a chosen folder as a lazy-loaded (`IntersectionObserver`) first-frame thumbnail that **scrub-plays on hover**; also **＋ Add files…** and whole-page drag-drop. Cards show active/`✓ inserted` state + a `N / total` counter.
- **Trim:** click a preview → editor loads it → drag two handles on the timeline (or `Space` play, `[` / `]` set start/end).
- **Export:** re-encodes ONLY the selection to a small `.webm` by drawing frames to a canvas at a chosen max size (720p default) and recording `canvas.captureStream()` + optional audio track. **Real-time** (as long as the selection) — the tab must be focused/visible.
- **Insert (organizer-parity):** set project/slot/caption → **✚ Insert** writes the `.webm` into the site's `images/` (via **Set images/ folder** = a `showDirectoryPicker` readwrite handle; otherwise it downloads) and appends the row to a batch. **Copy all rows** → paste into `js/photos.js`. **Save all to images/…** writes every batched clip.
- **Source videos are extracted** from the Drive drop to **`C:\Users\ninja\Downloads\photo-staging\videos\`** (68 files, ~1.9 GB, some dupes like `IMG_1056(1).mov` — ignore). Point the folder picker there.

## Photo Organizer tool (staging — outside the repo, prior session)
- `C:\Users\ninja\Downloads\photo-staging\` (NOT in git). `original/` `web/` (66 web JPGs) `thumbs/`; `convert.py` / `build_organizer.py` / `copy_to_site.py`. `organizer.html` = visual picker; picks auto-save to `localStorage[photoOrganizerV1]`; "Copy photos.js" emits the label sheet. **`videos/`** added this session (the extracted Drive videos).

## 3D model pipeline (RoSE only)
- `models/rose-arm.glb` committed (3.44 MB). Built with `npx --yes @gltf-transform/cli optimize <in>.glb models/rose-arm.glb --compress draco --texture-compress webp`. **Must use `--compress draco`, NOT meshopt** (model-viewer 4.x has no meshopt decoder). The `Mesh is missing primitive index association` warnings are harmless.

## Key JS entry points (`js/main.js`, all called in the `DOMContentLoaded` boot block)
`injectLayout · initScrollHeader · initDropdowns · initReveal · initFilters · initWorkFilters · initPhotos · initGallery · initModelViewer · initProcessPile · initCardPagers · initCaptionEditor`.
New/changed this session: `renderPhotos` · `rerenderPhotos` · `snapshotPhotoTemplates` · `setSlotMedia` · `buildGalleryItem` · `isVideoFile` · `resolveRow` · `loadPhotoMoves`/`savePhotoMoves` · `decorateEditing` · `wireMovers` · `openMoveMenu`/`applyMove` · `photoToast`. `initGallery` rewritten (delegated open + video). `initCardPagers` got a `data-wired` re-wire guard.
Latest (sub-slots + `+`): `baseStep`/`stepIndex`/`baseNumOf` · `layoutStepSlots` · `loadProcSlots`/`saveProcSlots`/`reservedFor`/`setReserved` · `wireStepAdders` · `processStepsFor` · `slotOptionsHTML` · `shortFile`/`escHtml`. `renderPhotos` process loop, `buildProcessPager` (positioned array + blank slides + `N.i` numbering), and `openMoveMenu` (dynamic project-aware slot list) reworked. Consts: `PROCESS_STEP_COUNTS`, `PROC_RE`, `PROCSLOTS_KEY`; `MOVE_STEPS` removed.

## Git state
- **Base commit (unchanged HEAD):** `184eedc` "Place organizer photos into all projects; multi-photo process pager" on `personal-hero`.
- **Uncommitted — THIS session (2026-07-26), nothing committed yet:**
  - `js/main.js` — re-runnable photo pipeline (`renderPhotos`/templates), **video rendering** (img↔video), **live photo mover** (`wireMovers`/`applyMove`/`photoMoves`), `initGallery` delegated + video lightbox, `initCardPagers` re-wire guard, moves merged into `buildLabelSheetText`. **Latest:** process **sub-slots** (`process-N.k`, `N.0/N.1/N.2` numbering), dynamic project-aware Move slot list (`slotOptionsHTML`/`processStepsFor`, only real steps), per-step **`+`** to reserve empty pager slots (`wireStepAdders`/`processSlots`).
  - `css/style.css` — video-slot styles (`.card-media video`, `.gallery-video`, `.gallery-play`, `.lb-video`) + mover UI (`.photo-move-btn`, `.photo-move-menu`) + `.step-add-btn` / `.pager-slide--blank` / `.pager-blank-hint`.
  - `video-trimmer.html` — **new** author tool (untracked).
  - All `*.html` — cache-busters bumped `?v=9` → `?v=15`.
  - `PHOTOS.md` — documented videos, the live mover, the trimmer, and the sub-slot / `+` editor.
  - `photo-staging/videos/` — 68 extracted Drive videos (outside the repo).
- **`origin/personal-hero` is behind** — nothing pushed. **Confirm with the user before `git commit` / `git push`.**
- Commit trailer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

## Verification notes (this session)
Verified live on `http://localhost:8150`: live moves (single, pager rebuild, cross-project, label-sheet capture), video rendering in process pager + gallery + lightbox, the trimmer's preview grid + insert/batch, and the `canvas → MediaRecorder → webm` pipeline (valid VP9 blob). **No console errors** on any page. Two things are NOT verifiable in this harness because the preview pane runs hidden (no compositing): the trimmer's **real-time export** and its **thumbnail rendering** — both work in a normal visible browser tab, which is how they're used.

## Open decisions / TODO for next session
1. **Get real videos onto the site:** open `video-trimmer.html` in a visible Chrome tab, point it at `photo-staging/videos/`, trim the good clips, insert them (→ `images/` + `photos.js` rows). Nothing is placed yet.
2. **Covers:** no project has a `cover` photo — every banner is empty. Promote one photo (or a trimmed video) per project to `cover`.
3. **Personal photos have no home:** 2 `portrait` + 5 `gallery` rows sit in `photos.js` but nothing renders `data-project="personal"`. Wire the homepage hero to a `personal`/`portrait` photo and/or add a personal gallery/video section.
4. **Captions:** all placed photos have blank captions — fill via `#edit`.
5. **Mini-bridge process** still shows hand-authored placeholder steps (`mini-bridge-p*.jpg`); review/rewrite the sub-titles/captions or migrate them into `js/photos.js`.
6. **Cache-busters** are at `?v=15` — bump on the next CSS/JS edit.
7. Consider **GitHub Pages** for a live URL.
8. Nice-to-have: résumé/CV PDF download button.
