"""Run the checks over a set of files and apply the baseline ratchet."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

from . import baseline, files
from .checks import Unit, check_file
from .config import Config
from .languages import BY_NAME, detect


@dataclass
class Request:
    staged: bool = False
    paths: Optional[list] = None
    rules: Optional[set] = None


@dataclass
class Report:
    scanned: int
    languages: list
    findings: list
    result: baseline.Result
    stale: list = field(default_factory=list)

    @property
    def ok(self) -> bool:
        return not self.result.errors


def collect(cfg: Config, request: Request) -> tuple:
    """Return (findings, scanned paths, languages seen) without applying the baseline."""
    paths = _candidates(cfg, request)
    findings, scanned, seen = [], set(), set()
    for path in paths:
        lang = detect(path)
        text = files.read(cfg.root, path, request.staged)
        if text is None:
            continue
        findings += check_file(Unit(path, text, lang), cfg, request.rules)
        scanned.add(path)
        seen.add(lang.label)
    return findings, scanned, sorted(seen)


def run(cfg: Config, request: Request) -> Report:
    findings, scanned, seen = collect(cfg, request)
    entries = baseline.load(cfg.baseline_path())
    result = baseline.apply(findings, entries)
    whole_tree = not request.staged and request.paths is None
    stale = baseline.stale(entries, findings, scanned) if whole_tree else []
    return Report(len(scanned), seen, findings, result, stale)


def _candidates(cfg: Config, request: Request) -> list:
    if request.staged:
        paths = files.staged_files(cfg.root)
    elif request.paths:
        paths = list(request.paths)
    else:
        paths = files.all_files(cfg.root)
    allowed = {BY_NAME[name] for name in cfg.languages if name in BY_NAME}
    keep = []
    for path in paths:
        lang = detect(path)
        if lang and (not allowed or lang in allowed) and not cfg.is_excluded(path):
            keep.append(path)
    return keep
