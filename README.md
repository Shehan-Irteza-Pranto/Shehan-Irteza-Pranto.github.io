# Shehan Irteza Pranto — personal website

Static academic portfolio (plain HTML/CSS/JS, no build step). Works from any static host, including GitHub Pages.

## Pages

| File | Content |
|---|---|
| `index.html` | Home: bio, news, featured research, education, funding, skills |
| `research.html` | Projects with figures cropped from the papers (filterable) |
| `publications.html` | Journal / conference / abstracts / book chapter (filterable) |
| `awards.html` | ATTIS 2026 award + talk videos, Mujib100 awards, honours timeline, presentations |
| `teaching.html` | One-Person Research Lab 101 course, mentoring, review service |
| `gallery.html` | Photo gallery grouped by lab / event, with lightbox |

Shared files: `assets/css/style.css` (all styling, colour tokens at the top), `assets/js/main.js` (nav, dark mode, lightbox, filters).

## Run locally

```powershell
cd "C:\Users\prantos\Desktop\Other\Personal Website"
python -m http.server 8000
```

Then open http://localhost:8000 . (Any static server works; opening `index.html` directly also works, but video playback and fonts are more reliable over http.)

## Deploy to GitHub Pages (user site)

1. On GitHub, create a **public** repository named exactly `Shehan-Irteza-Pranto.github.io` (must match your username).
2. From this folder:

```powershell
git checkout -b main            # or: git checkout main
git add .
git commit -m "Personal website"
git remote add origin https://github.com/Shehan-Irteza-Pranto/Shehan-Irteza-Pranto.github.io.git
git push -u origin main
```

3. On GitHub: Settings → Pages → Source: "Deploy from a branch", Branch: `main`, folder `/ (root)`. The site goes live at
   https://shehan-irteza-pranto.github.io/ within a minute or two.

`.nojekyll` tells GitHub Pages to serve the files as-is. `.gitignore` excludes the raw `pic/`, `papers/`,
`course taken materials/` and `Resume Materials/` folders (≈140 MB of originals) so only the optimized `assets/` are pushed.

## Slideshows

Projects with several figures use an auto-advancing slideshow (`assets/js/main.js`, `.slider` in the CSS). To add a slide,
copy one `<figure class="slide">…</figure>` block inside the project's `<div class="slides">`. `data-interval` sets the
delay in ms; `--slide-h` sets the slide height. Hovering pauses; clicking an image opens the lightbox.

## Things to update

- **ICT Division award videos (optional):** if you want ceremony footage, copy clips to `assets/video/` and add a
  `<div class="video-card">` (same markup as the ATTIS section) next to the award photos in `awards.html`
  (search for `ict-award-photos`). Convert to browser-friendly MP4 first (H.264 / AAC).
- **Google Scholar and LinkedIn links** in `index.html` and `publications.html`: the Scholar link currently points to a
  name search; replace with your profile URL (`https://scholar.google.com/citations?user=...`). The LinkedIn URL is a guess.
- **CV:** replace `assets/pdf/Shehan_Irteza_Pranto_CV.pdf` whenever the resume changes.
- **News:** add a `<li><time>…</time><span>…</span></li>` at the top of the news list in `index.html`.
- **New publication:** copy an `<article class="pub">` block in `publications.html`; set `data-tags` to
  `journal` / `conference` / `abstract` / `chapter`, plus `first` if first or co-first author.
- **New photos:** resize to ≤1600 px, drop into `assets/img/gallery/`, add a `<figure>` in `gallery.html`.

## Regenerating assets

Photos were converted from HEIC/JPG and resized to 1600 px; paper figures were cropped from the PDFs at 200 dpi
(PyMuPDF); videos were transcoded to H.264 with the bundled `imageio-ffmpeg` binary. The originals live in the
ignored folders above.
