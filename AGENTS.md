# Repository Guidelines

## Project Structure & Module Organization
This repository now publishes a combined GitHub Pages site:
- Landing site assets live at the repo root and are served from `/`.
- The Jekyll blog source lives in [`blog-src/`](./blog-src) and is built under `/blog/`.
- Blog content lives in [`blog-src/_posts/`](./blog-src/_posts), shared includes in [`blog-src/_includes/`](./blog-src/_includes), and global blog settings in [`blog-src/_config.yml`](./blog-src/_config.yml).
- The deployment workflow assembles the final Pages artifact into [`.pages-build/`](./.pages-build), which is generated output and should not be edited manually.

## Build, Test, and Development Commands
Install blog dependencies from [`blog-src/`](./blog-src) with `bundle install`. Build the blog only with `bundle exec jekyll build --source blog-src --destination /tmp/evpoint-blog-build`. Build the full Pages artifact with [`./scripts/build-pages.sh`](./scripts/build-pages.sh). The GitHub Pages deployment workflow lives in [`.github/workflows/pages.yml`](./.github/workflows/pages.yml).

## Coding Style & Naming Conventions
Use UTF-8 Markdown with concise front matter and clear headings for blog content. Follow the existing post pattern:

```md
---
layout: post
title: "Post title"
date: 2025-11-13
tags: [tag1, tag2]
description: "One-line summary"
---
```

Keep filenames lowercase and hyphenated. Preserve existing Liquid and HTML style in `blog-src/_includes/`; use two-space indentation there. Keep the landing site static unless a build step is truly needed. Do not introduce new Pages build dependencies without updating both the workflow and `blog-src/Gemfile`.

## Testing Guidelines
There is no automated test suite in this repository today. Validate changes by running `bundle exec jekyll build --source blog-src --destination /tmp/evpoint-blog-build` for blog-only work or `./scripts/build-pages.sh` for full-site changes. Spot-check the landing pages, `/blog/` routes, redirects for `blog.evpoint.kz`, and generated URLs such as feed and sitemap output.

## Commit & Pull Request Guidelines
Recent history uses very short subjects such as `fix` and `charge calc`; prefer slightly clearer imperative messages like `add charge calculator post` or `update providers page`. Keep commits focused on one change. Pull requests should include a short description, impacted pages or posts, screenshots for layout changes, and any relevant published URL or issue reference.

## Content & Publishing Notes
Set dates carefully because Jekyll uses them for permalinks and ordering. Keep `blog-src/_config.yml`, root-level `CNAME`, `robots.txt`, and the Pages workflow aligned with the production deployment, where `https://evpoint.kz` is canonical and the blog lives under `/blog/`.
