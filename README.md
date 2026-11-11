# Rémi Pelloux, portfolio

The source of [remipelloux.github.io](https://remipelloux.github.io/). Static files served as they are by GitHub Pages. No build step, no framework, no tracker. French and English, four themes.

## Layout

| Path | Content |
| --- | --- |
| `index.html`, `cv/index.html`, `wiki/index.html`, `work/index.html` | The routes `/`, `/cv/`, `/wiki/` and `/work/` (archive of other public repositories). English copy lives in the HTML |
| `js/app.js`, `js/router.js` | Entry point and client-side router: links between routes swap the page without a reload |
| `404.html`, `cv.html`, `wiki.html` | Not-found page and redirects from the old addresses |
| `js/fr/*.js` | French copy for each page, keyed by `data-i18n` |
| `js/i18n.js`, `js/boot.js` | Language and theme state |
| `js/chrome.js`, `js/wipe.js` | Top bar switches and the language transition |
| `js/juice.js` | Screen shake, squash and stretch, tones, feedback tiers |
| `js/ledger.js`, `js/skyline.js` | Contribution year drawn as a 3D skyline on a canvas, read by pointer or arrow keys |
| `js/name.js`, `js/reveal.js`, `js/cursor.js` | Reactive display type, scroll reveals and counters, pointer ring and project previews |
| `js/marquee.js`, `css/riviera.css` | The place-name marquee and the France and coast maps |
| `assets/work/` | Project illustrations shown next to the pointer |
| `js/model.js`, `js/model-ui.js` | Seeded Schelling model and its canvas |
| `js/shiba.js` | The dog. Type `shiba` on any page |
| `js/cv.js`, `css/cv.css` | CV export through the print dialog, one A4 page |
| `css/` | Tokens and three themes in `base.css`, then one file per concern |
| `css/toolbox.css` | Language bar chart and tool grid. The counts are written in `index.html` |
| `js/words.js`, `css/motion.css` | Word-by-word reveals, the name sinking on scroll, sticky section labels, row and link hovers |
| `js/stars.js` | Star and repository counts read live from the GitHub API, cached one hour, with the written numbers as fallback |
| `js/intro.js`, `css/intro.css` | Opening sequence, once per browser session |
| `scripts/stamp.py` | Versions the CSS and JavaScript links |
| `scripts/refresh-ledger.sh` | Regenerates `js/ledger-data.js` from GitHub |

## Before committing

```sh
python3 scripts/stamp.py
```

It writes one version on every local stylesheet, script and module (through an import map), so a deploy never serves a mix of old and new files. Run it after any change under `css/` or `js/`.

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

## Data

The France outline on the map comes from [france-geojson](https://github.com/gregoiredavid/france-geojson) (IGN data, Licence Ouverte), simplified.

## Rules

The accent is Antibes blue, which sits inside the hue band unslop bans for accents. That is a deliberate choice. Otherwise colours, type and copy follow [unslop](https://github.com/RemiPelloux/unslop), and the code follows the Pelloux size limits: files under 300 lines, function bodies under 25. Motion is a deliberate break of the unslop motion budget: the language transition, the shake, the ledger and the dog are there on purpose. All of it stops under `prefers-reduced-motion`, and sound is off until switched on.
