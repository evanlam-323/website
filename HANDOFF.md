# Handoff — Evan Lam Portfolio (`personal-hero` branch)

Context for another chat/session to continue the work. Delete this file when done.

## Project
- **What:** Static multi-page mechanical-engineering portfolio for **Evan Lam** (UH Mānoa student).
- **Stack:** Plain HTML/CSS/JS, no build step. Google Fonts (Archivo / Inter / Space Mono). One 3rd-party runtime dep: Google `<model-viewer>` via CDN (only on the RoSE page).
- **Repo:** https://github.com/evanlam-323/website
- **Active branch:** `personal-hero`. `main` still has the old "featured project (MK-IV)" placeholder — leave it alone.
- **Local preview:** two ways, both from the project root →
  - **`python serve.py`** (recommended, new this session) — static server **plus** the trimmer upload endpoint. Launch config **`portfolio-upload`** (8123). Use this so the Video Trimmer can auto-save clips.
  - **`python -m http.server 8123`** — plain static (config **`portfolio`**). Works, but the trimmer falls back to download instead of auto-saving.
  - `.claude/launch.json` (git-ignored, local-only) also has `portfolio-alt` 8137, `site-preview` 8150, `photo-organizer` 8199.

## Architecture / conventions (read before editing)
- **Shared header + footer are injected by JS**, not hard-coded per page. They live in the `SITE` object and `buildHeader()` / `buildFooter()` in `js/main.js`. Each page has `<div id="header-mount"></div>` and `<div id="footer-mount"></div>`. **Edit header/footer/nav/socials/project-dropdown in `js/main.js` only.**
- `SITE.name`, `SITE.email` (`evanlam@hawaii.edu`), `SITE.location`, `SITE.tagline`, `SITE.socials` (LinkedIn only), `SITE.projects` (dropdown list) drive the whole site.
- **`.brand` CSS class** (`text-transform: none`) preserves mixed-case names like **RoSE** / **SoMa**. Wrap just the brand word: `Team <span class="brand">RoSE</span>`.
- **`.reveal`** = fade-in-on-scroll (IntersectionObserver in main.js).
- **Theme:** near-black `--bg: #0b0b0c`, industrial red-orange `--accent: #ea4a2a`. Panels `--bg-2: #0f0f11`, `--panel: #141416`. Change `--accent` to re-theme everything.
- **✅ Cache-busting — currently `?v=17`.** Every page links shared assets with a version query — `css/style.css?v=17`, `js/main.js?v=17`, `js/photos.js?v=17`. **After editing CSS or JS you MUST bump the number on ALL html files** so browsers load the new file:
  ```bash
  # from project root — bump v=17 to v=18 everywhere
  sed -i 's/?v=17/?v=18/g' *.html
  ```
  ⚠️ Only matters under plain `http.server` (browser caches by URL). **`serve.py` sends everything `Cache-Control: no-store`, so locally it always serves fresh** — but still bump for correctness before committing/deploying.

## Pages
- `index.html` — hero + **Work grid** with a multi-select discipline filter. `research.html`, `about.html`.
- Seven project detail pages: `project-uh88-weather.html`, `project-rose-arm.html`, `project-mini-bridge.html`, `project-steel-bridge.html`, `project-soma-pump.html`, `project-stair-robot.html`, `project-kealakehe.html`.
- `video-trimmer.html` — **author-only tool** (see below), not linked from the public site.

## Project-page conventions
- **Standardized specs:** every project's `.project-specs` has Role · Team · Process · Organization.
- **Process pile** — grey index-card skin `.process-section.process-pile.process-pile--index`; sticky cards stacked by z-index (`initProcessPile()`).
- **Per-step photo pager** — a `process-N` slot with 2+ photos becomes a horizontal sweep pager (`buildProcessPager()` + `initCardPagers()`). Mini-bridge's pager is hand-authored inline (files like `mini-bridge-p1a.jpg`, NOT in `window.PHOTOS`).

