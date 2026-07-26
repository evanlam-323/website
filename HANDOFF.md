# Handoff — Evan Lam Portfolio (`personal-hero` branch)

Context for another chat/session to continue the work. Delete this file when done.

## Project
- **What:** Static multi-page mechanical-engineering portfolio for **Evan Lam** (UH Mānoa student).
- **Stack:** Plain HTML/CSS/JS, no build step. Google Fonts (Archivo / Inter / Space Mono). One 3rd-party runtime dep: Google `<model-viewer>` via CDN (only on the RoSE page).
- **Repo:** https://github.com/evanlam-323/website
- **Active branch:** `personal-hero`. `main` still has the old "featured project (MK-IV)" placeholder — leave it alone.
- **Local preview:** `python -m http.server 8123` from the project root → `http://localhost:8123/index.html`. There is also a `.claude/launch.json` (name **`portfolio`**, port 8123) for the preview tooling. **`.claude/` is git-ignored**, so `launch.json` is local-only.

## Architecture / conventions (read before editing)
- **Shared header + footer are injected by JS**, not hard-coded per page. They live in the `SITE` object and `buildHeader()` / `buildFooter()` in `js/main.js`. Each page has `<div id="header-mount"></div>` and `<div id="footer-mount"></div>`. **Edit header/footer/nav/socials/project-dropdown in `js/main.js` only.**
- `SITE.name`, `SITE.email` (`evanlam@hawaii.edu`), `SITE.location`, `SITE.tagline`, `SITE.socials` (LinkedIn only), `SITE.projects` (dropdown list) drive the whole site.
- **`.brand` CSS class** (`text-transform: none`) preserves mixed-case names like **RoSE** / **SoMa** inside otherwise-uppercased labels. Wrap just the brand word: `Team <span class="brand">RoSE</span>`.
- **`.reveal`** = fade-in-on-scroll (IntersectionObserver in main.js).
- **Theme:** near-black `--bg: #0b0b0c`, industrial red-orange `--accent: #ea4a2a`. Panels `--bg-2: #0f0f11`, `--panel: #141416`. Change `--accent` to re-theme everything.
- **⚠️ CSS cache gotcha:** pages link `css/style.css` with **no cache-buster**. After CSS edits, **hard-refresh (Ctrl+Shift+R)** or a soft reload shows stale styles. (HTML is usually loaded with a `?v=` buster during testing.)

## Pages
- `index.html` — hero + **Work grid** with a **multi-select discipline filter** (All / Robotics / Structures / Additive Mfg), per-card **metric chips**, and image-ready thumbnails.
- `research.html` — **"Research & Certifications"**. Title now wraps **"RESEARCH &"** / **"CERTIFICATIONS"** (accent `&` on the Research line). Holds **certifications only** (5). Sidebar filter = All / Certifications; quick stat = 05 Certifications. **Awards were moved to About.**
- `about.html` — bio / **Capabilities** (skills) / **Timeline**, plus an **"Awards & Honors"** section where **each award is its own `.award-box`** (5 awards). No valedictorian mention anywhere (removed — it also named the high school, which is off-limits).
- Six project detail pages: `project-rose-arm.html`, `project-mini-bridge.html`, `project-steel-bridge.html`, `project-soma-pump.html`, `project-stair-robot.html`, `project-kealakehe.html` (FIRST Robotics).

## Project-page conventions
- **Standardized specs:** every project's `.project-specs` has exactly **Role · Team · Process · Organization**, in that order. Specific metrics (load targets, placements, DOF, incline, etc.) live in the **overview prose**, not the spec table.
- **Team sizes:** RoSE = "Multidisciplinary (mech · EE · CS)", Mini-Bridge = 4, Steel Bridge = 20, SoMa Pump = 5, Stair Robot = 6, FIRST = 30.
- Most pages still use the plain numbered **`.steps` / `.step`** process list. **Only RoSE and Stair Robot** use the new picture-book pile (see below).

