#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const INPUT_PATH = path.resolve(ROOT_DIR, process.argv[2] || "data/stations.json");
const OUTPUT_ROOT = path.resolve(ROOT_DIR, process.argv[3] || ".pages-build");
const STATIONS_DIR = path.join(OUTPUT_ROOT, "stations");
const SITEMAP_PATH = path.join(OUTPUT_ROOT, "stations-sitemap.xml");
const SITE_URL = "https://evpoint.kz";
const STATIONS_STYLESHEET_PATH = "/assets/stations.css";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

function fileLastModifiedIso(filePath) {
  return fs.statSync(filePath).mtime.toISOString();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugify(value) {
  const translitMap = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
    и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya"
  };

  return String(value ?? "")
    .trim()
    .toLowerCase()
    .split("")
    .map((char) => translitMap[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function safeText(value, fallback = "Не указано") {
  const text = normalizeWhitespace(value);
  return text || fallback;
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function dedupe(values) {
  return [...new Set(values.filter(Boolean))];
}

function uniqueBy(values, getKey) {
  const seen = new Set();
  const result = [];

  for (const value of values) {
    const key = getKey(value);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(value);
  }

  return result;
}

function firstNonEmpty(...values) {
  for (const value of values) {
    const normalized = normalizeWhitespace(value);
    if (normalized) {
      return normalized;
    }
  }
  return "";
}

function buildProviderMap(providers) {
  return new Map((providers || []).map((provider) => [provider.id, provider]));
}

function extractFromTitle(title) {
  const match = title.match(/\(([^)]+)\)/);
  if (!match) {
    return "";
  }

  const value = normalizeWhitespace(match[1]);
  if (!value || /\d/.test(value) || value.length > 40) {
    return "";
  }
  return value;
}

const LOCALITY_ALIASES = [
  { patterns: [/алматы/i, /almaty/i], value: "Алматы" },
  { patterns: [/астана/i, /astana/i, /нур-султан/i], value: "Астана" },
  { patterns: [/шымкент/i, /shymkent/i], value: "Шымкент" },
  { patterns: [/караганда/i, /karaganda/i], value: "Караганда" },
  { patterns: [/тараз/i, /taraz/i], value: "Тараз" },
  { patterns: [/актау/i, /aktau/i], value: "Актау" },
  { patterns: [/атырау/i, /atyrau/i], value: "Атырау" },
  { patterns: [/актобе/i, /aktobe/i], value: "Актобе" },
  { patterns: [/павлодар/i, /pavlodar/i], value: "Павлодар" },
  { patterns: [/костанай/i, /kostanay/i], value: "Костанай" },
  { patterns: [/кокшетау/i, /kokshetau/i], value: "Кокшетау" },
  { patterns: [/петропавл/i, /petropavl/i], value: "Петропавловск" },
  { patterns: [/семей/i, /semey/i], value: "Семей" },
  { patterns: [/усть-каменогор|оскемен/i, /ust-kamenogorsk/i, /oskemen/i], value: "Усть-Каменогорск" },
  { patterns: [/туркестан/i, /turkistan/i], value: "Туркестан" },
  { patterns: [/кызылорд/i, /kyzylorda/i], value: "Кызылорда" },
  { patterns: [/талдыкорган/i, /taldykorgan/i], value: "Талдыкорган" },
  { patterns: [/жезказган/i, /zhezkazgan/i], value: "Жезказган" },
  { patterns: [/балхаш/i, /balkhash/i], value: "Балхаш" },
  { patterns: [/конаев/i, /konaev/i, /kapchagai/i, /капчагай/i], value: "Конаев" },
  { patterns: [/щучинск/i, /shchuchinsk/i], value: "Щучинск" },
  { patterns: [/рудный/i, /rudny/i], value: "Рудный" },
  { patterns: [/экибастуз/i, /ekibastuz/i], value: "Экибастуз" },
  { patterns: [/байконыр|байконур/i, /baikonur/i], value: "Байконур" },
  { patterns: [/сарыагаш/i, /saryagash/i], value: "Сарыагаш" },
  { patterns: [/ушарал/i, /usharal/i], value: "Ушарал" },
  { patterns: [/урал[ьс]?к/i, /oral/i, /uralsk/i], value: "Уральск" },
  { patterns: [/туркестанская область/i], value: "Туркестанская область" },
  { patterns: [/алматинская область/i], value: "Алматинская область" },
  { patterns: [/жамбылская область/i], value: "Жамбылская область" },
  { patterns: [/акмолинская область/i], value: "Акмолинская область" },
  { patterns: [/мангистауская область/i], value: "Мангистауская область" },
  { patterns: [/восточно-казахстанская область/i], value: "Восточно-Казахстанская область" },
  { patterns: [/карагандинская область/i], value: "Карагандинская область" }
];

const CITY_ID_TO_LOCALITY = {
  akkol: "Акколь",
  aktau: "Актау",
  aktobe: "Актобе",
  almaty: "Алматы",
  aral: "Арал",
  astana: "Астана",
  atyrau: "Атырау",
  balkhash: "Балхаш",
  burabay: "Бурабай",
  ekibastuz: "Экибастуз",
  karaganda: "Караганда",
  kokshetau: "Кокшетау",
  konayev: "Конаев",
  kostanay: "Костанай",
  kyzylorda: "Кызылорда",
  oral: "Уральск",
  oskemen: "Усть-Каменогорск",
  pavlodar: "Павлодар",
  petropavl: "Петропавловск",
  semey: "Семей",
  shchuchinsk: "Щучинск",
  shymkent: "Шымкент",
  taldykorgan: "Талдыкорган",
  taraz: "Тараз",
  temirtau: "Темиртау",
  turkestan: "Туркестан",
  zhezkazgan: "Жезказган"
};

const REGION_TO_LOCALITY = {
  "Абайская обл.": "Абайская область",
  "Акмолинская обл.": "Акмолинская область",
  "Актюбинская обл.": "Актюбинская область",
  "Алматинская обл.": "Алматинская область",
  "Атырауская обл.": "Атырауская область",
  "Восточно-Казахстанская обл.": "Восточно-Казахстанская область",
  "г. Алматы": "Алматы",
  "г. Астана": "Астана",
  "г. Шымкент": "Шымкент",
  "Жамбылская обл.": "Жамбылская область",
  "Западно-Казахстанская обл.": "Западно-Казахстанская область",
  "Карагандинская обл.": "Карагандинская область",
  "Костанайская обл.": "Костанайская область",
  "Кызылординская обл.": "Кызылординская область",
  "Мангистауская обл.": "Мангистауская область",
  "обл. Жетісу": "область Жетысу",
  "Павлодарская обл.": "Павлодарская область",
  "Северо-Казахстанская обл.": "Северо-Казахстанская область",
  "Туркестанская обл.": "Туркестанская область",
  "Улытауская обл.": "Улытауская область"
};

function resolveKnownLocality(value) {
  const text = normalizeWhitespace(value);
  if (!text) {
    return "";
  }

  for (const alias of LOCALITY_ALIASES) {
    if (alias.patterns.some((pattern) => pattern.test(text))) {
      return alias.value;
    }
  }

  return "";
}

function detectLocality(place) {
  const cityId = normalizeWhitespace(place.city_id).toLowerCase();
  if (cityId && CITY_ID_TO_LOCALITY[cityId]) {
    return CITY_ID_TO_LOCALITY[cityId];
  }

  const region = normalizeWhitespace(place.region);
  if (region && REGION_TO_LOCALITY[region]) {
    return REGION_TO_LOCALITY[region];
  }

  if (region) {
    return region
      .replace(/^г\.\s*/i, "")
      .replace(/\s+обл\.$/i, " область")
      .trim();
  }

  return "Казахстан";
}

function collectConnectors(place) {
  const connectors = [];
  for (const station of place.stations || []) {
    for (const outlet of station.outlets || []) {
      connectors.push(normalizeWhitespace(outlet.connector));
    }
  }
  return dedupe(connectors).sort((a, b) => a.localeCompare(b, "ru"));
}

function collectProviders(place, providerMap) {
  const providerNames = [];
  for (const station of place.stations || []) {
    const provider = providerMap.get(station.provider_id);
    providerNames.push(provider?.name || station.provider_id);
  }
  return dedupe(providerNames).sort((a, b) => a.localeCompare(b, "ru"));
}

function collectPowers(place) {
  const powers = [];
  for (const station of place.stations || []) {
    const stationPower = toNumber(station.power);
    if (stationPower) {
      powers.push(stationPower);
    }
    for (const outlet of station.outlets || []) {
      const outletPower = toNumber(outlet.power);
      if (outletPower) {
        powers.push(outletPower);
      }
    }
  }
  return powers;
}

function normalizeStations(place, providerMap) {
  return (place.stations || []).map((station) => {
    const provider = providerMap.get(station.provider_id);
    const outlets = (station.outlets || []).map((outlet) => ({
      id: outlet.id,
      outletId: outlet.outlet_id,
      connector: safeText(outlet.connector),
      power: toNumber(outlet.power)
    }));
    const outletPowers = outlets.map((outlet) => outlet.power).filter(Boolean);
    const stationPower = toNumber(station.power);

    return {
      id: station.id,
      number: safeText(station.number, "Без номера"),
      status: safeText(station.status, "UNKNOWN"),
      providerName: provider?.name || safeText(station.provider_id, "Не указан"),
      price: toNumber(station.price),
      paymentLink: normalizeWhitespace(station.payment_link),
      power: stationPower || (outletPowers.length ? Math.max(...outletPowers) : null),
      outlets
    };
  });
}

function normalizeIsoDate(value) {
  const text = normalizeWhitespace(value);
  if (!text) {
    return "";
  }

  const timestamp = Date.parse(text);
  if (!Number.isFinite(timestamp)) {
    return "";
  }

  return new Date(timestamp).toISOString();
}

function inferUpdatedAt(place, datasetUpdatedAt) {
  return normalizeIsoDate(place.updated_at)
    || normalizeIsoDate(place.created_at)
    || datasetUpdatedAt;
}

function maxUpdatedAt(values, fallbackValue) {
  const normalized = values
    .map((value) => normalizeIsoDate(value))
    .filter(Boolean)
    .sort();

  return normalized[normalized.length - 1] || fallbackValue;
}

function formatLastUpdated(updatedAt) {
  return new Date(updatedAt).toLocaleString("ru-KZ");
}

function buildBreadcrumbList(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

function buildItemList(items) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: item.url,
      name: item.name
    }))
  };
}

