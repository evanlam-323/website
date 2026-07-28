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
- **✅ Cache-busting — currently `?v=22`.** Every page links shared assets with a version query — `css/style.css?v=22`, `js/main.js?v=22`, `js/photos.js?v=22`. **After editing CSS or JS you MUST bump the number on ALL html files** so browsers load the new file:
  ```bash
  # from project root — bump v=22 to v=23 everywhere
  sed -i 's/?v=22/?v=23/g' *.html
  ```
  ⚠️ Only matters under plain `http.server` (browser caches by URL). **`serve.py` sends everything `Cache-Control: no-store`, so locally it always serves fresh** — but still bump for correctness before committing/deploying.

## Pages
- `index.html` — hero (portrait is now an editable **personal photo slot**) + **Work grid** with a multi-select discipline filter. `research.html`. `about.html` — hero now two-column (intro left, **editable photo slot** right); the old **Timeline was replaced by a Goals checklist**.
- Seven project detail pages: `project-uh88-weather.html`, `project-rose-arm.html`, `project-mini-bridge.html`, `project-steel-bridge.html`, `project-soma-pump.html`, `project-stair-robot.html`, `project-kealakehe.html`.
- `video-trimmer.html` — **author-only tool** (see below), not linked from the public site.

## Project-page conventions
- **Standardized specs:** every project's `.project-specs` has Role · Team · Process · Organization.
- **Process pile** — grey index-card skin `.process-section.process-pile.process-pile--index`; sticky cards stacked by z-index (`initProcessPile()`).
- **Per-step photo pager** — a `process-N` slot with 2+ photos becomes a horizontal sweep pager (`buildProcessPager()` + `initCardPagers()`). **Mini-bridge is now fully managed too (changed this session):** its 5 process cards are `data-slot="process-N"` and its 12 process photos live in `js/photos.js` as `process-N.k` rows carrying a per-slide **`title`** — so they get Move / editable captions / per-step +/− like every other project. (Was previously hand-authored inline; the `mini-bridge-pN*.jpg` image files still don't exist, so the slots render as fillable placeholders.) `PROCESS_STEP_COUNTS['mini-bridge']` is now `5`.

## Photo/video system (`js/photos.js` + `initPhotos`/`renderPhotos` in main.js)
- **`window.PHOTOS`** is one row per asset: `{ file, project, step, caption }` (+ optional **`dir`** and **`title`**). `title` = a per-slide heading for process pager slides (mini-bridge uses it); `buildProcessPager` falls back to the step's shared `<h4>` when a row has no `title`, and `buildLabelSheetText` round-trips it. `step` ∈ `cover` · `process-1…5` · `process-N.k` sub-slots · `gallery` · (personal only) `portrait`. Project ids: `uh88-weather · rose-arm · mini-bridge · steel-bridge · soma-pump · stair-robot · kealakehe · personal`.
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
- **Export — server-side ffmpeg (default when `serve.py` + ffmpeg are present, NEW):** the Export button now POSTs the source bytes + trim points to **`serve.py` `/trim`**, which ffmpeg-cuts the selection and returns the `.webm`. **Instant (not real-time), no foreground/visible-tab requirement — works even in the Claude browser pane — and handles HEVC `.mov`.** The trimmer detects it via `/upload-ping` (`{ffmpeg:true}`) and relabels the button "Export trimmed clip (ffmpeg)". **ffmpeg installed this session via `winget install Gyan.FFmpeg` (8.1.2).** `serve.py` finds it on PATH or via a winget-dir glob (so it works before the shell's PATH refreshes).
  - **Browser fallback (only when serve.py/ffmpeg is absent):** the old canvas `captureStream` + `MediaRecorder` path. That one IS real-time and needs a VISIBLE, FOREGROUND real-Chrome tab (the Claude pane goes `hidden` and the stall watchdog reports "Export stalled"). With ffmpeg present you never hit this.
- **Insert → saves into `videos/<project>/`** (rewired this session; no longer touches `images/`/`photos.js`). Order: (1) **POST to `serve.py`** `/upload/<project>` — fully automatic, no download/no picking; (2) File System Access `videosDir` write if a site folder is connected; (3) plain **download** fallback (then drop it into `videos/<project>/` yourself). Status pill shows **⚡ auto-save ON → videos/** when `serve.py` is detected. Insert only marks a source ✓ when a write actually landed (honest counter).

## ⭐ Live caption editor + on-page photo/video mover (`#edit` mode)
Add `#edit` to any project-page URL. `initCaptionEditor()` builds the toolbar. **Captions:** every `[data-cap]` is contenteditable, saved to `localStorage[photoCaptions]`. **Mover:** every managed `[data-file]` (incl. injected folder videos) gets a **⤢ Move** popover → new project + slot; `applyMove()` writes `localStorage[photoMoves]` then `rerenderPhotos()` live. **Delete (NEW):** every managed `[data-file]` also gets a **🗑** button (top-left); `deletePhoto()` adds the file to `localStorage[photoDeletes]` (a plain array) and drops it from render + the label sheet — **non-destructive** (the file stays in `images/`/`videos/`). Undo via the toast (6 s) or **Reset my edits**. `photoDeletes` is filtered in `renderPhotos`, `stepLayout`, `slotOptionsHTML`, and `buildLabelSheetText`. **Sub-slots + per-step `+`:** `process-N.k` numbering, `localStorage[processSlots]` reserves empties. Toolbar: **Copy label sheet** (regenerates `window.PHOTOS` with captions + moves + `dir` merged, deletes omitted — paste over `js/photos.js`), **Reset my edits** (clears captions/moves/procSlots/deletes), **Done**.

**Flat pile in edit mode (NEW — bugfix).** The process section is a scroll-driven pinned card stack (`initProcessPile`): only the "front" card is interactive and card opacity tracks scroll. That broke editing — captions/Move on back cards were `pointer-events:none`, and a re-render that changed a card's height shifted doc positions enough to fade the whole pile to `opacity:0` ("all 5 cards vanish"). Fix: in `#edit`, `initProcessPile`'s `render()` lays the pile out **flat** (`flat = reduce || editing`): every card `opacity:1`, natural position, all marked `.is-front` (so the `:not(.is-front)` lockouts don't fire). CSS `body.editing-captions .pile-card { position:relative; top:auto!important; opacity:1!important; }` unpins it into a plain vertical list. `enable()` fires a `resize` so the pile re-flows the moment edit mode turns on. Public (non-edit) view is unchanged — still the pinned scroll-stack.

**Per-photo captions now show publicly (NEW).** `.card-photo-cap` was `display:none` off `#edit` (author saw captions only while editing). Now `display:block` with `.card-photo-cap:empty { display:none }` — a written caption shows on the live site, a blank one adds no clutter. The step's `<p class="card-desc">` (hardcoded per step) is separate and always showed; don't confuse the two.

## ⭐ Personal photo slots + Goals checklist (NEW this session — index & about)
The hero portrait and a new about-page photo box are **editable personal photo slots**, driven by `initPersonalSlots()` in main.js. This gave the `personal` photo rows a home for the first time (was TODO #4).
- **Markup:** any element with **`data-personal-slot="hero|about"`**. `index.html`'s `.hero-portrait` is the `hero` slot; `about.html`'s hero-right `.hero-portrait.about-photo` is the `about` slot. **Both pages now load `js/photos.js`** (they didn't before) so the personal set is available.
- **Picker (`#edit` only):** `enablePersonalEditing()` adds a **`+` button** (`.personal-add-btn`) to each slot — small top-right when filled, big centered when empty. Click → `openPersonalPicker()` overlay (`.personal-picker`) showing every image row where `project==='personal'` (`personalPhotoFiles()`, videos skipped) as a thumbnail grid. **Multi-select (changed):** tapping a thumbnail toggles it in/out of the slot's set (accent ring + ✓ badge, live "N selected" count); **Clear all** empties it, **Done** closes. Changes apply live on every toggle.
- **Cross-fade rotation (NEW):** a slot holding **2+ photos** stacks two `.portrait-img` layers and cross-fades between the picks every `PERSONAL_ROTATE_MS` (5 s) via a per-element `slot._rotTimer` (`setInterval`, cleared on each re-render). One photo = static (no timer). Honors `prefers-reduced-motion: reduce` (no rotation). CSS: `.portrait-img` is now `position:absolute; inset:0` with a `1.1s` opacity transition.
- **State + baked defaults (UPDATED):** per-browser choices save to **`localStorage[personalSlots]`** = `{hero, about}` where each value is an **array of filenames** in `images/` (a legacy single string is still read via `slotFilesFor()`), re-rendered by `renderPersonalSlot()`. **The user's picks are now baked into code** as **`PERSONAL_DEFAULTS`** at the top of the personal-slots block in `js/main.js` — `hero: ['IMG_6901.jpg']`, `about: ['IMG_5021.jpg','IMG_6243.jpg','IMG_7858.jpg','IMG_7737.jpg','IMG_4567_Original.jpg']`. `slotFilesFor()` falls back to `PERSONAL_DEFAULTS[slot]` when localStorage has no entry, so the photos load **for everyone, every browser, and on deploy**. An `#edit` pick still overrides per-browser; **Clear all** removes the localStorage entry and thus reverts the slot to its baked default (not to empty). The baked first photo is also hard-coded into the HTML `<img>` (`index.html` hero = `IMG_6901.jpg`, `about.html` box = `IMG_5021.jpg`) so it paints before JS runs / even with JS disabled. **To change the site photos for everyone, edit `PERSONAL_DEFAULTS` (and, optionally, the baked `<img src>`).**
- **Goals checklist (`about.html`):** replaced the old `.timeline`. `<ul class="goals" data-goals>` with 8 **placeholder** goals (`.goal-item` + hidden checkbox + styled `.goal-box`). `initGoals()` remembers checked state in **`localStorage[aboutGoals]`** (indexed array). User will rewrite the 8 goal texts later.
- **Edit-mode reach:** `initPersonalSlots`/`initGoals` run on **every** page (not gated on `data-project` like `initCaptionEditor`), so `#edit` now does something on index & about too. The full caption/move/delete toolbar is still project-pages-only.

## Key JS entry points (`js/main.js`, all in the `DOMContentLoaded` boot block)
`injectLayout · initScrollHeader · initDropdowns · initReveal · initFilters · initWorkFilters · initPhotos · initGallery · initModelViewer · initProcessPile · initCardPagers · initCaptionEditor · initVideoFolder · initGoals · initPersonalSlots`.
Prior session: **`mediaSrc`** (images/ vs videos/ path routing), **`initVideoFolder`** (auto-scan `videos/<project>/`), `dir` support threaded through `setSlotMedia`/`buildGalleryItem`/`buildProcessPager`/lightbox + `buildLabelSheetText`.
Personal slots: **`initPersonalSlots`/`renderPersonalSlot`/`enablePersonalEditing`/`openPersonalPicker`/`personalPhotoFiles`/`slotFilesFor`** + `PERSONAL_DEFAULTS` (baked picks); **`initGoals`** (about goals).

## Git state
- **This session (personal-photo multi-select + cross-fade + baked defaults):**
  - `js/main.js` — about/hero slots now hold **multiple** photos: `slotFilesFor()` (array/legacy-string normalizer), `renderPersonalSlot()` rewritten to stack two `.portrait-img` layers and cross-fade every `PERSONAL_ROTATE_MS`; `openPersonalPicker()` rewritten as a **multi-select** toggle picker (Clear all / Done). **Bugfix:** render now resets `display` + adds an `onload` handler so a prior 404 (the old missing `portrait.jpg`) no longer leaves the layer hidden after a real pick. **`PERSONAL_DEFAULTS`** bakes the user's chosen hero + about photos so they load without localStorage / on deploy.
  - `css/style.css` — `.portrait-img` now `position:absolute; inset:0` with a `1.1s` opacity transition (+ reduced-motion off); `.pp-item.selected`/`.pp-check`/`.pp-hint`/`.pp-count`/`.pp-done` multi-select picker styles.
  - `index.html` — baked hero `<img src="images/IMG_6901.jpg">`. `about.html` — baked `<img src="images/IMG_5021.jpg">`, placeholder no longer `show` by default, "Add photos" copy.
  - `*.html` cache-busters bumped `?v=22`→`?v=25`.
- **Prior session (`d7118f9` — personal photo slots + goals + rover covers):**
  - `js/main.js` — `initPersonalSlots` + picker + `initGoals` (see section above), both added to boot.
  - `css/style.css` — `.about-hero` two-column hero, `.about-photo`, `.personal-add-btn`, `.personal-picker` overlay, `.goals`/`.goal-item`/`.goal-box` checklist, `a[href="project-rose-arm.html"] .thumb-img` + `[data-project="rose-arm"] .project-cover img` right-biased `object-position: 72%`.
  - `js/photos.js` — steel-bridge gallery gains `steel-bridge-team.jpg`; rose-arm **cover swapped to `IMG_7334.jpg`** (the URC rover), old `IMG_5646.jpg` demoted to gallery.
  - `index.html` — hero portrait is `data-personal-slot="hero"`; loads `js/photos.js`. `about.html` — two-column hero with `about` slot, Timeline→Goals; loads `js/photos.js`.
  - New images: `images/IMG_7334.jpg` (rover), `images/rose-arm.jpg` (= rover, homepage thumb), `images/steel-bridge-team.jpg` (welding team).
  - `*.html` cache-busters bumped `?v=20`→`?v=22` (two bumps within the session).
- **Prior session (editor bugfixes + delete + saved photos):**
  - `js/main.js` — flat pile in `#edit` (`initProcessPile.render()` `flat` branch + `enable()` resize), photo **delete** feature (`photoDeletes`, `wireDeleters`/`deletePhoto`/`photoToastUndo`, filtered in render/stepLayout/slotOptionsHTML/label sheet), reset clears `photoDeletes`.
  - `css/style.css` — `body.editing-captions .pile-card` flat layout; `.card-photo-cap` visible when non-empty (`:empty` hidden); `.photo-del-btn` + `.cap-toast-undo` styles.
  - `js/photos.js` — **user's saved arrangement** baked from their label sheet: `IMG_5646.jpg`→cover, 14 rose-arm `-clip.webm` rows placed into process sub-slots (3.0–3.5, 4.0/4.1, 5.0/5.1, 2.1), caption on `IMG_6673-clip.webm`.
  - `videos/rose-arm/` — 13 new clips added (were untracked) + `IMG_5566-clip.webm` re-exported.
  - `*.html` — cache-busters bumped to `?v=20`.
  - Other `videos/<project>/` untracked clips (kealakehe/mini-bridge/soma-pump/stair-robot/steel-bridge/uh88-weather) are **not** referenced by `photos.js` yet — left for a future placement pass.
- **Prior session (`aa44b7b` → previous commit):** `videos/` folder auto-scan (`initVideoFolder`), `mediaSrc()` path routing, `dir` in label sheet, trimmer server-side ffmpeg export, `serve.py`.
- **`origin/personal-hero` is behind** — confirm with the user before `git push`.
- Commit trailer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

## Verification notes (this session)
Verified live under `serve.py`: `videos/<project>/` auto-scan injects + renders (real clip on rose-arm + stair-robot, `200 video/webm`, correct path), lightbox plays from `videos/`, uh88-weather no longer shows a mis-targeted clip, `serve.py` ping/static/upload/project-validation, and browser-origin POST. **The trimmer's real-time export and thumbnail rendering are NOT verifiable in this harness** (preview pane runs hidden / doesn't composite) — they work in a visible Chrome tab, which is how the tool is used.

## Open decisions / TODO for next session
1. **More videos:** trim the good clips from `drive-videos/` in a **visible Chrome tab** (serve.py running), Insert → they land in `videos/<project>/`.
2. ~~**Optional durable export:** install ffmpeg + add `/trim` to `serve.py`.~~ **✅ DONE** — ffmpeg installed (`winget Gyan.FFmpeg` 8.1.2), `serve.py` `/trim` endpoint added, Export rewired to use it (recorder kept as fallback). Verified end-to-end incl. HEVC `.mov` and inside the Claude pane.
3. **Covers:** rose-arm cover is now the URC rover (`IMG_7334.jpg`) and steel-bridge has a gallery photo; the **other projects still have empty banners** — promote one each.
4. ~~**Personal photos have no home.**~~ / ~~**Follow-up: bake the chosen files into code.**~~ **✅ DONE** — hero + about slots pick from the `personal` set in `#edit` (multi-select, cross-fade for 2+), and the user's picks are now **baked into `PERSONAL_DEFAULTS` in `js/main.js`** + the baked HTML `<img>` (see Personal photo slots section), so they load without localStorage and on deploy. **Remaining nicety (optional):** round-trip these through `photos.js` (steps `hero`/`about`) / the label sheet — currently `PERSONAL_DEFAULTS` is the source of truth, edited by hand.
   - **Goals:** the 8 about-page goals are placeholders — user will supply real ones (edit `about.html` `data-goals` list). Checked state is per-browser.
5. **Captions:** most placed photos still have blank captions — fill via `#edit` (they now show on the live site, so it's worth doing). rose-arm's competition clip has one.
6. **More video placement:** the non-rose-arm `videos/<project>/` clips are on disk but unplaced — open each project `#edit`, Move them into slots, Copy label sheet, paste over `photos.js`.
7. **Cache-busters** at `?v=25` — bump on the next CSS/JS edit (or rely on serve.py no-store locally).
8. Consider **GitHub Pages** for a live URL (remember to bake folder videos into `photos.js` first — see videos/ section).
9. Update **PHOTOS.md** (user-facing how-to) to document the `videos/` folder + serve.py auto-save flow, the 🗑 delete button, and that captions now show publicly.
