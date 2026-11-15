"""Rules applied to one file: size, function length, parameters and debug leftovers."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Optional

from .config import Config
from .functions import find_functions
from .languages import CONFLICT_MARKERS, Language
from .mask import mask
from .smells import advice, deep_imports

_PATTERNS: dict = {}


@dataclass(frozen=True)
class Finding:
    rule: str
    path: str
    line: int
    severity: str
    value: int
    limit: int
    message: str
    name: str = ""

    @property
    def key(self) -> str:
        return "::".join(part for part in (self.rule, self.path, self.name) if part)


@dataclass(frozen=True)
class Unit:
    path: str
    text: str
    lang: Language


def check_file(unit: Unit, cfg: Config, rules: Optional[set] = None) -> list:
    masked = mask(unit.text, unit.lang)
    findings = []
    if not cfg.is_size_exempt(unit.path):
        findings += size_findings(unit, cfg)
        for fn in find_functions(unit.text, masked, unit.lang):
            findings += function_findings(unit, fn, cfg)
    findings += debug_findings(unit, masked)
    findings += import_findings(unit, masked, cfg)
    return [f for f in findings if rules is None or f.rule in rules]


def size_findings(unit: Unit, cfg: Config) -> list:
    lines = len(unit.text.splitlines())
    module = cfg.is_module(unit.path)
    rule, label = ("module-size", "entry module") if module else ("file-size", "file")
    limit = cfg.module_limit if module else cfg.file_limit
    target = cfg.module_limit if module else cfg.file_target
    if lines > cfg.hard(limit):
        return [Finding(rule, unit.path, 1, "error", lines, limit,
                        f"{label} has {lines} lines (limit {limit})")]
    if lines > target:
        return [Finding(rule, unit.path, 1, "warn", lines, target,
                        f"{label} has {lines} lines (target {target})")]
    return []


def function_findings(unit: Unit, fn, cfg: Config) -> list:
    out = []
    limit = cfg.function_limit
    if fn.length is not None and fn.length > limit:
        severity = "error" if fn.length > cfg.hard(limit) else "warn"
        out.append(Finding("function-length", unit.path, fn.line, severity, fn.length, limit,
                           f"{fn.name}() has {fn.length} lines (limit {limit})", fn.name))
    max_params = cfg.params_for(unit.lang)
    if not fn.is_constructor and fn.params > max_params:
        out.append(Finding("params", unit.path, fn.line, "error", fn.params, max_params,
                           f"{fn.name}() takes {fn.params} parameters (limit {max_params})",
                           fn.name))
    return out


def debug_findings(unit: Unit, masked: str) -> list:
    hits = []
    code_lines = masked.split("\n")
    for idx, raw in enumerate(unit.text.split("\n")):
        token = _debug_token(raw, code_lines[idx], unit.lang)
        if token:
            hits.append((idx + 1, token))
    if not hits:
        return []
    detail = ", ".join(f"{token} (line {line})" for line, token in hits[:5])
    noun = "debug leftover" if len(hits) == 1 else "debug leftovers"
    return [Finding("debug", unit.path, hits[0][0], "error", len(hits), 0,
                    f"{len(hits)} {noun}: {detail}")]


def import_findings(unit: Unit, masked: str, cfg: Config) -> list:
    hits = deep_imports(unit.text, masked, unit.lang, cfg.import_depth)
    if not hits:
        return []
    lines = ", ".join(f"line {line} ({depth} up)" for line, depth in hits[:5])
    noun = "relative import climbs" if len(hits) == 1 else "relative imports climb"
    message = (f"{len(hits)} {noun} more than {cfg.import_depth} levels: {lines}. "
               f"Instead, {advice(unit.lang)}")
    return [Finding("deep-import", unit.path, hits[0][0], "error", len(hits), cfg.import_depth,
                    message)]


def _debug_token(raw: str, code: str, lang: Language) -> Optional[str]:
    for pattern in _compiled(lang):
        match = pattern.search(raw)
        if not match:
            continue
        text = match.group()
        pos = match.start() + len(text) - len(text.lstrip())
        if pos < len(code) and code[pos] == raw[pos] and not raw[pos].isspace():
            return text.strip()
    return None


def _compiled(lang: Language) -> tuple:
    if lang.name not in _PATTERNS:
        _PATTERNS[lang.name] = tuple(re.compile(p) for p in lang.debug + CONFLICT_MARKERS)
    return _PATTERNS[lang.name]
