# Rémi Pelloux, portfolio

The source of [remipelloux.github.io](https://remipelloux.github.io/). Static files served as they are by GitHub Pages. No build step, no framework, no tracker. French and English, three themes.

## Layout

| Path | Content |
| --- | --- |
| `index.html`, `cv/index.html`, `wiki/index.html` | The routes `/`, `/cv/` and `/wiki/`. English copy lives in the HTML |
| `js/app.js`, `js/router.js` | Entry point and client-side router: links between routes swap the page without a reload |
| `404.html`, `cv.html`, `wiki.html` | Not-found page and redirects from the old addresses |
| `js/fr/*.js` | French copy for each page, keyed by `data-i18n` |
| `js/i18n.js`, `js/boot.js` | Language and theme state |
| `js/chrome.js`, `js/wipe.js` | Top bar switches and the language transition |
| `js/juice.js` | Screen shake, squash and stretch, tones, feedback tiers |
| `js/ledger.js`, `js/skyline.js` | Contribution year drawn as a 3D skyline on a canvas, read by pointer or arrow keys |
| `js/name.js`, `js/reveal.js`, `js/cursor.js` | Reactive display type, scroll reveals and counters, pointer ring and project previews |
| `assets/work/` | Project illustrations shown next to the pointer |
| `js/model.js`, `js/model-ui.js` | Seeded Schelling model and its canvas |
| `js/shiba.js` | The dog. Type `shiba` on any page |
| `js/cv.js`, `css/cv.css` | CV export through the print dialog, one A4 page |
| `css/` | Tokens and three themes in `base.css`, then one file per concern |
| `scripts/refresh-ledger.sh` | Regenerates `js/ledger-data.js` from GitHub |

## CV export

Open `/cv/`, pick the language, press "Export as PDF" and save from the print dialog. To include private contact details in the PDF without publishing them, open `/cv/?email=you@example.com&tel=0600000000`. The values are read in the browser and never stored.

## Run it

```sh
python3 -m http.server 8000
```

## Refresh the contribution ledger

```sh
bash scripts/refresh-ledger.sh
```

It needs the `gh` CLI, logged in. Update the edition date in `index.html` in the same commit.

## Rules

Colours, type and copy follow [unslop](https://github.com/RemiPelloux/unslop), and the code follows the Pelloux size limits: files under 300 lines, function bodies under 25. Motion is a deliberate break of the unslop motion budget: the language transition, the shake, the ledger and the dog are there on purpose. All of it stops under `prefers-reduced-motion`, and sound is off until switched on.