function normalizePlace(place, providerMap, datasetUpdatedAt) {
  const locality = detectLocality(place);
  const localitySlug = slugify(locality) || "kazakhstan";
  const title = safeText(place.title, "Зарядная станция");
  const stationSlugBase = slugify(title) || `station-${place.id}`;
  const stationSlug = `${stationSlugBase}-${String(place.id).slice(-6).toLowerCase()}`;
  const relativeUrl = `/stations/${localitySlug}/${stationSlug}/`;
  const absoluteUrl = `${SITE_URL}${relativeUrl}`;
  const connectors = collectConnectors(place);
  const providers = collectProviders(place, providerMap);
  const powers = collectPowers(place);
  const stations = normalizeStations(place, providerMap);
  const maxPower = powers.length ? Math.max(...powers) : null;
  const latitude = place.location?.latitude ?? null;
  const longitude = place.location?.longitude ?? null;

  return {
    id: place.id,
    title,
    address: safeText(place.address, "Адрес уточняется"),
    locality,
    localitySlug,
    relativeUrl,
    absoluteUrl,
    stationSlug,
    latitude,
    longitude,
    connectors,
    providers,
    stations,
    stationCount: (place.stations || []).length,
    outletCount: (place.stations || []).reduce((sum, station) => sum + (station.outlets || []).length, 0),
    maxPower,
    amenities: dedupe((place.amenities || []).map((item) => normalizeWhitespace(item))),
    updatedAt: inferUpdatedAt(place, datasetUpdatedAt),
    place
  };
}

