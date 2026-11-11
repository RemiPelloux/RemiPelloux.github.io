# Rémi Pelloux, portfolio

The source of [remipelloux.github.io](https://remipelloux.github.io/). One HTML file, three stylesheets and four scripts, served as they are by GitHub Pages. No build step, no framework, no tracker.

## Layout

| Path | Content |
| --- | --- |
| `index.html` | All copy and structure |
| `css/base.css` | Tokens, reset and type |
| `css/page.css`, `css/components.css` | Layout and components |
| `js/ledger.js` | Contribution ledger, read by pointer or arrow keys |
| `js/model.js`, `js/model-ui.js` | Seeded Schelling model and its canvas |
| `js/masthead.js` | Theme switch and local time |
| `scripts/refresh-ledger.sh` | Regenerates `js/ledger-data.js` from GitHub |

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

The page follows [unslop](https://github.com/RemiPelloux/unslop) and the Pelloux size limits: files under 300 lines, function bodies under 25. Two deliberate breaks of unslop, both marked in the code: the name is set above the type scale, and the model animates for as long as it runs. The model starts only on a click and jumps to its final state under reduced motion.
