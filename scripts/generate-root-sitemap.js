#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const BUILD_DIR = path.resolve(ROOT_DIR, process.argv[2] || ".pages-build");
const OUTPUT_PATH = path.join(BUILD_DIR, "sitemap.xml");
const SITE_URL = "https://evpoint.kz";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function fileLastModifiedIso(filePath) {
  return fs.statSync(filePath).mtime.toISOString();
}

function normalizeIsoDate(value) {
  const timestamp = Date.parse(String(value ?? "").trim());
  if (!Number.isFinite(timestamp)) {
    return "";
  }
  return new Date(timestamp).toISOString();
}

function maxIsoDate(values, fallbackValue) {
  const normalized = values
    .map((value) => normalizeIsoDate(value))
    .filter(Boolean)
    .sort();

  return normalized[normalized.length - 1] || fallbackValue;
}

function blogLastModifiedIso() {
  const postsDir = path.join(ROOT_DIR, "blog-src", "_posts");
  const postFiles = fs.readdirSync(postsDir).map((file) => path.join(postsDir, file));
  const supportFiles = [
    path.join(ROOT_DIR, "blog-src", "_config.yml"),
    path.join(ROOT_DIR, "blog-src", "blog.md"),
    path.join(ROOT_DIR, "blog-src", "providers.md")
  ];

  return maxIsoDate(
    [...postFiles, ...supportFiles].map((filePath) => fileLastModifiedIso(filePath)),
    fileLastModifiedIso(path.join(ROOT_DIR, "blog-src", "_config.yml"))
  );
}

function faqLastModifiedIso() {
  return maxIsoDate([
    fileLastModifiedIso(path.join(ROOT_DIR, "faq", "index.html")),
    fileLastModifiedIso(path.join(ROOT_DIR, "faq", "faq.json"))
  ], fileLastModifiedIso(path.join(ROOT_DIR, "faq", "index.html")));
}

function stationsLastModifiedIso() {
  const data = readJson(path.join(ROOT_DIR, "data", "stations.json"));
  const places = data.result?.places || [];
  return maxIsoDate(
    places.map((place) => place.updated_at || place.created_at),
    fileLastModifiedIso(path.join(ROOT_DIR, "data", "stations.json"))
  );
}

function renderSitemap(entries) {
  const body = entries.map(({ loc, lastmod }) => `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
  </url>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

function main() {
  const entries = [
    { loc: `${SITE_URL}/`, lastmod: fileLastModifiedIso(path.join(ROOT_DIR, "index.html")) },
    { loc: `${SITE_URL}/app/`, lastmod: fileLastModifiedIso(path.join(ROOT_DIR, "app", "index.html")) },
    { loc: `${SITE_URL}/faq/`, lastmod: faqLastModifiedIso() },
    { loc: `${SITE_URL}/blog/`, lastmod: blogLastModifiedIso() },
    { loc: `${SITE_URL}/stations/`, lastmod: stationsLastModifiedIso() }
  ];

  fs.writeFileSync(OUTPUT_PATH, renderSitemap(entries));
  console.log(`Generated sitemap: ${OUTPUT_PATH}`);
}

main();
