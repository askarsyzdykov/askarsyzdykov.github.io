#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const input = path.resolve(root, process.argv[2] || "data/wanted-seed.json");
const output = path.resolve(root, process.argv[3] || ".pages-build");
const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const core = require("../wanted/core.js");

const statusLabels = {
  collecting_votes: "Собирает поддержку",
  sent_to_operators: "Передано операторам",
  under_review: "Рассматривается",
  planned: "Запланирована",
  installed: "Установлена",
  rejected: "Отклонено",
  archived: "Архив"
};

for (const item of JSON.parse(fs.readFileSync(input, "utf8"))) {
  const title = `${item.placeLabel} — ${item.votesCount} ${core.pluralVotes(item.votesCount, "ru")} | evPoint.kz`;
  const description = `${statusLabels[item.status] || "Предложение"}. ${item.reason}`;
  const url = `https://evpoint.kz/wanted/${encodeURIComponent(item.id)}`;
  const html = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="evPoint.kz">
  <meta property="og:locale" content="ru_KZ">
  <meta name="twitter:card" content="summary">
  <meta name="theme-color" content="#007aff">
  <link rel="icon" href="/images/favicon-32x32.png">
  <link rel="stylesheet" href="/wanted/styles.css">
</head>
<body>
  <div id="wanted-app" class="app-shell"></div>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-EMM5QVH3QK"><\/script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","G-EMM5QVH3QK");<\/script>
  <script src="https://unpkg.com/@googlemaps/markerclusterer@2.6.2/dist/index.min.js"><\/script>
  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"><\/script>
  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"><\/script>
  <script src="/wanted/config.js"><\/script>
  <script src="/wanted/i18n.js"><\/script>
  <script src="/wanted/core.js"><\/script>
  <script src="/wanted/api.js"><\/script>
  <script src="/wanted/app.js"><\/script>
</body>
</html>
`;

  const directory = path.join(output, "wanted", item.id);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "index.html"), html);
}
