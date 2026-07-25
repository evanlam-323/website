# Handoff — Evan Lam Portfolio (personal-hero branch)

Context for another chat/session to continue the work. Delete this file when done.

## Project
- **What:** Static multi-page mechanical-engineering portfolio for **Evan Lam** (UH Mānoa student).
- **Stack:** Plain HTML/CSS/JS, no build step. Google Fonts (Archivo / Inter / Space Mono).
- **Repo:** https://github.com/evanlam-323/website
- **Active branch:** `personal-hero` (the personal-intro cover). `main` still has the old "featured project (MK-IV)" placeholder version — leave it alone.
- **Local server (for preview):** `python -m http.server 8123` from the project root, then open `http://localhost:8123/index.html`.

## Architecture / conventions (read before editing)
- **Shared header + footer are injected by JS**, not hard-coded per page. They live in the `SITE` object and `buildHeader()` / `buildFooter()` in `js/main.js`. Each page has `<div id="header-mount"></div>` and `<div id="footer-mount"></div>` that get replaced on load. **Edit header/footer/nav/socials/project-dropdown in `js/main.js` only.**
- `SITE.name`, `SITE.email`, `SITE.location`, `SITE.tagline`, `SITE.socials` (LinkedIn only), `SITE.projects` (dropdown list) drive the whole site.
- **`.brand` CSS class** (`text-transform: none`) preserves mixed-case names like **RoSE** / **SoMa** inside otherwise-uppercased labels. Wrap just the brand word: `Team <span class="brand">RoSE</span>`.
- **`.reveal`** class = fade-in-on-scroll (IntersectionObserver in main.js).
- **Theme:** near-black `--bg`, industrial red-orange `--accent: #ea4a2a`. Change `--accent` to re-theme everything.
- **Pages:** `index.html` (hero + Work grid), `research.html` (Research & Certifications table w/ filters), `about.html` (bio/skills/timeline), and six project detail pages: `project-rose-arm.html`, `project-mini-bridge.html`, `project-steel-bridge.html`, `project-soma-pump.html`, `project-stair-robot.html`, `project-kealakehe.html`.
- Header is transparent over the hero on `index` then fills black on scroll (`initScrollHeader`). Projects nav has a hover/tap **dropdown** of the six projects (`initDropdowns`).

## Decisions already locked (from user Q&A)
- **No GPA anywhere.** (Done.)
- **RoSE arm:** company label = **"Team RoSE"** (RoSE casing preserved), title = **"6 DOF Arm"**. Show the 2-year history as **one page, two phases**: **Contributor (year 1) → Mechanical Lead (year 2)** on the detail page. Keep a single card.
- **Steel Bridge:** drop "PSWS" from company + title (keep the 7th-place PSWS fact in body copy only).
- **High-school project** renamed to **"FIRST Robotics"** (category "Robotics") — do not name the high school on the project.
- **Research page** is now **"Research & Certifications"** and holds the real certs + awards with Certifications/Awards filters.
- **Work section layout:** keep the current **offset grid** (do NOT switch to spotlight/rows/list).
- **Additive Pump Subsystem** metric chip = **"In Development"**.

## DONE and committed/pushed (through commit `240d1e5`)
- Site identity switched to Evan Lam (name, `evanlam@hawaii.edu`, Honolulu, LinkedIn-only footer, tagline).
- Personal-intro hero (EVAN LAM), GPA removed everywhere.
- Six real projects wired as cards + detail pages, tagged by org/program.
- RoSE→"6 DOF Arm"/"Team RoSE", Steel Bridge PSWS removed, FIRST Robotics rename — titles, eyebrows, `<title>`, dropdown labels, and "Next Project" cross-links all updated.
- `research.html` → "Research & Certifications" with 5 real certs + 6 real awards and Certifications/Awards filters + quick stats. About-page recognition block removed (moved here).
- `.brand` utility added.

