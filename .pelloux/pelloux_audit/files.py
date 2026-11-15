"""File discovery through git, with a plain directory walk as fallback."""

from __future__ import annotations

import os
import subprocess
from pathlib import Path
from typing import Optional

SKIP_DIRS = {"node_modules", "vendor", "dist", "build", "target", "venv", "__pycache__"}


def repo_root(start: Path) -> Path:
    out = _git(["rev-parse", "--show-toplevel"], start)
    return Path(out.strip()) if out else start


def all_files(root: Path) -> list:
    out = _git(["ls-files", "-co", "--exclude-standard", "-z"], root)
    if out is None:
        return _walk(root)
    return [p for p in out.split("\0") if p]


def staged_files(root: Path) -> list:
    out = _git(["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"], root) or ""
    return [p for p in out.split("\0") if p]


def read(root: Path, path: str, staged: bool) -> Optional[str]:
    if staged:
        return _git(["show", f":{path}"], root)
    try:
        return (root / path).read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None


def _git(args: list, cwd: Path) -> Optional[str]:
    try:
        done = subprocess.run(["git", *args], cwd=cwd, capture_output=True, check=True)
    except (OSError, subprocess.CalledProcessError):
        return None
    return done.stdout.decode("utf-8", errors="replace")


def _walk(root: Path) -> list:
    found = []
    for current, dirs, names in os.walk(root):
        dirs[:] = [d for d in dirs if not d.startswith(".") and d not in SKIP_DIRS]
        rel = Path(current).relative_to(root)
        found += [(rel / name).as_posix() for name in names]
    return sorted(found)