## Photo/video system (`js/photos.js` + `initPhotos`/`renderPhotos` in main.js)
- **`window.PHOTOS`** is one row per asset: `{ file, project, step, caption }` (+ optional **`dir`**, new this session). `step` ∈ `cover` · `process-1…5` · `process-N.k` sub-slots · `gallery` · (personal only) `portrait`. Project ids: `uh88-weather · rose-arm · mini-bridge · steel-bridge · soma-pump · stair-robot · kealakehe · personal`.
- **Media path resolution (new):** `mediaSrc(entry)` returns `entry.dir ? entry.dir + '/' + entry.file : 'images/' + entry.file`. Photo rows (no `dir`) load from `images/`; video rows injected from the `videos/` folder carry `dir:"videos/<project>"` and load from there. All six render sites (lightbox, `setSlotMedia`, gallery `<img>`/`<video>`, pager string) go through it.
- **Videos** render as `<video>` when `isVideoFile()` matches `.webm/.mp4/.mov/...`. Gallery video tiles show a first-frame poster + ▶ badge and play with controls in the lightbox. **Use `.webm` or H.264 `.mp4`** — iPhone `.mov` (HEVC) usually won't play in browsers.
- **`buildLabelSheetText()`** now emits the `dir` field too, so baking the label sheet keeps folder videos pointing at `videos/` (deploy-safe).