## RoSE page (`project-rose-arm.html`) — the feature-rich template
Order inside `.wrap`: cover → project-body (overview + specs) → **process pile** → **gallery** → **interactive model** → next-project.
1. **Two-phase role:** overview + spec Role show **Contributor → Mechanical Lead** (year 1 → year 2).
2. **Picture-book process = "polaroid" skin** (`.process-pile.process-pile--polaroid`). Cards are `position: sticky` and form a **growing pile**; `initProcessPile()` (main.js) JS-centres each card's sticky `top` on lock (so captions stay fully visible) and adds `.is-in` via IntersectionObserver. **Animation:** each polaroid **materialises a touch larger (scale 1.16) then shrinks to scale 1 and fades in**, keeping a per-card **random tilt** (`--tilt` custom prop). White polaroid frame, caption below.
3. **Gallery = grid + lightbox** (`.gallery-grid`, `initGallery()`). Tiles are image-ready (`images/rose-arm-1.jpg`…`-6.jpg`); clicking any opens a fullscreen lightbox with prev/next/Esc. (An earlier "scatter/drop pile" gallery experiment was **reverted** back to the grid.)
4. **Interactive 3D model** at the bottom (`.model-section`). Compact centred `<model-viewer>` (~480px). **Arrows (‹ ›) and ←/→ keys switch between preset camera views** (Iso/Front/Right/Back/Left/Top) via `initModelViewer()`; drag-to-orbit + scroll-zoom retained; auto-rotate is OFF. Model file: **`models/rose-arm.glb`** (see 3D notes).

## Stair Robot page — the "index/blueprint" process skin
`project-stair-robot.html` uses `.process-pile.process-pile--index`: same sticky pile mechanism, but **dark card, accent step number, image inset, drop-in with slight tilt** (translateY + rotate). Card bg was lightened to `#23232a` with a stronger border for separation. This exists so the user can **compare polaroid vs index** side by side.

## 3D model pipeline (important)
- Source was a 63 MB Onshape export. Compressed to **3.44 MB** with:
  `npx --yes @gltf-transform/cli optimize "<in>.glb" "models/rose-arm.glb" --compress draco --texture-compress webp`
- **Must use `--compress draco`, NOT meshopt** — `@google/model-viewer@4.3.1` has no meshopt decoder and errors ("setMeshoptDecoder must be called…"). Draco decodes natively.
- The optimizer also **simplifies** the mesh; that's what gets it to 3.44 MB. For crisper geometry, re-run **without** simplification (~8–10 MB, still fine).
- `models/rose-arm.glb` **is committed** (real site asset).

## Image slots (all optional — placeholders show until a file is dropped in)
- Portrait: `images/portrait.jpg` (home hero).
- Work-grid thumbs: `images/rose-arm.jpg`, `mini-bridge.jpg`, `steel-bridge.jpg`, `soma-pump.jpg`, `stair-robot.jpg`, `first-robotics.jpg`.
- RoSE gallery: `images/rose-arm-1.jpg` … `rose-arm-6.jpg`.
- RoSE process (polaroid): `images/rose-arm-p1.jpg` … `rose-arm-p5.jpg`.
- Stair process (index): `images/stair-p1.jpg` … `stair-p5.jpg`.
All use an `onerror` fallback to an SVG placeholder, so missing files never break layout.

## Git state
- **Committed** through `9d7ad21` "Add interactive 3D viewer, picture-book process, and content refinements" (on `personal-hero`).
- **Uncommitted:** `css/style.css` only — the **polaroid scale-fade animation** rework (was a "rolling"/tilt pile, then a straight drop, now scale-down + fade-in + tilt). **Needs a commit** (suggested: "Polaroid process: scale-fade drop with tilt").
- **Nothing has been pushed** this session — all commits are local. Confirm with the user before `git push`.
- Commit trailer to use: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

## Open decisions / TODO for next session
1. **Commit** the uncommitted `css/style.css` polaroid animation.
2. **Process skin choice:** user is comparing **polaroid (RoSE)** vs **index (Stair)**. Once they pick, roll the winner out to the other four project pages (they currently use the plain `.steps` list). Ask before doing all.
3. **Optional polaroid polish:** user floated a "fade in / fade **out**" — currently only fade-in on land; could fade the previous card as the next drops on top. Not yet done.
4. **Real media:** drop in the image slots above; the pages come alive once photos exist.
5. **Push** to GitHub when the user is ready; consider **GitHub Pages** deploy for a live URL.
6. Nice-to-haves (not started): résumé/CV PDF download button.

## Key JS entry points (`js/main.js`, all called in the `DOMContentLoaded` boot block)
`injectLayout` · `initScrollHeader` · `initDropdowns` · `initReveal` · `initFilters` (research) · `initWorkFilters` (home multi-select) · `initGallery` (lightbox) · `initModelViewer` (camera-view arrows) · `initProcessPile` (centres pile cards + triggers drop).
