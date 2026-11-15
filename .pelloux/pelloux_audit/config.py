"""Limits, path scopes and exemptions, read from an optional pelloux.json at the repo root."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

from .languages import Language

EXCLUDE = [
    "**/node_modules/**", "**/vendor/**", "**/third_party/**", "**/external/**", "**/dist/**",
    "**/build/**", "**/target/**", "**/.venv/**", "**/venv/**", "**/.next/**", "**/Pods/**",
    "**/.dart_tool/**", "**/DerivedData/**", "**/generated/**", "**/Generated/**", ".pelloux/**",
    "*.min.js", "*.d.ts", "*.g.dart", "*.freezed.dart", "*.gr.dart", "*.pb.go", "*_pb2.py",
    "*_gen.go", "*.generated.*",
]
SIZE_EXEMPT = [
    "**/test/**", "**/tests/**", "**/__tests__/**", "**/testdata/**", "**/spec/**", "**/fixtures/**",
    "**/integration_test/**", "**/src/test/**", "**/src/androidTest/**", "**/*Tests/**",
    "*.test.*", "*.spec.*", "*_test.go", "*_test.py", "test_*.py", "conftest.py", "*Tests.swift",
    "**/migrations/**", "**/seeders/**", "**/factories/**", "**/locales/**", "**/i18n/**",
    "**/l10n/**", "**/lang/**", "**/benches/**", "**/examples/**",
]
MODULES = ["**/hooks/**", "**/services/**", "**/controllers/**", "**/Controllers/**",
           "**/routes/**", "**/handlers/**"]


@dataclass
class Config:
    root: Path
    tolerance: float = 0.10
    file_target: int = 300
    file_limit: int = 400
    module_limit: int = 200
    function_limit: int = 25
    import_depth: Optional[int] = 2
    params: dict = field(default_factory=dict)
    languages: list = field(default_factory=list)
    baseline: str = "pelloux-baseline.json"
    modules: list = field(default_factory=lambda: list(MODULES))
    exclude: list = field(default_factory=lambda: list(EXCLUDE))
    size_exempt: list = field(default_factory=lambda: list(SIZE_EXEMPT))

    def hard(self, limit: int) -> int:
        """Limit plus tolerance, rounded down: 400 -> 440, 200 -> 220, 25 -> 27."""
        return int(limit * (1 + self.tolerance) + 1e-9)

    def params_for(self, lang: Language) -> int:
        return int(self.params.get(lang.name, lang.params))

    def is_excluded(self, path: str) -> bool:
        return _matches(path, self.exclude)

    def is_size_exempt(self, path: str) -> bool:
        return _matches(path, self.size_exempt)

    def is_module(self, path: str) -> bool:
        return _matches(path, self.modules)

    def baseline_path(self) -> Path:
        return self.root / self.baseline


def load(root: Path) -> Config:
    cfg = Config(root=root)
    path = root / "pelloux.json"
    if not path.exists():
        return cfg
    data = json.loads(path.read_text(encoding="utf-8"))
    cfg.tolerance = float(data.get("tolerance", cfg.tolerance))
    cfg.file_target = int(data.get("file", {}).get("target", cfg.file_target))
    cfg.file_limit = int(data.get("file", {}).get("limit", cfg.file_limit))
    cfg.module_limit = int(data.get("module", {}).get("limit", cfg.module_limit))
    cfg.function_limit = int(data.get("function", {}).get("limit", cfg.function_limit))
    cfg.import_depth = data.get("imports", {}).get("maxParentDepth", cfg.import_depth)
    cfg.params.update(data.get("params", {}))
    cfg.languages = list(data.get("languages", []))
    cfg.baseline = data.get("baseline", cfg.baseline)
    cfg.modules += data.get("module", {}).get("paths", [])
    cfg.exclude += data.get("exclude", [])
    cfg.size_exempt += data.get("sizeExempt", [])
    return cfg


_CACHE: dict = {}


def glob_regex(pattern: str):
    """Compile a gitignore-style glob. A pattern without a slash matches at any depth."""
    if pattern in _CACHE:
        return _CACHE[pattern]
    out = [] if "/" in pattern else ["(?:.*/)?"]
    i = 0
    while i < len(pattern):
        token, i = _glob_token(pattern, i)
        out.append(token)
    _CACHE[pattern] = re.compile("".join(out) + r"\Z")
    return _CACHE[pattern]


def _glob_token(pattern: str, i: int):
    if pattern.startswith("**/", i):
        return "(?:.*/)?", i + 3
    if pattern.startswith("**", i):
        return ".*", i + 2
    if pattern[i] == "*":
        return "[^/]*", i + 1
    if pattern[i] == "?":
        return "[^/]", i + 1
    return re.escape(pattern[i]), i + 1


def _matches(path: str, patterns: list) -> bool:
    return any(glob_regex(p).match(path) for p in patterns)
