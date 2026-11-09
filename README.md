# Portfolio: Sathvik Raju Pothureddy

My personal portfolio website. It introduces me, shows my resume, certificates and achievements, and has a contact form.

## Pages

| File | Page |
|---|---|
| `index.html` | Home / About me |
| `resume.html` | Resume |
| `certtificate.html` | Certificates and achievements |
| `contact.html` | Contact form |
| `submitForm.html` | Thank-you page after the form is sent |

## Tech stack

- HTML and CSS for the pages
- Node.js + Express (`index.js`) for the contact form: messages are saved with the date and time (IST) to `rep.txt`

## Running locally

**Static pages only:** open `index.html` in a browser, or publish the repo with GitHub Pages.

**With the contact form:**

```bash
npm init -y
npm install express body-parser
node index.js
```

Then open http://localhost:3000.