function formatPower(power) {
  return power ? `${power} кВт` : "Не указана";
}

function stationDeepLink(stationId) {
  if (!stationId) {
    return "https://evpoint.kz/stations";
  }
  return `https://evpoint.kz/stations?id=${encodeURIComponent(stationId)}`;
}

function renderResourceLinks(placeOrLocality) {
  const localityName = escapeHtml(placeOrLocality.locality || placeOrLocality.name || "Казахстан");
  const localitySlug = escapeHtml(placeOrLocality.localitySlug || placeOrLocality.slug || "");

  return `
    <section class="card">
      <h2>Полезные ссылки</h2>
      <div class="list">
        <div class="list-item">
          <h3><a href="/faq/">FAQ по зарядке и электромобилям</a></h3>
          <p>Ответы на частые вопросы о зарядке, приложении и поездках на электромобиле.</p>
        </div>
        <div class="list-item">
          <h3><a href="/blog/route-planning/">Как строить маршрут в evPoint.kz</a></h3>
          <p>Практический материал по поездкам между городами и поиску станций по пути.</p>
        </div>
        <div class="list-item">
          <h3><a href="/blog/providers/">Провайдеры зарядных станций</a></h3>
          <p>Список операторов и сетей, доступных в базе evPoint.kz.</p>
        </div>
        <div class="list-item">
          <h3><a href="/stations/${localitySlug}/">Все станции в ${localityName}</a></h3>
          <p>Быстрый переход к каталогу зарядных станций по этой локации.</p>
        </div>
      </div>
    </section>`;
}

