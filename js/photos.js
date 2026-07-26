/* =========================================================================
   PHOTO LABEL SHEET  —  the one place you organize every photo
   =========================================================================
   HOW TO ADD PHOTOS
   1. Download your Google Drive folder and drop the image files into the
      site's  images/  folder. Keep their original names if you like
      (e.g. IMG_4821.jpg) — you don't have to rename anything.
   2. Add one row per photo to the list below and fill in four fields:

        file     the image's filename inside images/     e.g. "IMG_4821.jpg"
        project  which project it belongs to (id list ↓) e.g. "uh88-weather"
        step     where it goes on that project's page:
                    "cover"                  → the big banner image
                    "process-1" … "process-5" → the numbered Process steps
                    "gallery"                → a tile in the photo gallery
                                               (add as many gallery rows as you want)
        caption  the text shown with the photo (you can also edit this live —
                 open any project page with  #edit  at the end of the URL)

   PROJECT IDS (must match exactly):
     uh88-weather · rose-arm · mini-bridge · steel-bridge ·
     soma-pump · stair-robot · kealakehe

   That's it — the pages read this list and drop each photo into place.
   ========================================================================= */

window.PHOTOS = [

  /* ---- UH 88" Deployable Weather Sensor ---- */
  { file: "uh88-weather.jpg",    project: "uh88-weather", step: "cover",     caption: "Labeled CAD render of the full deployable system" },

  { file: "uh88-weather-p1.jpg", project: "uh88-weather", step: "process-1", caption: "Existing roof-mounted weather station on the summit" },
  { file: "uh88-weather-p2.jpg", project: "uh88-weather", step: "process-2", caption: "CAD of the deployable top assembly" },
  { file: "uh88-weather-p3.jpg", project: "uh88-weather", step: "process-3", caption: "Full build in the machine shop" },
  { file: "uh88-weather-p4.jpg", project: "uh88-weather", step: "process-4", caption: "Wiring diagram for the control stack" },
  { file: "uh88-weather-p5.jpg", project: "uh88-weather", step: "process-5", caption: "Web control panel during testing" },

  { file: "uh88-weather-1.jpg",  project: "uh88-weather", step: "gallery",   caption: "Labeled system — CAD render" },
  { file: "uh88-weather-2.jpg",  project: "uh88-weather", step: "gallery",   caption: "Deployable top assembly — CAD" },
  { file: "uh88-weather-3.jpg",  project: "uh88-weather", step: "gallery",   caption: "goBILDA linear rails — built" },
  { file: "uh88-weather-4.jpg",  project: "uh88-weather", step: "gallery",   caption: "Full prototype — machine shop" },
  { file: "uh88-weather-5.jpg",  project: "uh88-weather", step: "gallery",   caption: "Electronics wall & power" },
  { file: "uh88-weather-6.jpg",  project: "uh88-weather", step: "gallery",   caption: "Web control + live weather dashboard" },

  /* ---- 6 DOF Arm (Team RoSE) ---- */
  { file: "rose-arm-p1.jpg", project: "rose-arm", step: "process-1", caption: "Requirements from the URC task list" },
  { file: "rose-arm-p2.jpg", project: "rose-arm", step: "process-2", caption: "Kinematic layout — six axes" },
  { file: "rose-arm-p3.jpg", project: "rose-arm", step: "process-3", caption: "Differential-drive wrist" },
  { file: "rose-arm-p4.jpg", project: "rose-arm", step: "process-4", caption: "3-phase motor actuation" },
  { file: "rose-arm-p5.jpg", project: "rose-arm", step: "process-5", caption: "Competition — URC 2025" },

  { file: "rose-arm-1.jpg", project: "rose-arm", step: "gallery", caption: "CAD assembly — full arm" },
  { file: "rose-arm-2.jpg", project: "rose-arm", step: "gallery", caption: "Differential-drive wrist" },
  { file: "rose-arm-3.jpg", project: "rose-arm", step: "gallery", caption: "Joint actuation detail" },
  { file: "rose-arm-4.jpg", project: "rose-arm", step: "gallery", caption: "End effector" },
  { file: "rose-arm-5.jpg", project: "rose-arm", step: "gallery", caption: "Competition — URC 2025" },
  { file: "rose-arm-6.jpg", project: "rose-arm", step: "gallery", caption: "Team & build" },

  /* ---- Stair-Climbing Robot ---- */
  { file: "stair-p1.jpg", project: "stair-robot", step: "process-1", caption: "Requirements — 45° climb, fragile payload" },
  { file: "stair-p2.jpg", project: "stair-robot", step: "process-2", caption: "High-torque drivetrain" },
  { file: "stair-p3.jpg", project: "stair-robot", step: "process-3", caption: "Onshape chassis + lever" },
  { file: "stair-p4.jpg", project: "stair-robot", step: "process-4", caption: "3D-printed prototypes" },
  { file: "stair-p5.jpg", project: "stair-robot", step: "process-5", caption: "UH ME competition run" },

  /* ---- Other projects have no photos yet. Add rows the same way, e.g.: ----
  { file: "IMG_1234.jpg", project: "mini-bridge", step: "gallery", caption: "..." },
  Project ids: mini-bridge · steel-bridge · soma-pump · kealakehe
  */

];
