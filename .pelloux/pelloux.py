#!/usr/bin/env python3
"""Pelloux audit: file, function, parameter and debug checks with a baseline ratchet.

    python3 pelloux.py audit            # whole tree, ratchet against pelloux-baseline.json
    python3 pelloux.py audit --staged   # files staged for commit (pre-commit hook)
    python3 pelloux.py seed             # record current violations as the baseline
    python3 pelloux.py hook             # Claude Code PostToolUse hook (reads JSON on stdin)
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from pelloux_audit.cli import main  # noqa: E402

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
