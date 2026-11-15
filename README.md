# Rémi Pelloux, portfolio

The source of [remipelloux.github.io](https://remipelloux.github.io/). Static files served as they are by GitHub Pages. No build step, no framework, no tracker. French and English, two themes.

## Layout

| Path | Content |
| --- | --- |
| `index.html`, `cv/index.html`, `wiki/index.html`, `work/index.html` | The routes `/`, `/cv/`, `/wiki/` and `/work/` (archive of other public repositories). English copy lives in the HTML |
| `js/app.js`, `js/router.js` | Entry point and client-side router: links between routes swap the page without a reload |
| `404.html`, `cv.html`, `wiki.html` | Not-found page and redirects from the old addresses |
| `js/fr/*.js` | French copy for each page, keyed by `data-i18n` |
| `js/i18n.js`, `js/boot.js` | Language and theme state |
| `js/chrome.js`, `js/wipe.js` | Top bar switches and the language transition |
| `js/juice.js` | Squash and stretch, tones, feedback tiers |
| `js/ledger.js`, `js/skyline.js` | Contribution year drawn as a 3D skyline on a canvas, read by pointer or arrow keys |
| `js/name.js`, `js/reveal.js`, `js/cursor.js` | Reactive display type, scroll reveals and counters, project previews |
| `js/marquee.js`, `css/riviera.css` | The place-name marquee and the France and coast maps |
| `assets/work/` | Project illustrations shown next to the pointer |
| `js/model.js`, `js/model-ui.js` | Seeded Schelling model and its canvas |
| `js/shiba.js` | The dog. Type `shiba` on any page |
| `js/cv.js`, `css/cv.css` | CV export through the print dialog, one A4 page |
| `lab/`, `toolbox/`, `security/`, `work/<project>/` | Lab, toolbox, security write-up and case studies, each a plain page |
| `.github/workflows/refresh-ledger.yml` | Daily job that regenerates `js/ledger-data.js` through a pull request |
| `css/` | Tokens and two themes in `base.css`, then one file per concern |
| `css/toolbox.css` | Language bar chart and tool grid. The counts are written in `index.html` |
| `js/words.js`, `css/motion.css` | Word-by-word reveals, the name sinking on scroll, sticky section labels, row and link hovers |
| `js/stars.js` | Star and repository counts read live from the GitHub API, cached one hour, with the written numbers as fallback |
| `js/intro.js`, `css/intro.css` | Opening sequence, once per browser session |
| `js/welcome.js`, `css/welcome.css`, `assets/welcome/` | Welcome screen on `/`, once per browser session: Immersive goes to `/riviera/`, Lite stays on the classic site. `/?lite` skips it |
| `os/` | RIVIERA.OS, the Immersive experience: React, TypeScript, Three.js and React Three Fiber, built with Vite into `riviera/` (committed). A 3D workstation with a working retro OS on its CRT, and a Lite 2D desktop for phones and slow machines |
| `assets/riviera/repos.json` | Public repositories for RIVIERA.OS, regenerated daily by `scripts/riviera-repos.py` |
| `scripts/stamp.py` | Versions the CSS and JavaScript links |
| `scripts/refresh-ledger.sh` | Regenerates `js/ledger-data.js` from GitHub |

## RIVIERA.OS

```sh
cd os && npm install   # once
npm run build          # type-checks, then builds into ../riviera/
```

The pre-commit hook runs the build whenever a commit touches `os/` and adds `riviera/` to the commit. The OS reads `/assets/riviera/repos.json` at runtime, so the daily refresh updates it without a rebuild. Private repositories are listed by hand in `os/src/data/repos.ts`, with their description only.

## Versioning (automatic)

Enable the hooks once per clone:

```sh
git config core.hooksPath .githooks
```

From then on every commit that touches `css/` or `js/` runs `scripts/stamp.py` and adds the stamped pages to the commit. It writes one version on every local stylesheet, script and module (through an import map), so a deploy never serves a mix of old and new files. You never have to run it by hand.

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
