# Repository Guidelines

## Project Structure & Module Organization
This repository is a Jekyll blog deployed via GitHub Pages. Content lives in [`_posts/`](./_posts) as dated Markdown files named `YYYY-MM-DD-slug.md`. Reusable theme overrides live in [`_includes/`](./_includes), site data in [`_data/`](./_data), and global settings in [`_config.yml`](./_config.yml). Top-level pages such as [`about.markdown`](./about.markdown), [`blog.md`](./blog.md), and [`providers.md`](./providers.md) render standalone routes. Treat [`_site/`](./_site) as generated output: do not edit it manually.

## Build, Test, and Development Commands
Install dependencies with `bundle install`. Run the site locally with `bundle exec jekyll serve --livereload` and open `http://127.0.0.1:4000`. For container-based work, use `docker compose up`; it installs gems and serves the site with polling enabled. Build the production output with `bundle exec jekyll build`, which regenerates `_site/`.

## Coding Style & Naming Conventions
Use UTF-8 Markdown with concise front matter and clear headings. Follow the existing post pattern:

```md
---
layout: post
title: "Post title"
date: 2025-11-13
tags: [tag1, tag2]
description: "One-line summary"
---
```

Keep filenames lowercase and hyphenated. Preserve existing Liquid and HTML style in `_includes/`; use two-space indentation there. Do not introduce unused plugins or custom build steps without updating `_config.yml` and `Gemfile`.

## Testing Guidelines
There is no automated test suite in this repository today. Validate changes by running `bundle exec jekyll build` and checking for build errors, then spot-check the affected pages in the local server. For content updates, verify front matter, internal links, and generated URLs. For template changes, confirm header, feed, and sitemap output still render correctly.

## Commit & Pull Request Guidelines
Recent history uses very short subjects such as `fix` and `charge calc`; prefer slightly clearer imperative messages like `add charge calculator post` or `update providers page`. Keep commits focused on one change. Pull requests should include a short description, impacted pages or posts, screenshots for layout changes, and any relevant published URL or issue reference.

## Content & Publishing Notes
Set dates carefully because Jekyll uses them for permalinks and ordering. Keep `url`, `baseurl`, and deployment-related files such as `CNAME` and `robots.txt` consistent with production settings.
