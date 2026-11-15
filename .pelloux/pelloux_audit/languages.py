"""Language table: extensions, parameter limits, comment syntax and debug tokens."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import PurePosixPath
from typing import Optional

CONFLICT_MARKERS = (r"^(<{7}|>{7}) ", r"^={7}$")


@dataclass(frozen=True)
class Language:
    name: str
    label: str
    extensions: tuple
    params: int
    line_comments: tuple
    quotes: str
    triple_quotes: bool
    debug: tuple


LANGUAGES = (
    Language("typescript", "TypeScript/JavaScript", (".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"),
             3, ("//",), "\"'`", False,
             (r"\bconsole\.(log|debug|trace)\(", r"^\s*debugger\b", r"\b(it|describe|test)\.only\(")),
    Language("python", "Python", (".py",), 4, ("#",), "\"'", True,
             (r"\bbreakpoint\(\)", r"\bi?pdb\.set_trace\(", r"^\s*import i?pdb\b")),
    Language("php", "PHP", (".php",), 4, ("//", "#"), "\"'", False,
             (r"(?<![\w>:$])(dd|dump|var_dump|print_r|ray)\(",)),
    Language("rust", "Rust", (".rs",), 4, ("//",), "\"", False, (r"\bdbg!\(",)),
    Language("go", "Go", (".go",), 4, ("//",), "\"'`", False,
             (r"(?<![\w.])print(ln)?\(", r"\bspew\.")),
    Language("dart", "Dart", (".dart",), 3, ("//",), "\"'", True,
             (r"(?<![\w.])print\(", r"\bdebugger\(")),
    Language("swift", "Swift", (".swift",), 3, ("//",), "\"", True,
             (r"(?<![\w.])(print|debugPrint|dump)\(",)),
    Language("kotlin", "Kotlin", (".kt", ".kts"), 3, ("//",), "\"'", True,
             (r"(?<![\w.])println?\(", r"\.printStackTrace\(\)")),
    Language("cpp", "C/C++", (".c", ".h", ".cc", ".cpp", ".cxx", ".hpp", ".hh"), 4, ("//",), "\"'",
             False, (r"^\s*#\s*if\s+0\b", r"printf\(\s*\"DEBUG")),
)

BY_EXTENSION = {ext: lang for lang in LANGUAGES for ext in lang.extensions}
BY_NAME = {lang.name: lang for lang in LANGUAGES}


def detect(path: str) -> Optional[Language]:
    """Return the language of a path from its extension, or None."""
    return BY_EXTENSION.get(PurePosixPath(path).suffix.lower())
