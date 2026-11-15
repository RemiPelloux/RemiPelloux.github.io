"""Code smells the audit can see from one line: deep relative imports.

`../../../lib/x` couples a file to the folder layout around it, breaks when either file
moves, and hides where the code really lives. Each language has a stable way to name a
module from the project root instead; the message points to it.
"""

from __future__ import annotations

import re
from typing import Optional

from .languages import Language

PATH = r"""['"`](?P<path>/?(?:\.\./)+)"""
IMPORTS = {
    "typescript": (rf"(?:\bfrom|\bimport|\brequire\(|\bimport\(|\bjest\.mock\()\s*{PATH}",),
    "dart": (rf"^\s*(?:import|export|part)\s+{PATH}",),
    "php": (rf"\b(?:require|include)(?:_once)?\b[\s(]*(?:__DIR__\s*\.\s*)?{PATH}",),
    "cpp": (r'^\s*#\s*include\s*"(?P<path>(?:\.\./)+)',),
    "python": (r"^\s*from\s+(?P<dots>\.{2,})",),
    "rust": (r"(?P<supers>\bsuper(?:::super)+)",),
}
FIX = {
    "typescript": "import from the project root through a path alias such as @/",
    "dart": "use a package: import",
    "php": "rely on Composer autoloading or a base-path constant",
    "cpp": "add the directory to the include path",
    "python": "use an absolute import from the package root",
    "rust": "start the path at crate::",
}
_COMPILED = {lang: tuple(re.compile(p) for p in pats) for lang, pats in IMPORTS.items()}


def parent_depth(match) -> int:
    """How many directories a matched import climbs."""
    groups = match.groupdict()
    if groups.get("dots"):
        return len(groups["dots"]) - 1
    if groups.get("supers"):
        return groups["supers"].count("super")
    return groups["path"].count("../")


def deep_imports(text: str, masked: str, lang: Language, max_depth: Optional[int]) -> list:
    """Return (line number, depth) for each import deeper than max_depth."""
    patterns = _COMPILED.get(lang.name)
    if max_depth is None or not patterns:
        return []
    hits = []
    for idx, (raw, code) in enumerate(zip(text.split("\n"), masked.split("\n"))):
        for pattern in patterns:
            match = pattern.search(raw)
            if match and _in_code(raw, code, match.start()) and parent_depth(match) > max_depth:
                hits.append((idx + 1, parent_depth(match)))
                break
    return hits


def advice(lang: Language) -> str:
    return FIX.get(lang.name, "import from the project root")


def _in_code(raw: str, code: str, pos: int) -> bool:
    while pos < len(raw) and raw[pos].isspace():
        pos += 1
    return pos < len(code) and code[pos] == raw[pos]
