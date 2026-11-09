# Portfolio: Sathvik Raju Pothureddy

My personal portfolio website: about me, skills, projects, experience, certificates, contact, and a printable resume.

## Features

- Single responsive page with a dark theme, smooth scrolling and an active-section menu
- Mobile hamburger menu
- Projects section with links to the code
- Experience and education timeline
- Certificate gallery with a click-to-zoom viewer
- Contact form that opens the visitor's email app with the message already written (no server needed)
- `resume.html`: a clean, printable resume. Click **Download PDF** to save it.
- Accessible: skip link, keyboard focus styles, labelled form fields, reduced-motion support
- Fast: all images converted to WebP (13 MB → 0.7 MB)

## Files

```
index.html              Portfolio page
resume.html             Printable resume
assets/css/style.css    Styles
assets/js/main.js       Menu, scroll effects, certificate viewer, contact form
assets/img/             Profile photo and certificates
```

## Running locally

No build step and no server. Open `index.html`, or:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Publishing on GitHub Pages

1. Go to **Settings → Pages** in this repository.
2. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The site will be live at `https://sathvikrinny.github.io/Portfolio/`.

## Updating content

- Projects, experience and certificates: edit the matching section in `index.html`.
- Resume: edit `resume.html`.
- Add a certificate: put a large image and a `-thumb` version in `assets/img/certs/`, then copy one of the `<button class="cert">` blocks.
