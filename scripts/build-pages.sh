#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/.pages-build"
BLOG_DIR="$BUILD_DIR/blog"

if [ -x /usr/local/opt/ruby/bin/bundle ]; then
  export PATH="/usr/local/opt/ruby/bin:$PATH"
fi

rm -rf "$BUILD_DIR"
mkdir -p "$BLOG_DIR"

rsync -a \
  --exclude '.git/' \
  --exclude '.github/' \
  --exclude '.DS_Store' \
  --exclude '_site/' \
  --exclude '.pages-build/' \
  --exclude '.jekyll-cache/' \
  --exclude '.sass-cache/' \
  --exclude 'vendor/' \
  --exclude 'blog-src/' \
  --exclude 'scripts/' \
  --exclude 'sitemap.xml' \
  --exclude 'AGENTS.md' \
  --exclude '.gitignore' \
  "$ROOT_DIR/" "$BUILD_DIR/"

(
  cd "$ROOT_DIR/blog-src"
  bundle exec jekyll build --destination "$BLOG_DIR"
)

node "$ROOT_DIR/scripts/generate-station-pages.js" "data/stations.json" "$BUILD_DIR"
node "$ROOT_DIR/scripts/generate-root-sitemap.js" "$BUILD_DIR"

touch "$BUILD_DIR/.nojekyll"
