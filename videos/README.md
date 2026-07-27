# videos/ — drop-in clips per project

The site auto-pulls videos from these folders, so you don't need the browser to
write anything. Workflow:

1. In `video-trimmer.html`, trim a clip and **Download** the `.webm`.
2. Drag the downloaded `.webm` into the subfolder for its project, e.g.
   `videos/mini-bridge/`.
3. Refresh that project page — the clip shows up in the **gallery**.
4. Fine-tune with `#edit` on the project page (move to another slot/project,
   add a caption) exactly like a photo.

Folder = project id. One subfolder per project:
`uh88-weather · rose-arm · mini-bridge · steel-bridge · soma-pump ·
stair-robot · kealakehe · personal`.

## How it works
On each project page, `initVideoFolder()` in `js/main.js` fetches this project's
subfolder listing (served by the local `python -m http.server`) and injects each
video it finds as a `window.PHOTOS` gallery row with `dir: "videos/<project>"`.

## Deploying (GitHub Pages, etc.)
A static host does **not** serve directory listings, so the auto-scan no-ops
there. Before deploying: open each project page with `#edit`, click **Copy label
sheet**, and paste over `js/photos.js`. That bakes the video rows (with their
`dir`) permanently — the files here are served fine on a static host; only the
*listing* isn't. Use `.webm` (iPhone `.mov`/HEVC usually won't play in browsers).
