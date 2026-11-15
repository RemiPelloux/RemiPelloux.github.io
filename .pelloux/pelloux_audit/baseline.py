"""The ratchet: known violations may shrink, never grow, and nothing new may join them."""

from __future__ import annotations

import dataclasses
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

from . import __version__

LEGACY_KEYS = {"oversized_files": "file-size", "oversized_controllers": "module-size",
               "oversized_hooks": "module-size", "oversized_services": "module-size"}
SIZE_RULES = ("file-size", "module-size")
NO_CEILING = 10 ** 9


@dataclass
class Result:
    errors: list = field(default_factory=list)
    warnings: list = field(default_factory=list)
    held: list = field(default_factory=list)


def load(path: Path) -> dict:
    """Read pelloux-baseline.json, including the older oversized_* list format."""
    if not path.exists():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    entries = {key: int(value) for key, value in data.get("entries", {}).items()}
    for legacy, rule in LEGACY_KEYS.items():
        for item in data.get(legacy, []):
            file, lines = (item["path"], item["lines"]) if isinstance(item, dict) else (item, NO_CEILING)
            entries.setdefault(f"{rule}::{file}", int(lines))
    return entries


def write(path: Path, findings: list) -> int:
    entries: dict = {}
    for finding in findings:
        if finding.severity == "error":
            entries[finding.key] = max(entries.get(finding.key, 0), finding.value)
    payload = {
        "version": 1,
        "tool": f"pelloux-audit {__version__}",
        "note": "Known violations. Each value is a ceiling: it may go down, never up. "
                "Re-seed only on purpose, in its own commit.",
        "entries": dict(sorted(entries.items())),
    }
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return len(entries)


def apply(findings: list, entries: dict) -> Result:
    result = Result()
    for finding in findings:
        if finding.severity != "error":
            result.warnings.append(finding)
            continue
        ceiling = ceiling_for(finding, entries)
        if ceiling is not None and finding.value <= ceiling:
            result.held.append(finding)
        else:
            result.errors.append(_explain(finding, ceiling))
    return result


def ceiling_for(finding, entries: dict) -> Optional[int]:
    if finding.key in entries:
        return entries[finding.key]
    if finding.rule in SIZE_RULES:
        other = SIZE_RULES[1] if finding.rule == SIZE_RULES[0] else SIZE_RULES[0]
        return entries.get(f"{other}::{finding.path}")
    return None


def stale(entries: dict, findings: list, scanned: set) -> list:
    """Baseline keys for scanned files that no longer have a matching violation."""
    live = {f.key for f in findings if f.severity == "error"}
    live |= {f"{other}::{f.path}" for f in findings for other in SIZE_RULES if f.rule in SIZE_RULES}
    return sorted(k for k in entries if k not in live and k.split("::")[1] in scanned)


def _explain(finding, ceiling: Optional[int]):
    if ceiling is None:
        return finding
    message = f"{finding.message}, grew past its baseline of {ceiling}"
    return dataclasses.replace(finding, message=message)