## ⭐ videos/ folder + serve.py (drop-in / auto-save video pipeline — NEW this session)
The trimmer can't rely on the browser writing to disk, so video clips flow through a `videos/` folder instead of `images/` + hand-edited `photos.js`.
- **`videos/<project-id>/`** — one subfolder per project (8 of them, each with `.gitkeep`; see `videos/README.md`). Drop a `.webm` in and it appears in that project's **gallery** on refresh.
- **Auto-scan (`initVideoFolder()` in main.js, called last in boot):** on a project page it `fetch`es `videos/<project>/` (the dev server's **directory listing**), parses the `<a href>` entries, and injects any video file as a `window.PHOTOS` row `{file, project, step:'gallery', caption:'', dir:'videos/<project>'}` (deduped by filename), then `rerenderPhotos()`. Injected rows are fully movable / re-captionable in `#edit` like any photo.
- **`serve.py`** — static server + upload endpoint (localhost-only, ThreadingTCPServer on 127.0.0.1):
  - `GET /upload-ping` → `{"ok":true}` (trimmer capability probe).
  - `POST /upload/<project-id>` (body = clip bytes, `X-Filename` header) → writes `videos/<project>/<name>`. Validates project against the allowlist, sanitizes the name, video ext + 300 MB cap.
  - All responses `Cache-Control: no-store`.
- **Deploy caveat:** static hosts (GitHub Pages) don't serve directory listings, so the auto-scan **no-ops** there — but the video *files* still serve. Before deploying: on each project page open `#edit` → **Copy label sheet** → paste over `js/photos.js` (rows now include `dir`), and commit the `videos/` files.
- **Currently placed:** `videos/rose-arm/IMG_5566-clip.webm`, `videos/stair-robot/IMG_2044-clip.webm` (both verified rendering).

## ⭐ Video Trimmer (`video-trimmer.html`, author-only, self-contained, no deps)
Turns long clips into short web-ready ones. Pure `<video>` + `<canvas>` + `MediaRecorder`. Nothing uploaded to any third party.
- **Source picker:** grid of hover-scrub video previews (**Open video folder…** via `showDirectoryPicker`, **＋ Add files…**, drag-drop). Source clips live in **`C:\Users\ninja\Downloads\drive-videos\`** (61 files, extracted + de-duped from the Drive zip; `.webm` output, `.mov`/`.mp4` sources).
- **Default project dropdown** (header, "New clips → gallery of"): sets the target project for every clip you insert; slot defaults to `gallery`. Each loaded clip syncs to it.
- **Trim:** click a preview → drag two timeline handles (or `Space` play, `[`/`]` set start/end).
- **Export:** re-encodes ONLY the selection to `.webm` (canvas `captureStream` + `MediaRecorder`). Hardened this session: `video.play()` is wrapped (no more infinite hang on rejection) and a **stall watchdog** aborts with a clear message if playback doesn't advance.
  - ⚠️ **Export is real-time and needs a VISIBLE, FOREGROUND browser tab** the whole time it records. **It does NOT work reliably in the Claude browser pane** — the pane goes `hidden` when you switch to chat, playback pauses, and the watchdog reports "Export stalled." **Use a real Chrome window kept in front** for the few-second export. (Durable alternative, not built: a server-side **ffmpeg** trim endpoint in `serve.py` — removes the real-time/foreground requirement and handles HEVC. ffmpeg is NOT installed. User chose real Chrome for now.)
- **Insert → saves into `videos/<project>/`** (rewired this session; no longer touches `images/`/`photos.js`). Order: (1) **POST to `serve.py`** `/upload/<project>` — fully automatic, no download/no picking; (2) File System Access `videosDir` write if a site folder is connected; (3) plain **download** fallback (then drop it into `videos/<project>/` yourself). Status pill shows **⚡ auto-save ON → videos/** when `serve.py` is detected. Insert only marks a source ✓ when a write actually landed (honest counter).

## ⭐ Live caption editor + on-page photo/video mover (`#edit` mode)
Add `#edit` to any project-page URL. `initCaptionEditor()` builds the toolbar. **Captions:** every `[data-cap]` is contenteditable, saved to `localStorage[photoCaptions]`. **Mover:** every managed `[data-file]` (incl. injected folder videos) gets a **⤢ Move** popover → new project + slot; `applyMove()` writes `localStorage[photoMoves]` then `rerenderPhotos()` live. **Sub-slots + per-step `+`:** `process-N.k` numbering, `localStorage[processSlots]` reserves empties. Toolbar: **Copy label sheet** (regenerates `window.PHOTOS` with captions + moves + `dir` merged — paste over `js/photos.js`), **Reset my edits**, **Done**.

## Key JS entry points (`js/main.js`, all in the `DOMContentLoaded` boot block)
`injectLayout · initScrollHeader · initDropdowns · initReveal · initFilters · initWorkFilters · initPhotos · initGallery · initModelViewer · initProcessPile · initCardPagers · initCaptionEditor · initVideoFolder`.
New this session: **`mediaSrc`** (images/ vs videos/ path routing), **`initVideoFolder`** (auto-scan `videos/<project>/`), `dir` support threaded through `setSlotMedia`/`buildGalleryItem`/`buildProcessPager`/lightbox + `buildLabelSheetText`.

## Git state
- **HEAD before this session:** `aa44b7b` "Live editor: process sub-slots, dynamic Move menu, per-step +/-".
- **This commit adds:**
  - `js/main.js` — `videos/` folder auto-scan (`initVideoFolder`), `mediaSrc()` path routing, `dir` in the label sheet.
  - `video-trimmer.html` — export hardening (play-guard + stall watchdog), default-project dropdown, honest insert status, and **Insert rewired to save into `videos/<project>/`** (serve.py upload → FS-Access → download).
  - `serve.py` — **new** static + upload server.
  - `videos/` — **new** per-project folders (+ README) and 2 placed clips.
  - `*.html` — cache-busters bumped to `?v=17`.
  - `js/photos.js` — unchanged vs HEAD (a stray trimmer-inserted row was cleaned back out).
- **`origin/personal-hero` is behind** — confirm with the user before `git push`.
- Commit trailer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

## Verification notes (this session)
Verified live under `serve.py`: `videos/<project>/` auto-scan injects + renders (real clip on rose-arm + stair-robot, `200 video/webm`, correct path), lightbox plays from `videos/`, uh88-weather no longer shows a mis-targeted clip, `serve.py` ping/static/upload/project-validation, and browser-origin POST. **The trimmer's real-time export and thumbnail rendering are NOT verifiable in this harness** (preview pane runs hidden / doesn't composite) — they work in a visible Chrome tab, which is how the tool is used.

## Open decisions / TODO for next session
1. **More videos:** trim the good clips from `drive-videos/` in a **visible Chrome tab** (serve.py running), Insert → they land in `videos/<project>/`.
2. **Optional durable export:** install **ffmpeg** and add a `/trim` endpoint to `serve.py` so trimming is server-side (instant, no foreground-tab requirement, handles HEVC). User picked real-Chrome for now.
3. **Covers:** no project has a `cover` photo/video — banners are empty. Promote one per project.
4. **Personal photos have no home:** `personal` rows sit in `photos.js` but nothing renders `data-project="personal"`.
5. **Captions:** placed photos have blank captions — fill via `#edit`.
6. **Cache-busters** at `?v=17` — bump on the next CSS/JS edit (or rely on serve.py no-store locally).
7. Consider **GitHub Pages** for a live URL (remember to bake folder videos into `photos.js` first — see videos/ section).
8. Update **PHOTOS.md** (user-facing how-to) to document the `videos/` folder + serve.py auto-save flow.
