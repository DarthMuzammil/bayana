# Bayana landing page

Static, single-page site for Bayana, the WhatsApp CRM for real-estate brokerages.
No framework, no tracking scripts, nothing to pay for.

## Folders

| Path | What it is |
|---|---|
| `site/` | The landing page source and build scripts. **This is the project.** |
| `site/dist/` | The built site. Upload this folder to any static host. |
| `site/site.config.mjs` | WhatsApp number, live-demo link, public URL. The only file to edit for contact details. |
| `site/src/` | `index.html` (page), `styles.css`, `main.js`, `sprite.svg` (icons and illustrations), `media/` (screens and clips), `static/` (favicons, social preview image). |
| `phase1/` | Name shortlist, the three brand boards and the pricing summary (open `phase1/index.html`). |
| `review/` | Screenshots from the review passes and the Lighthouse reports (`lh-mobile.report.html`, `lh-desktop.report.html`). |
| `capture-out/` | Raw screen recordings and snapshots of the demo app. |
| `/home/muz/landing-tools/capture/` | Scripts that drive the demo app to record clips and screenshots. |
| `/home/muz/landing-assets/` | Better Days Realty logo and founder photo (originals). |

## Everyday tasks

```bash
cd /home/muz/landing-page/site
npm install            # first time only
npm run build          # rebuilds dist/ (fills in config, inlines CSS/JS, trims fonts)
npm run preview        # http://127.0.0.1:4321 on this machine
```

**Change the WhatsApp number or demo link:** edit `site/site.config.mjs`, then `npm run build`.
Every WhatsApp button reads from it, including the prefilled messages.

**Change copy:** edit `site/src/index.html`, then `npm run build`.

## Publishing (free options)

- **Netlify Drop:** drag the `site/dist` folder onto https://app.netlify.com/drop.
- **Cloudflare Pages or GitHub Pages:** upload or push the contents of `site/dist`.

After it has a public address, put that address in `siteUrl` in `site.config.mjs` and rebuild, so WhatsApp link previews show the image.

## Re-recording the product clips

The clips and screens come from the demo app, captured as it is (the capture browser only swaps the "B" mark for the Bayana key logo; the app's code is never touched).

```bash
# 1. a clean copy of the demo, served on 127.0.0.1:5299
git clone -q /home/muz/WhatsApp-firstCRMDesignDirections /home/muz/demo-snapshot
cp -a /home/muz/WhatsApp-firstCRMDesignDirections/node_modules /home/muz/demo-snapshot/
cd /home/muz/demo-snapshot && npx vite --port 5299 --strictPort --host 127.0.0.1 &
# 2. record and screenshot
cd /home/muz/landing-tools/capture && node clips.mjs && node stills.mjs
# 3. turn them into web media, then rebuild
cd /home/muz/landing-page/site && npm run assets && npm run build
```

## Checks used before calling it done

```bash
node review.mjs 390 768 1440   # screenshots, console errors, sideways overflow, small tap targets
node perf.mjs                  # scroll smoothness (phone with 4x slower CPU, and desktop)
```

Last results (20 Oct 2026): Lighthouse mobile 99 / 100 / 100 / 100, desktop 100 / 100 / 100 / 100;
172 KB on first load (clips load only when scrolled to); 60 fps scrolling with no dropped frames.
