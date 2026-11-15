"""Human, JSON and GitHub Actions output."""

from __future__ import annotations

import json
import os
import sys

RED, YELLOW, GREEN, DIM, RESET = "\033[31m", "\033[33m", "\033[32m", "\033[2m", "\033[0m"


def use_color() -> bool:
    return sys.stdout.isatty() and "NO_COLOR" not in os.environ


def text(report, color: bool, verbose: bool = False) -> str:
    paint = (lambda code, s: f"{code}{s}{RESET}") if color else (lambda code, s: s)
    langs = ", ".join(report.languages) or "no supported files"
    lines = [paint(DIM, f"Pelloux audit · {report.scanned} files · {langs}"), ""]
    for f in report.result.errors:
        lines.append(f"  {paint(RED, 'ERROR')}  {f.path}:{f.line}  {f.message}")
    shown = report.result.warnings if verbose else report.result.warnings[:10]
    for f in shown:
        lines.append(f"  {paint(YELLOW, 'WARN ')}  {f.path}:{f.line}  {f.message}")
    hidden = len(report.result.warnings) - len(shown)
    if hidden:
        lines.append(paint(DIM, f"  … {hidden} more warnings (--verbose shows all)"))
    lines += ["", _summary(report, paint)]
    return "\n".join(lines)


def _summary(report, paint) -> str:
    errors, warns = len(report.result.errors), len(report.result.warnings)
    held, stale = len(report.result.held), len(report.stale)
    parts = [f"{errors} error{'s' if errors != 1 else ''}",
             f"{warns} warning{'s' if warns != 1 else ''}"]
    if held:
        parts.append(f"{held} baselined held")
    if stale:
        parts.append(f"{stale} baseline entries fixed (run `seed` to tighten)")
    mark = paint(GREEN, "✓") if report.ok else paint(RED, "✗")
    return f"{mark} " + " · ".join(parts)


def as_json(report) -> str:
    def row(f):
        return {"rule": f.rule, "path": f.path, "line": f.line, "severity": f.severity,
                "value": f.value, "limit": f.limit, "message": f.message, "name": f.name}
    payload = {
        "ok": report.ok,
        "scanned": report.scanned,
        "languages": report.languages,
        "errors": [row(f) for f in report.result.errors],
        "warnings": [row(f) for f in report.result.warnings],
        "held": [row(f) for f in report.result.held],
        "stale": report.stale,
    }
    return json.dumps(payload, indent=2, ensure_ascii=False)


def github(report) -> str:
    out = []
    for level, items in (("error", report.result.errors), ("warning", report.result.warnings)):
        for f in items:
            out.append(f"::{level} file={f.path},line={f.line},title=Pelloux {f.rule}::{f.message}")
    return "\n".join(out)
