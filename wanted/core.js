(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.WantedCore = api;
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  var LOCATION_TYPES = ["residential", "office", "mall", "public_parking", "hotel_tourism", "highway", "other"];
  var FREQUENCIES = ["unspecified", "daily", "several_weekly", "several_monthly", "trips"];
  var CHARGER_TYPES = ["ac", "dc", "unknown"];
  var STATUSES = ["collecting_votes", "sent_to_operators", "under_review", "planned", "installed", "rejected", "archived"];

  function asNumber(value) { var n = Number(value); return Number.isFinite(n) ? n : null; }
  function clean(value, max) { return String(value == null ? "" : value).replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max); }
  function validCoordinate(lat, lng) { return lat >= 40.5 && lat <= 55.5 && lng >= 46 && lng <= 88.5; }
  function validateProposal(input) {
    var location = input.location || {};
    var value = {
      location: {
        latitude: asNumber(location.latitude), longitude: asNumber(location.longitude)
      },
      placeLabel: clean(input.placeLabel, 160), locationType: clean(input.locationType, 30),
      reason: clean(input.reason, 500), frequency: clean(input.frequency || "unspecified", 30),
      chargerType: clean(input.chargerType, 20), connectors: Array.isArray(input.connectors) ? input.connectors.map(function (x) { return clean(x, 24); }).filter(Boolean).slice(0, 8) : [],
      authorComment: clean(input.authorComment, 1000),
      authorName: clean(input.authorName, 120)
    };
    var errors = {};
    if (value.location.latitude === null || value.location.longitude === null || !validCoordinate(value.location.latitude, value.location.longitude)) errors.coordinates = "invalid";
    if (value.placeLabel && value.placeLabel.length < 2) errors.placeLabel = "invalid";
    if (LOCATION_TYPES.indexOf(value.locationType) < 0) errors.locationType = "invalid";
    if (!value.reason || value.reason.length < 2) errors.reason = "required";
    if (FREQUENCIES.indexOf(value.frequency) < 0) errors.frequency = "invalid";
    if (CHARGER_TYPES.indexOf(value.chargerType) < 0) errors.chargerType = "invalid";
    return { valid: Object.keys(errors).length === 0, errors: errors, value: value };
  }
  function distanceMeters(a, b) {
    var rad = Math.PI / 180, p1 = a.location.latitude * rad, p2 = b.location.latitude * rad;
    var dp = (b.location.latitude - a.location.latitude) * rad, dl = (b.location.longitude - a.location.longitude) * rad;
    var h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    return 12742000 * Math.asin(Math.sqrt(h));
  }
  function nearby(items, point, radius) { return items.filter(function (item) { return !["archived", "rejected"].includes(item.status) && distanceMeters(item, point) <= (radius || 300); }).sort(function (a, b) { return distanceMeters(a, point) - distanceMeters(b, point); }); }
  function inBounds(item, bounds) { return !bounds || (item.location.latitude >= bounds.south && item.location.latitude <= bounds.north && item.location.longitude >= bounds.west && item.location.longitude <= bounds.east); }
  function matches(item, filters) { return (!filters.status || item.status === filters.status) && (!filters.locationType || item.locationType === filters.locationType) && (!filters.chargerType || item.chargerType === filters.chargerType); }
  function pluralVotes(count, lang) {
    var l = (lang || "ru").slice(0, 2).toLowerCase();
    var n = Math.abs(Number(count) || 0);
    if (l === "kk" || l === "kz") return "дауыс";
    if (l === "en") return n === 1 ? "vote" : "votes";
    var mod10 = n % 10;
    var mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 14) return "голосов";
    if (mod10 === 1) return "голос";
    if (mod10 >= 2 && mod10 <= 4) return "голоса";
    return "голосов";
  }
  return { LOCATION_TYPES: LOCATION_TYPES, FREQUENCIES: FREQUENCIES, CHARGER_TYPES: CHARGER_TYPES, STATUSES: STATUSES, clean: clean, validateProposal: validateProposal, distanceMeters: distanceMeters, nearby: nearby, inBounds: inBounds, matches: matches, pluralVotes: pluralVotes };
}));
