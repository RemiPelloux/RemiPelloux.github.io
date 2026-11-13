#!/usr/bin/env python3
"""Version the site's own CSS and JavaScript so a deploy never mixes old and new files.

Writes ?v=<hash> on every local stylesheet and script in the HTML pages, and an
import map that gives every module under js/ the same version. Run before each commit
that touches css/ or js/:  python3 scripts/stamp.py
"""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = [
    "index.html", "cv/index.html", "wiki/index.html", "work/index.html", "404.html",
    "lab/index.html", "toolbox/index.html", "security/index.html", "work/openplod/index.html", "work/containust/index.html", "work/modelly/index.html",
]
HASH_LENGTH = 8
ASSET = re.compile(r'((?:href|src)="/(?:css|js)/[\w./-]+\.(?:css|js))(?:\?v=\w+)?(")')
BLOCK = re.compile(r"<!-- stamp -->.*?<!-- /stamp -->", re.S)


def sources():
    return sorted([*ROOT.glob("css/*.css"), *ROOT.glob("js/**/*.js")])


def version(files):
    digest = hashlib.sha256()
    for file in files:
        digest.update(file.read_bytes())
    return digest.hexdigest()[:HASH_LENGTH]


def import_map(files, stamp):
    modules = ["/" + file.relative_to(ROOT).as_posix() for file in files if file.suffix == ".js"]
    imports = {module: f"{module}?v={stamp}" for module in modules}
    return f'<script type="importmap">{json.dumps({"imports": imports}, separators=(",", ":"))}</script>'


def stamp_page(page, block, stamp):
    path = ROOT / page
    html = ASSET.sub(rf"\1?v={stamp}\2", path.read_text())
    html = BLOCK.sub(lambda _: f"<!-- stamp -->\n  {block}\n  <!-- /stamp -->", html)
    path.write_text(html)


def main():
    files = sources()
    stamp = version(files)
    block = import_map(files, stamp)
    for page in PAGES:
        stamp_page(page, block, stamp)
    print(f"stamped {len(PAGES)} pages with v={stamp}")


if __name__ == "__main__":
    main()
