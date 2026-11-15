"""Blank out comments and string contents so later scans only see code.

Positions and newlines are kept, so line and column numbers stay valid. A comment-only
line becomes a blank line, which is why comments never count toward function length.
"""

from __future__ import annotations

import re

from .languages import Language

RUST_CHAR = re.compile(r"'(?:\\.[^'\n]*|[^\\'\n])'")
_STARTS: dict = {}
_STRINGS: dict = {}
NOT_NEWLINE = re.compile(r"[^\n]")


def mask(text: str, lang: Language) -> str:
    out = list(text)
    starts = _start_pattern(lang)
    i = 0
    while True:
        hit = starts.search(text, i)
        if not hit:
            return "".join(out)
        i = _step(text, out, hit.start(), lang)


def _start_pattern(lang: Language):
    """One regex for every token that can open a comment or a string."""
    if lang.name not in _STARTS:
        tokens = [re.escape(tok) for tok in lang.line_comments] + [re.escape(q) for q in lang.quotes]
        if lang.name != "python":
            tokens.append(re.escape("/*"))
        if lang.name == "rust":
            tokens.append("'")
        _STARTS[lang.name] = re.compile("|".join(tokens))
    return _STARTS[lang.name]


def _step(text: str, out: list, i: int, lang: Language) -> int:
    if any(text.startswith(tok, i) for tok in lang.line_comments):
        return _blank(out, i, _line_end(text, i))
    if text.startswith("/*", i) and lang.name != "python":
        return _blank(out, i, _block_end(text, i))
    ch = text[i]
    if lang.name == "rust" and ch == "'":
        match = RUST_CHAR.match(text, i)
        return _blank(out, i + 1, match.end() - 1) + 1 if match else i + 1
    if ch in lang.quotes:
        return _blank(out, i, _string_end(text, i, lang))
    return i + 1


def _blank(out: list, start: int, end: int) -> int:
    if end > start:
        out[start:end] = NOT_NEWLINE.sub(" ", "".join(out[start:end]))
    return end


def _line_end(text: str, i: int) -> int:
    end = text.find("\n", i)
    return len(text) if end == -1 else end


def _block_end(text: str, i: int) -> int:
    end = text.find("*/", i + 2)
    return len(text) if end == -1 else end + 2


def _string_end(text: str, i: int, lang: Language) -> int:
    quote = text[i]
    if lang.triple_quotes and text.startswith(quote * 3, i):
        end = text.find(quote * 3, i + 3)
        return len(text) if end == -1 else end + 3
    match = _string_pattern(quote).match(text, i)
    return match.end()


def _string_pattern(quote: str):
    """A string runs to its closing quote; only backtick strings may cross a newline."""
    if quote not in _STRINGS:
        q = re.escape(quote)
        body = rf"(?:[^{q}\\]|\\.)*" if quote == "`" else rf"(?:[^{q}\\\n]|\\.)*"
        _STRINGS[quote] = re.compile(rf"{q}{body}{q}?", re.DOTALL)
    return _STRINGS[quote]
