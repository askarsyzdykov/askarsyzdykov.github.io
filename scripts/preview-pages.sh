#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/.pages-build"
PORT="${1:-4000}"

"$ROOT_DIR/scripts/build-pages.sh"

echo "Serving $BUILD_DIR at http://127.0.0.1:$PORT"
exec node "$ROOT_DIR/scripts/serve-pages.js" "$BUILD_DIR" "$PORT"
