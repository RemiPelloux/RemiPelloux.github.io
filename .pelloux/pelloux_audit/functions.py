"""Find functions in masked source, then measure their length and parameter count.

Detection is a fast heuristic, not a parser: it reads signatures with one regex per
language and finds bodies by brace matching (or indentation for Python). It runs on
masked text, so braces and keywords inside strings or comments never confuse it.
"""

from __future__ import annotations

import re
from bisect import bisect_right
from dataclasses import dataclass
from typing import Optional

from .languages import Language

C_LIKE = r"^\s*(?:[\w:<>,*&\[\]~?]+\s+){1,6}[*&]?(?P<name>~?[A-Za-z_]\w*(?:::~?\w+)*)\s*\("
TS_METHOD = (r"^\s*(?:(?:public|private|protected|static|async|override|readonly|abstract|get|set)"
             r"\s+)*(?P<name>#?[A-Za-z_$][\w$]*)\s*(?:<[^(]*>)?\s*\(")
SIGNATURES = {
    "python": ((r"^\s*(?:async\s+)?def\s+(?P<name>\w+)\s*(?:\[[^\]]*\])?\s*\(", "plain"),),
    "php": ((r"\bfunction\s+&?(?P<name>\w+)\s*\(", "plain"),),
    "rust": ((r"\bfn\s+(?P<name>\w+)\s*(?:<[^(]*>)?\s*\(", "plain"),),
    "go": ((r"^\s*func\s*(?:\([^)]*\)\s*)?(?P<name>\w+)\s*(?:\[[^\]]*\])?\s*\(", "plain"),),
    "swift": ((r"\bfunc\s+(?P<name>[\w$]+)\s*(?:<[^(]*>)?\s*\(", "plain"),
              (r"^\s*(?:(?:public|private|internal|fileprivate|convenience|required|override)\s+)*"
               r"(?P<name>init)[?!]?\s*\(", "plain")),
    "kotlin": ((r"\bfun\s+(?:<[^>]*>\s*)?(?:[\w.<>?, ]*\.)?(?P<name>\w+)\s*\(", "plain"),),
    "typescript": ((r"\bfunction\s*\*?\s*(?P<name>\w+)\s*(?:<[^(]*>)?\s*\(", "plain"),
                   (r"\b(?:const|let|var)\s+(?P<name>\w+)\s*(?::[^=]+)?=\s*(?:async\s*)?"
                    r"(?:<[^(]*>\s*)?\(", "arrow"),
                   (TS_METHOD, "method")),
    "dart": ((C_LIKE, "method"),),
    "cpp": ((C_LIKE, "method"),),
}
COMPILED = {lang: tuple((re.compile(p), kind) for p, kind in pats) for lang, pats in SIGNATURES.items()}
KEYWORDS = {"if", "for", "while", "switch", "catch", "return", "function", "else", "do", "new",
            "typeof", "await", "yield", "sizeof", "throw", "case", "delete", "using", "with",
            "assert", "super", "this", "elif", "when", "guard", "defer", "try", "foreach"}
CONSTRUCTORS = {"constructor", "__construct", "__init__", "init"}
RECEIVER = re.compile(r"(?:&(?:'\w+\s+)?)?(?:mut\s+)?self(?:\s*:.*)?|cls|\*|/|this\s*:.*")
KOTLIN_EXPR = re.compile(r"(?<![=!<>])=(?![=>])")
BODY_STOP = re.compile(r"[{;]|=>")


@dataclass(frozen=True)
class Function:
    name: str
    line: int
    length: Optional[int]
    params: int
    is_constructor: bool


@dataclass(frozen=True)
class Source:
    raw_lines: list
    masked: str
    lines: list
    starts: list
    lang: Language


def find_functions(raw: str, masked: str, lang: Language) -> list:
    lines = masked.split("\n")
    starts, offset = [], 0
    for line in lines:
        starts.append(offset)
        offset += len(line) + 1
    src = Source(raw.split("\n"), masked, lines, starts, lang)
    found = []
    for idx, line in enumerate(lines):
        hit = _match_signature(line, lang)
        if hit and not _ignored(src.raw_lines, idx):
            fn = _build(src, idx, hit)
            if fn:
                found.append(fn)
    return found


