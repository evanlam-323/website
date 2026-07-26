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
     - `process-1` … `process-5` — the numbered **Process** steps
     - `gallery` — a tile in the photo gallery (add as many `gallery` rows as you want)
   - **caption** — the text shown with the photo

That's it. Reload the page and the photo is in place.

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
- **Reset my edits** — discard the in-browser changes you haven't saved to the file yet.
- **Done** — leave edit mode.

> Until you paste the text back into `js/photos.js`, your caption edits live only in the
> browser you typed them in. The "Copy label sheet" step is what makes them stick.

## Notes

- Only the **UH 88″ Weather Sensor** page is wired to this system so far. The other project
  pages can be switched over the same way whenever you're ready.
- If a photo's `file` doesn't match anything in `images/`, that slot just shows a placeholder
  — nothing breaks.
