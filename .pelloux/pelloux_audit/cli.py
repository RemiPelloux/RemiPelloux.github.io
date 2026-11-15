"""Command line: audit, seed, hook, version."""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

from . import __version__, baseline, config, files, report
from .audit import Request, collect, run

HOOK_RULES = {"file-size", "module-size", "function-length", "params", "deep-import"}


def main(argv: list) -> int:
    args = _parser().parse_args(argv)
    if args.command == "version":
        print(f"pelloux-audit {__version__}")
        return 0
    if args.command == "hook":
        return hook(sys.stdin.read())
    root = files.repo_root(Path(args.root).resolve())
    cfg = config.load(root)
    if args.command == "seed":
        return seed(cfg)
    return audit(cfg, args)


def audit(cfg, args) -> int:
    request = Request(staged=args.staged, paths=args.paths or None)
    result = run(cfg, request)
    if args.json:
        print(report.as_json(result))
    else:
        print(report.text(result, report.use_color(), args.verbose))
    if os.environ.get("GITHUB_ACTIONS") == "true" and not args.json:
        print(report.github(result))
    return 0 if result.ok else 1


def seed(cfg) -> int:
    findings, scanned, _ = collect(cfg, Request())
    count = baseline.write(cfg.baseline_path(), findings)
    print(f"Wrote {cfg.baseline} with {count} known violations across {len(scanned)} files.")
    print("From now on they may shrink, never grow. Commit the file on its own.")
    return 0


def hook(payload: str) -> int:
    """Claude Code PostToolUse hook. Exit 2 sends the message back to the agent."""
    try:
        target = Path(json.loads(payload).get("tool_input", {}).get("file_path", ""))
        if not target.is_file():
            return 0
        root = files.repo_root(target.parent)
        cfg = config.load(root)
        rel = target.resolve().relative_to(root.resolve()).as_posix()
        result = run(cfg, Request(paths=[rel], rules=HOOK_RULES))
    except Exception:  # a broken hook must never block the agent
        return 0
    if result.ok:
        return 0
    lines = [f"- {f.path}:{f.line} {f.message}" for f in result.result.errors]
    print("Pelloux Guidelines: this edit breaks a hard limit. Split it before you finish "
          "(rule 7) or fix it, touching only what the task needs:\n" + "\n".join(lines), file=sys.stderr)
    return 2


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="pelloux", description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    run_cmd = sub.add_parser("audit", help="check the tree, or staged files with --staged")
    run_cmd.add_argument("paths", nargs="*", help="only these repo-relative paths")
    run_cmd.add_argument("--staged", action="store_true", help="files staged for commit")
    run_cmd.add_argument("--json", action="store_true", help="machine-readable output")
    run_cmd.add_argument("--verbose", "-v", action="store_true", help="show every warning")
    for name in ("audit", "seed"):
        target = run_cmd if name == "audit" else sub.add_parser("seed", help="write the baseline")
        target.add_argument("--root", default=".", help="repository root (default: here)")
    sub.add_parser("hook", help="Claude Code PostToolUse hook, JSON on stdin")
    sub.add_parser("version", help="print the version")
    return parser