## IN PROGRESS — uncommitted working changes (NOT yet committed)
Two files are modified in the working tree (`git status`):
- **`index.html`** — the **Work grid was rewritten** to add: a discipline **filter bar** (`.work-filters` with `data-disc` buttons: All / Robotics / Structures / Additive Mfg), a **result-metric chip** per card (`.project-metric`), and **image-ready thumbnails** (`<img class="thumb-img" src="images/<slug>.jpg" onerror="this.remove()">` over an `.thumb-icon` SVG fallback). Each `<a class="project" data-disc="...">` now has a `data-disc` value.
  - Image slugs expected in `images/`: `rose-arm.jpg`, `mini-bridge.jpg`, `steel-bridge.jpg`, `soma-pump.jpg`, `stair-robot.jpg`, `first-robotics.jpg`.
  - Metric chips: RoSE `24th / 114`, Mini-Bridge `70+ lbs`, Steel Bridge `7th National`, Pump `In Development`, Stair `2nd Fastest`, FIRST `Worlds Qual`.
- **`css/style.css`** — added styles for `.thumb-img`/`.thumb-icon`, `.project-metric`, `.work-filters`/`.work-filter`, `.project[hidden]`, and the **`.model-frame`/`.model-viewer`/`.model-ph`** 3D-viewer block.

## REMAINING TODO (to finish the enhancements the user approved)
1. **Wire up the Work filters (JS).** In `js/main.js`, add an `initWorkFilters()` function and call it in the `DOMContentLoaded` boot block (next to `initFilters()`). It should:
   - Grab `.work-filter` buttons and `.project` cards.
   - On click: toggle `is-active` on the clicked button; for each card set `card.hidden = !(disc === 'all' || card.dataset.disc === disc)`.
   - (Mirror the existing `initFilters()` used by the research page.)
   - Filters won't do anything until this is added — the buttons and `data-disc` markup are already in `index.html`.
2. **Add the 3D CAD viewer to `project-rose-arm.html`** (the CSS is already in place):
   - In `<head>`, add the model-viewer module script (CDN, since this is a hosted static site, not a sandboxed artifact): `<script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>`.
   - Add a `<section class="model-section">` (inside the existing `.wrap`, e.g. after `.project-body`) with an eyebrow "Interactive Model", a `.model-frame` containing `<model-viewer src="models/rose-arm.glb" camera-controls auto-rotate ...>` and a `<div class="model-ph" slot="poster">` placeholder (cube icon + "Add models/rose-arm.glb"). It stays as a placeholder until the user drops in a GLB.
   - Note for user: export from Onshape → convert to **GLB/glTF** (STEP won't render in-browser); offer a "Download STEP" link beside it later.
3. **RoSE two-phase role.** On `project-rose-arm.html`, reflect **Contributor (year 1) → Mechanical Lead (year 2)** — e.g. update the Specifications "Role" row to `Contributor → Mechanical Lead` and add a sentence in the Overview distinguishing the two years (joined as a contributor, then led the mechanical design). Card can stay "2024 — Present".
4. **Verify** in the browser (start the server, hard-reload with a `?v=` cache-buster): filter buttons hide/show the right cards; metric chips render; thumbnails show placeholder icons (no images yet); the RoSE page shows the model-viewer placeholder.
5. **Commit + push** to `personal-hero` with a message like "Highlight projects: metric chips, discipline filters, image-ready cards, 3D viewer". End commit body with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

## Nice-to-have / open items (not started, optional)
- Real photos/renders dropped into `images/<slug>.jpg` auto-fill the card thumbnails.
- A résumé/CV PDF download button.
- Deploy to **GitHub Pages** for a live URL (repo already exists).
- The six project **detail pages** have real overviews + spec tables but **templated process steps with `IMAGE / … SLOT` placeholders** the user still needs to fill with real photos/CAD.
- Note repo has a `.gitignore` that excludes `.claude/` (the vendored UI/UX skill install) and OS junk.
