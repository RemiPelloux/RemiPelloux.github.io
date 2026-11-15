#!/bin/sh
# The local gate, the same checks as CI: the Pelloux audit, then RIVIERA.OS's type check, tests and
# build. Run it before calling a change done:  sh scripts/ci-local.sh
set -e
cd "$(dirname "$0")/.."
python3 .pelloux/pelloux.py audit
cd os
npm run --silent typecheck
npm test --silent
npm run --silent build >/dev/null
echo "ci-local: all green"
