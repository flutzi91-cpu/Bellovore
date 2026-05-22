# Bellovore Cinematic Portal Prototype

This is a static prototype for a stronger cinematic Bellovore homepage:

- Gate-opening intro sequence.
- Video-backed hero with 3D portal rings, parallax, light scan, and particle dust.
- Scroll reveal sections and hover tilt cards.
- Realm astrolab concept with animated sealed worlds.
- Interactive character fragment reveal.
- Echo terminal with fragment responses.
- Cinematic teaser modal and local MP4 sample in `media/bellovore-teaser.mp4`.
- Archive Mode design toggle for a more myth-tech / premium interface direction.
- Director's Cut recommendation board and roadmap timeline.
- Character Theater with 3D foreground cards, active dossier, next/previous controls,
  and a structure that can become dedicated character pages.

## Run

Open `index.html` directly in a browser, or serve this folder with any static server.

## Integrate

For the live Next.js site, copy the relevant markup into the Bellovore page component,
move `styles.css` into the existing global/module CSS setup, and move `app.js` logic into
a client component or hook. Replace `media/bellovore-teaser.mp4` with the final teaser
when ready.