def count_params(inner: str) -> int:
    parts = _split_top_level(inner.replace("=>", "  ").replace("->", "  "))
    params = [re.sub(r"\s+", " ", p).strip() for p in parts]
    return sum(1 for p in params if p and not RECEIVER.fullmatch(p))


def _match_signature(line: str, lang: Language):
    for pattern, kind in COMPILED.get(lang.name, ()):
        match = pattern.search(line)
        if match and match.group("name") not in KEYWORDS:
            return match.group("name"), match.end() - 1, kind
    return None


def _ignored(raw_lines: list, idx: int) -> bool:
    window = raw_lines[max(0, idx - 1): idx + 1]
    return any("pelloux-ignore" in line for line in window)


def _build(src: Source, idx: int, hit) -> Optional[Function]:
    name, col, kind = hit
    open_pos = src.starts[idx] + col
    close = _close_paren(src.masked, open_pos)
    if close is None:
        return None
    end_idx = _end_line(src, idx, close, kind)
    if end_idx is False:
        return None
    length = None if end_idx is None else _count_lines(src.lines, idx, end_idx)
    params = count_params(src.masked[open_pos + 1: close])
    return Function(name, idx + 1, length, params, _is_constructor(name))


def _end_line(src: Source, idx: int, close: int, kind: str):
    """Return the body's last line index, None for an expression body, False if not a function."""
    if src.lang.name == "python":
        return _indent_end(src.lines, idx, _line_of(src.starts, close))
    brace, is_function = _body_start(src.masked, close, src.lang.name, kind)
    if not is_function:
        return False
    if brace is None:
        return None
    end = _match_close(src.masked, brace, "{", "}")
    return None if end is None else _line_of(src.starts, end)


def _body_start(text: str, close: int, lang: str, kind: str):
    window = text[close + 1: close + 400]
    stop = BODY_STOP.search(window)
    segment = window[: stop.start()] if stop else window.split("\n")[0]
    if lang == "kotlin" and KOTLIN_EXPR.search(segment):
        return None, True
    if not stop or stop.group() == ";":
        return None, False
    if stop.group() == "=>":
        rest = window[stop.end():]
        brace = len(rest) - len(rest.lstrip())
        if rest[brace: brace + 1] == "{":
            return close + 1 + stop.end() + brace, True
        return None, True
    if kind == "arrow" or (kind == "method" and not _only_return_type(segment, lang)):
        return None, False
    return close + 1 + stop.start(), True


def _only_return_type(segment: str, lang: str) -> bool:
    if lang == "typescript":
        return re.fullmatch(r"\s*(?::[^;=]*)?", segment) is not None
    return ";" not in segment and "=" not in segment.replace("=>", "")


def _close_paren(text: str, pos: int) -> Optional[int]:
    return _match_close(text, pos, "(", ")")


def _match_close(text: str, pos: int, opener: str, closer: str) -> Optional[int]:
    depth = 0
    for j in range(pos, len(text)):
        ch = text[j]
        if ch == opener:
            depth += 1
        elif ch == closer:
            depth -= 1
            if depth == 0:
                return j
    return None


def _indent_end(lines: list, def_idx: int, header_idx: int) -> int:
    indent = _indent(lines[def_idx])
    last = header_idx
    for k in range(header_idx + 1, len(lines)):
        if not lines[k].strip():
            continue
        if _indent(lines[k]) <= indent:
            break
        last = k
    return last


def _indent(line: str) -> int:
    return len(line.expandtabs(4)) - len(line.expandtabs(4).lstrip())


def _count_lines(lines: list, start: int, end: int) -> int:
    return sum(1 for k in range(start, end + 1) if lines[k].strip())


def _line_of(starts: list, pos: int) -> int:
    return bisect_right(starts, pos) - 1


def _split_top_level(text: str) -> list:
    parts, current, depth = [], [], 0
    for ch in text:
        if ch in "([{<":
            depth += 1
        elif ch in ")]}>":
            depth = max(0, depth - 1)
        if ch == "," and depth == 0:
            parts.append("".join(current))
            current = []
        else:
            current.append(ch)
    parts.append("".join(current))
    return parts


def _is_constructor(name: str) -> bool:
    if name in CONSTRUCTORS:
        return True
    parts = name.split("::")
    return len(parts) >= 2 and parts[-1] == parts[-2]