function pageShell({ title, description, canonicalUrl, body, jsonLd }) {
  const jsonLdPayload = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <link rel="stylesheet" href="${STATIONS_STYLESHEET_PATH}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:site_name" content="evPoint.kz">
  <meta name="robots" content="index,follow">
  <script type="application/ld+json">${JSON.stringify(jsonLdPayload)}</script>
</head>
<body>
  ${body}
</body>
</html>`;
}

function renderStationPage(place, siblingPlaces) {
  const title = `${place.title} в ${place.locality} | evPoint.kz`;
  const description = `Зарядная станция ${place.title} в ${place.locality}: адрес, коннекторы, мощность и операторы на evPoint.kz.`;
  const breadcrumbJsonLd = buildBreadcrumbList([
    { name: "Главная", url: `${SITE_URL}/` },
    { name: "Станции", url: `${SITE_URL}/stations/` },
    { name: place.locality, url: `${SITE_URL}/stations/${place.localitySlug}/` },
    { name: place.title, url: place.absoluteUrl }
  ]);
  const stationJsonLd = {
    "@context": "https://schema.org",
    "@type": "ElectricVehicleChargingStation",
    name: place.title,
    url: place.absoluteUrl,
    dateCreated: place.updatedAt,
    dateModified: place.updatedAt,
    address: {
      "@type": "PostalAddress",
      addressCountry: "KZ",
      addressLocality: place.locality,
      streetAddress: place.address
    },
    geo: place.latitude != null && place.longitude != null ? {
      "@type": "GeoCoordinates",
      latitude: place.latitude,
      longitude: place.longitude
    } : undefined,
    amenityFeature: place.connectors.map((connector) => ({
      "@type": "LocationFeatureSpecification",
      name: connector,
      value: true
    })),
    provider: place.providers.map((name) => ({
      "@type": "Organization",
      name
    }))
  };
  const jsonLd = [breadcrumbJsonLd, stationJsonLd];

  const related = siblingPlaces
    .filter((item) => item.id !== place.id)
    .slice(0, 8)
    .map((item) => `
      <div class="list-item">
        <h3><a href="${escapeHtml(item.relativeUrl)}">${escapeHtml(item.title)}</a></h3>
        <p>${escapeHtml(item.address)}</p>
      </div>`)
    .join("");

  const stationsList = place.stations
    .map((station) => `
      <div class="list-item">
        <h3>Станция ${escapeHtml(station.number)}</h3>
        <p>ID: ${escapeHtml(station.id)}</p>
        <p>Провайдер: ${escapeHtml(station.providerName)}</p>
        <p>Мощность: ${escapeHtml(formatPower(station.power))}</p>
        <p>Цена: ${station.price != null ? `${station.price} тг` : "Не указана"}</p>
        ${station.paymentLink ? `<p><a href="${escapeHtml(station.paymentLink)}">Ссылка на оплату</a></p>` : ""}
        <div class="chips">
          ${station.outlets.length
            ? station.outlets.map((outlet) => `<span class="chip">${escapeHtml(outlet.connector)}${outlet.power ? ` ${escapeHtml(String(outlet.power))} кВт` : ""}</span>`).join("")
            : `<span class="chip">Разъемы не указаны</span>`}
        </div>
        <div class="actions">
          <a class="button primary" href="${escapeHtml(stationDeepLink(station.id))}">Открыть в evPoint.kz</a>
        </div>
      </div>`)
    .join("");

  const body = `
  <main class="wrap">
    <div class="topbar">
      <a href="/">Главная</a>
      <a href="/stations/">Все станции</a>
      <a href="/stations/${escapeHtml(place.localitySlug)}/">${escapeHtml(place.locality)}</a>
      <a href="/faq/">FAQ</a>
      <a href="/blog/">Блог</a>
    </div>
    <article class="card">
      <h1>${escapeHtml(place.title)}</h1>
      <p class="lead">Страница станции evPoint.kz для поиска в Google и перехода в приложение.</p>
      <div class="meta">
        <div class="meta-item">
          <span class="meta-label">Область/город</span>
          ${escapeHtml(place.locality)}
        </div>
        <div class="meta-item">
          <span class="meta-label">Адрес</span>
          ${escapeHtml(place.address)}
        </div>
        <div class="meta-item">
          <span class="meta-label">Максимальная мощность</span>
          ${escapeHtml(formatPower(place.maxPower))}
        </div>
        <div class="meta-item">
          <span class="meta-label">Провайдеры</span>
          ${escapeHtml(place.providers.join(", ") || "Не указаны")}
        </div>
        <div class="meta-item">
          <span class="meta-label">Постов и разъемов</span>
          ${place.stationCount} станц. модулей, ${place.outletCount} разъемов
        </div>
      </div>
      <h2>Список станций</h2>
      <div class="list">
        ${stationsList}
      </div>
      ${related ? `
      <h2>Другие станции рядом по локации</h2>
      <div class="list">${related}</div>` : ""}
    </article>
    ${renderResourceLinks(place)}
    <footer>Последнее обновление страницы: ${escapeHtml(formatLastUpdated(place.updatedAt))}</footer>
  </main>`;

  return pageShell({
    title,
    description,
    canonicalUrl: place.absoluteUrl,
    body,
    jsonLd
  });
}

function renderLocalityPage(locality, places) {
  const title = `Зарядные станции в ${locality.name} | evPoint.kz`;
  const description = `Каталог зарядных станций в ${locality.name}: адреса, коннекторы и операторы на evPoint.kz.`;
  const localityUrl = `${SITE_URL}/stations/${locality.slug}/`;
  const localityUpdatedAt = maxUpdatedAt(places.map((place) => place.updatedAt), locality.updatedAt);
  const jsonLd = [
    buildBreadcrumbList([
      { name: "Главная", url: `${SITE_URL}/` },
      { name: "Станции", url: `${SITE_URL}/stations/` },
      { name: locality.name, url: localityUrl }
    ]),
    {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    url: localityUrl,
    dateModified: localityUpdatedAt
    },
    buildItemList(places.map((place) => ({
      url: place.absoluteUrl,
      name: place.title
    })))
  ];
  const items = places
    .map((place) => `
      <div class="list-item">
        <h3><a href="${escapeHtml(place.relativeUrl)}">${escapeHtml(place.title)}</a></h3>
        <p>${escapeHtml(place.address)}</p>
        <div class="chips">
          <span class="chip">${escapeHtml(formatPower(place.maxPower))}</span>
          ${(place.connectors.slice(0, 4)).map((connector) => `<span class="chip">${escapeHtml(connector)}</span>`).join("")}
        </div>
      </div>`)
    .join("");

  const body = `
  <main class="wrap">
    <div class="topbar">
      <a href="/">Главная</a>
      <a href="/stations/">Все станции</a>
      <a href="/faq/">FAQ</a>
      <a href="/blog/">Блог</a>
    </div>
    <section class="card">
      <h1>${escapeHtml(locality.name)}</h1>
      <p class="lead">Найдено ${places.length} станций в этой локации.</p>
      <div class="list">${items}</div>
    </section>
    ${renderResourceLinks(locality)}
  </main>`;

  return pageShell({
    title,
    description,
    canonicalUrl: localityUrl,
    body,
    jsonLd
  });
}

function renderIndexPage(localities, places) {
  const title = "Зарядные станции Казахстана | evPoint.kz";
  const description = "Каталог зарядных станций evPoint.kz по городам и регионам Казахстана.";
  const indexUrl = `${SITE_URL}/stations/`;
  const indexUpdatedAt = maxUpdatedAt(places.map((place) => place.updatedAt), fileLastModifiedIso(INPUT_PATH));
  const jsonLd = [
    buildBreadcrumbList([
      { name: "Главная", url: `${SITE_URL}/` },
      { name: "Станции", url: indexUrl }
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      url: indexUrl,
      dateModified: indexUpdatedAt
    },
    buildItemList(uniqueBy(places, (place) => place.absoluteUrl).slice(0, 50).map((place) => ({
      url: place.absoluteUrl,
      name: place.title
    })))
  ];
  const localityCards = localities
    .map((locality) => `
      <div class="list-item">
        <h3><a href="/stations/${escapeHtml(locality.slug)}/">${escapeHtml(locality.name)}</a></h3>
        <p>${locality.count} станций</p>
      </div>`)
    .join("");

  const recentCards = places
    .slice(0, 12)
    .map((place) => `
      <div class="list-item">
        <h3><a href="${escapeHtml(place.relativeUrl)}">${escapeHtml(place.title)}</a></h3>
        <p>${escapeHtml(place.locality)}. ${escapeHtml(place.address)}</p>
      </div>`)
    .join("");

  const body = `
  <main class="wrap">
    <section class="card">
      <h1>Зарядные станции Казахстана</h1>
      <p class="lead">Статический каталог станций evPoint.kz для индексации в поисковых системах.</p>
      <div class="meta">
        <div class="meta-item">
          <span class="meta-label">Станций</span>
          ${places.length}
        </div>
        <div class="meta-item">
          <span class="meta-label">Области и города</span>
          ${localities.length}
        </div>
      </div>
      <h2>Области и города</h2>
      <div class="list">${localityCards}</div>
      <h2>Примеры станций</h2>
      <div class="list">${recentCards}</div>
    </section>
    <section class="card">
      <h2>Полезные материалы</h2>
      <div class="list">
        <div class="list-item">
          <h3><a href="/faq/">FAQ по электромобилям и зарядке</a></h3>
          <p>Частые вопросы о зарядных станциях, приложении и использовании сервиса.</p>
        </div>
        <div class="list-item">
          <h3><a href="/blog/route-planning/">Маршруты с зарядками по Казахстану</a></h3>
          <p>Гид по построению маршрута и поиску зарядных точек по дороге.</p>
        </div>
        <div class="list-item">
          <h3><a href="/blog/providers/">Сети и провайдеры зарядных станций</a></h3>
          <p>Материал о провайдерах, доступных в базе evPoint.kz.</p>
        </div>
      </div>
    </section>
  </main>`;

  return pageShell({
    title,
    description,
    canonicalUrl: indexUrl,
    body,
    jsonLd
  });
}

function renderSitemap(urlEntries) {
  const entries = urlEntries
    .map(({ url, updatedAt }) => `  <url>
    <loc>${escapeHtml(url)}</loc>
    <lastmod>${escapeHtml(updatedAt)}</lastmod>
  </url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

function main() {
  const data = readJson(INPUT_PATH);
  const datasetUpdatedAt = fileLastModifiedIso(INPUT_PATH);
  const providerMap = buildProviderMap(data.result?.providers || []);
  const places = (data.result?.places || []).map((place) => normalizePlace(place, providerMap, datasetUpdatedAt));
  const sortedPlaces = places.sort((a, b) => {
    const localityCompare = a.locality.localeCompare(b.locality, "ru");
    return localityCompare || a.title.localeCompare(b.title, "ru");
  });

  ensureDir(STATIONS_DIR);

  const localitiesMap = new Map();
  for (const place of sortedPlaces) {
    const key = place.localitySlug;
    if (!localitiesMap.has(key)) {
      localitiesMap.set(key, {
        slug: place.localitySlug,
        name: place.locality,
        updatedAt: place.updatedAt,
        places: []
      });
    }
    localitiesMap.get(key).places.push(place);
    localitiesMap.get(key).updatedAt = maxUpdatedAt(
      [localitiesMap.get(key).updatedAt, place.updatedAt],
      datasetUpdatedAt
    );
  }

  const sitemapEntries = [];

  writeFile(path.join(STATIONS_DIR, "index.html"), renderIndexPage(
    [...localitiesMap.values()]
      .map((locality) => ({ slug: locality.slug, name: locality.name, count: locality.places.length }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ru")),
    sortedPlaces
  ));
  sitemapEntries.push({
    url: `${SITE_URL}/stations/`,
    updatedAt: maxUpdatedAt(sortedPlaces.map((place) => place.updatedAt), datasetUpdatedAt)
  });

  for (const locality of localitiesMap.values()) {
    writeFile(
      path.join(STATIONS_DIR, locality.slug, "index.html"),
      renderLocalityPage(locality, locality.places)
    );
    sitemapEntries.push({
      url: `${SITE_URL}/stations/${locality.slug}/`,
      updatedAt: locality.updatedAt
    });

    for (const place of locality.places) {
      writeFile(
        path.join(STATIONS_DIR, locality.slug, place.stationSlug, "index.html"),
        renderStationPage(place, locality.places)
      );
      sitemapEntries.push({
        url: place.absoluteUrl,
        updatedAt: place.updatedAt
      });
    }
  }

  writeFile(SITEMAP_PATH, renderSitemap(sitemapEntries));

  console.log(`Generated ${sortedPlaces.length} station pages in ${STATIONS_DIR}`);
  console.log(`Generated ${localitiesMap.size} locality pages`);
  console.log(`Generated sitemap: ${SITEMAP_PATH}`);
}

main();
