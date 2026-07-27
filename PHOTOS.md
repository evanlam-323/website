# Managing project photos

All photos are organized from **one place**: [`js/photos.js`](js/photos.js) — the "label sheet."
You never edit HTML to add, move, or re-caption a photo.

## Adding photos from a Google Drive folder

1. **Download** the Drive folder to your computer.
2. **Drop** the image files into the site's [`images/`](images/) folder. You can keep
   their original names (e.g. `IMG_4821.jpg`) — no renaming required.
3. **Open** [`js/photos.js`](js/photos.js) and add one row per photo:

   ```js
   { file: "IMG_4821.jpg", project: "uh88-weather", step: "process-3", caption: "Welding the frame" },
   ```

   - **file** — the filename exactly as it sits in `images/`
   - **project** — which project page it belongs to. Valid ids:
     `uh88-weather · rose-arm · mini-bridge · steel-bridge · soma-pump · stair-robot · kealakehe`
   - **step** — where it lands on that page:
     - `cover` — the big banner image (one per project)
     - `process-1` … `process-5` — the numbered **Process** steps. To put a photo at a
       specific position in a step's pager, add a sub-index: `process-5.0`, `process-5.1`,
       `process-5.2` … (shown on the card as 5.0, 5.1, 5.2). A plain `process-5` counts as
       the first position.
     - `gallery` — a tile in the photo gallery (add as many `gallery` rows as you want)
   - **caption** — the text shown with the photo

That's it. Reload the page and the photo is in place.

> **Two or more photos in the same process step** automatically become a swipeable
> photo pager (arrows + dots), numbered `N.0`, `N.1`, `N.2` …

## Videos work too

A row can point at a **video** instead of an image — any `.webm` / `.mp4` file. It renders
exactly like a photo: as a `<video>` in a process step or as a gallery tile (with a ▶ badge)
that plays in the lightbox.

```js
{ file: "stair-run-clip.webm", project: "stair-robot", step: "gallery", caption: "First clean run" },
```

Use **`.webm`** for videos — it plays in every browser. Raw iPhone `.mov` files often won't,
so trim them first with the **Video Trimmer** (below), which outputs `.webm`.

### Video Trimmer — turn a long clip into a short one

Open **[`video-trimmer.html`](video-trimmer.html)** (an author-only tool, not linked from the
public site). Videos show up as a **grid of previews**, just like the photo organizer.

1. **Pick your videos.** Click **📁 Open video folder…** and choose the folder your Drive
   videos live in — every video appears as a preview thumbnail (hover to scrub-preview it).
   (The Drive drop is already extracted to `…/photo-staging/videos/`.) You can also
   **＋ Add files…** or drag files onto the page. Nothing is ever uploaded — it all stays on your machine.
2. *(Once)* Click **Set images/ folder** and point it at the site's `images/` folder, so
   inserting a clip saves straight into it.
3. **Click a preview** to load it into the editor, then **drag the two orange handles** to pick
   the segment you want. `Space` plays the selection; `[` / `]` set start/end.
4. Choose a **max size** (720p is the web-friendly default) and hit **Export trimmed clip** —
   it re-encodes just that segment to a small `.webm`.
5. Set the **project / slot / caption**, then **✚ Insert** — it drops the `.webm` into
   `images/` and adds its row to the batch at the bottom. Repeat for as many clips as you like.
6. Click **Copy all rows** and paste them into `js/photos.js` (or into the live `#edit`
   editor's label sheet). Done — the clips are on the site.

## Editing captions live (in the browser)

You don't have to hand-type captions in the file. On any project page:

1. Add **`#edit`** to the end of the URL, e.g.
   `…/project-uh88-weather.html#edit`
2. Click any caption and type. Changes save **in your browser** immediately, so you can
   see exactly how they look.
3. When you're happy, click **"Copy label sheet"** in the bottom toolbar. That copies the
   full, updated `js/photos.js` contents (your captions merged in).
4. **Paste it over** `js/photos.js` and save. Now the captions are permanent — they show
   for everyone and on every device.

Buttons in the edit toolbar:
- **Copy label sheet** — grab the updated file text to paste back in.
- **Reset my edits** — discard the in-browser caption edits *and* photo moves you haven't saved yet.
- **Done** — leave edit mode.

> Until you paste the text back into `js/photos.js`, your edits live only in the
> browser you typed them in. The "Copy label sheet" step is what makes them stick.

## Moving a photo live (in the browser)

Also in **`#edit`** mode, every photo/video shows a small **⤢ Move** button. Click it to:

- send the photo to a different **slot**. The slot list now matches the real steps on the
  target project — each step is broken into its exact photo positions (`5.0`, `5.1`, `5.2` …,
  labelled *occupied* / *empty*, plus an *add new* position), so you pick precisely where it
  lands. Projects only list the steps they actually have (so a photo can't vanish into a step
  that doesn't exist).
- send it to a different **project** entirely (it then appears on that project's page).

**Adding photo slots — the `+` / `−` buttons.** Every process card shows a small **`+`** badge in
its top-right corner (edit mode only). Click it to add an **empty slot** to that step; the
card turns into the swipe pager (arrows + dots) with a labelled empty slide (e.g. `5.2`). Then
open any photo's **Move** and choose that sub-slot to drop it in. On the pager cards a **`−`**
badge sits just left of the `+` — click it to remove an empty slot you added by accident (it
only removes a *trailing empty* slot; move a photo out first if the last slot is filled).

The page re-places everything **instantly** — no reload. Moves are saved in your browser and,
like captions, are baked into the file when you hit **Copy label sheet** and paste it back
over `js/photos.js`. (Empty slots you added with `+` are scaffolding — they only persist once
a photo is moved into them.)

## Notes

- **Every project page** is wired to this system.
- If a photo's `file` doesn't match anything in `images/`, that slot just shows a placeholder
  — nothing breaks.
