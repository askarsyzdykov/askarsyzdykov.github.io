const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../wanted/core.js");

const validDriverDemand = {
  sourceType: "driver_demand",
  location: { latitude: 43.2389, longitude: 76.8897 },
  placeLabel: "Двор на Абая",
  locationType: "residential",
  reason: "Ближайшая зарядка всегда занята",
  frequency: "daily",
  chargerType: "ac",
  connectors: ["Type 2"]
};

const validSiteOffer = {
  sourceType: "site_offer",
  location: { latitude: 43.2389, longitude: 76.8897 },
  siteName: "ТРЦ Dostyk Plaza",
  placeLabel: "ТРЦ Dostyk Plaza",
  locationType: "mall",
  parkingSpacesAvailable: "5_plus",
  siteAccess: "24_7",
  powerStatus: "available",
  availablePower: "up_to_22",
  preferredChargerType: "ac_dc",
  cooperationTypes: ["provide_site", "rent"],
  contactName: "Аскар Сыздыков",
  contactPhone: "+7 (777) 123-45-67",
  contactEmail: "askar@example.com",
  siteRole: "owner",
  representativeConfirmed: true,
  authorComment: "Подземный паркинг, охрана 24/7"
};

test("validates a complete driver_demand proposal", () => {
  const res = core.validateProposal(validDriverDemand);
  assert.equal(res.valid, true);
  assert.equal(res.value.sourceType, "driver_demand");
});

test("defaults sourceType to driver_demand when omitted", () => {
  const input = { ...validDriverDemand };
  delete input.sourceType;
  const res = core.validateProposal(input);
  assert.equal(res.valid, true);
  assert.equal(res.value.sourceType, "driver_demand");
});

test("validates a proposal without placeLabel for driver_demand", () => {
  const input = { ...validDriverDemand };
  delete input.placeLabel;
  assert.equal(core.validateProposal(input).valid, true);
});

test("validates a proposal without a frequency answer for driver_demand", () => {
  const input = { ...validDriverDemand };
  delete input.frequency;
  assert.equal(core.validateProposal(input).valid, true);
});

test("keeps multiple optional connector selections for driver_demand", () => {
  assert.deepEqual(
    core.validateProposal({ ...validDriverDemand, connectors: ["GB/T", "NACS"] }).value.connectors,
    ["GB/T", "NACS"]
  );
});

test("rejects coordinates outside Kazakhstan", () => {
  assert.equal(
    core.validateProposal({ ...validDriverDemand, location: { latitude: 12, longitude: 76.8897 } }).errors.coordinates,
    "invalid"
  );
});

test("cleans unsafe user text", () => {
  assert.equal(core.clean(" <b> test </b> ", 50), "b test /b");
});

test("finds nearby proposals within 300 metres", () => {
  const items = [
    { ...validDriverDemand, id: "near", status: "collecting_votes" },
    { ...validDriverDemand, id: "far", location: { latitude: 44, longitude: 76.8897 }, status: "collecting_votes" }
  ];
  assert.deepEqual(core.nearby(items, validDriverDemand, 300).map(x => x.id), ["near"]);
});

test("accepts concise reason text", () => {
  assert.equal(core.validateProposal({ ...validDriverDemand, reason: "Дом" }).valid, true);
});

test("pluralizes votes correctly in Russian", () => {
  assert.equal(core.pluralVotes(1, "ru"), "голос");
  assert.equal(core.pluralVotes(2, "ru"), "голоса");
  assert.equal(core.pluralVotes(4, "ru"), "голоса");
  assert.equal(core.pluralVotes(5, "ru"), "голосов");
  assert.equal(core.pluralVotes(11, "ru"), "голосов");
  assert.equal(core.pluralVotes(21, "ru"), "голос");
  assert.equal(core.pluralVotes(22, "ru"), "голоса");
  assert.equal(core.pluralVotes(25, "ru"), "голосов");
});

test("pluralizes votes correctly in Kazakh and English", () => {
  assert.equal(core.pluralVotes(1, "kk"), "дауыс");
  assert.equal(core.pluralVotes(5, "kk"), "дауыс");
  assert.equal(core.pluralVotes(1, "en"), "vote");
  assert.equal(core.pluralVotes(2, "en"), "votes");
});

// Site Offer Validation Tests
test("validates a complete site_offer proposal", () => {
  const res = core.validateProposal(validSiteOffer);
  assert.equal(res.valid, true);
  assert.equal(res.value.sourceType, "site_offer");
  assert.equal(res.value.placeLabel, "ТРЦ Dostyk Plaza");
  assert.equal(res.value.representativeConfirmed, true);
  assert.equal(res.value.preferredChargerType, "ac_dc");
  assert.deepEqual(res.value.cooperationTypes, ["provide_site", "rent"]);
});

test("validates site_offer without optional email or authorComment", () => {
  const input = { ...validSiteOffer };
  delete input.contactEmail;
  delete input.authorComment;
  const res = core.validateProposal(input);
  assert.equal(res.valid, true);
  assert.equal(res.value.contactEmail, undefined);
  assert.equal(res.value.authorComment, undefined);
});

test("clears availablePower for site_offer if powerStatus is not 'available'", () => {
  const input = { ...validSiteOffer, powerStatus: "upgrade_possible", availablePower: "up_to_22" };
  const res = core.validateProposal(input);
  assert.equal(res.valid, true);
  assert.equal(res.value.powerStatus, "upgrade_possible");
  assert.equal(res.value.availablePower, undefined);
});

test("rejects site_offer with missing siteName and placeLabel", () => {
  const input = { ...validSiteOffer, siteName: "", placeLabel: "" };
  const res = core.validateProposal(input);
  assert.equal(res.valid, false);
  assert.equal(res.errors.placeLabel, "required");
});

test("rejects site_offer with missing or invalid siteRole", () => {
  const emptyRole = { ...validSiteOffer, siteRole: "" };
  assert.equal(core.validateProposal(emptyRole).errors.siteRole, "required");

  const invalidRole = { ...validSiteOffer, siteRole: "invalid_role" };
  assert.equal(core.validateProposal(invalidRole).errors.siteRole, "invalid");
});

test("rejects site_offer when representativeConfirmed is not true", () => {
  const input = { ...validSiteOffer, representativeConfirmed: false };
  const res = core.validateProposal(input);
  assert.equal(res.valid, false);
  assert.equal(res.errors.representativeConfirmed, "required");
});

test("rejects site_offer with invalid contactPhone", () => {
  const input = { ...validSiteOffer, contactPhone: "123" };
  const res = core.validateProposal(input);
  assert.equal(res.valid, false);
  assert.equal(res.errors.contactPhone, "invalid");
});

test("rejects site_offer with empty cooperationTypes", () => {
  const input = { ...validSiteOffer, cooperationTypes: [] };
  const res = core.validateProposal(input);
  assert.equal(res.valid, false);
  assert.equal(res.errors.cooperationTypes, "required");
});

test("filters map records with matches()", () => {
  assert.equal(core.matches(validDriverDemand, { locationType: "residential", chargerType: "ac" }), true);
  assert.equal(core.matches(validDriverDemand, { sourceType: "driver_demand" }), true);
  assert.equal(core.matches(validDriverDemand, { sourceType: "site_offer" }), false);
  assert.equal(core.matches(validDriverDemand, { sourceType: "all" }), true);

  assert.equal(core.matches(validSiteOffer, { sourceType: "site_offer" }), true);
  assert.equal(core.matches(validSiteOffer, { sourceType: "driver_demand" }), false);
  assert.equal(core.matches(validSiteOffer, { locationType: "mall" }), true);
  assert.equal(core.matches(validSiteOffer, { sourceType: "all" }), true);
});

test("has required auth translations in all supported languages", () => {
  const fs = require("node:fs");
  const vm = require("node:vm");
  const code = fs.readFileSync(require.resolve("../wanted/i18n.js"), "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  const msgs = sandbox.window.WANTED_MESSAGES;
  assert.ok(msgs.ru && msgs.kk && msgs.en);
  assert.equal(msgs.ru.signIn, "Войти");
  assert.equal(msgs.ru.signOut, "Выйти");
  assert.equal(msgs.kk.signIn, "Кіру");
  assert.equal(msgs.kk.signOut, "Шығу");
  assert.equal(msgs.en.signIn, "Sign in");
  assert.equal(msgs.en.signOut, "Sign out");
});

test("has all site_offer dictionary translations in RU, KK, EN", () => {
  const fs = require("node:fs");
  const vm = require("node:vm");
  const code = fs.readFileSync(require.resolve("../wanted/i18n.js"), "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  const msgs = sandbox.window.WANTED_MESSAGES;

  const requiredKeys = [
    "sourceTypeTitle",
    "driverDemandTitle",
    "siteOfferTitle",
    "filterAll",
    "filterDriverDemand",
    "filterSiteOffer",
    "badgeSiteOffer",
    "badgeDriverDemand",
    "siteOfferBanner",
    "siteRoles",
    "parkingSpaces",
    "siteAccesses",
    "powerStatuses",
    "availablePowers",
    "preferredChargers",
    "cooperationOptions",
    "locations",
    "nearbyVoteDemandTitle",
    "nearbyVerifySiteTitle",
    "nearbySupportOfferTitle",
    "nearbyMatchDemandTitle"
  ];

  for (const lang of ["ru", "kk", "en"]) {
    const dict = msgs[lang];
    assert.ok(dict, `Missing language dict: ${lang}`);
    for (const key of requiredKeys) {
      assert.ok(dict[key], `Missing key '${key}' in '${lang}' dictionary`);
    }

    // Verify enums completeness
    for (const role of core.SITE_ROLES) {
      assert.ok(dict.siteRoles[role], `Missing siteRole '${role}' in '${lang}'`);
    }
    for (const ps of core.PARKING_SPACES) {
      assert.ok(dict.parkingSpaces[ps], `Missing parkingSpaces '${ps}' in '${lang}'`);
    }
    for (const sa of core.SITE_ACCESS) {
      assert.ok(dict.siteAccesses[sa], `Missing siteAccess '${sa}' in '${lang}'`);
    }
    for (const pwr of core.POWER_STATUS) {
      assert.ok(dict.powerStatuses[pwr], `Missing powerStatus '${pwr}' in '${lang}'`);
    }
    for (const ap of core.AVAILABLE_POWER) {
      assert.ok(dict.availablePowers[ap], `Missing availablePower '${ap}' in '${lang}'`);
    }
    for (const pct of core.PREFERRED_CHARGER_TYPES) {
      assert.ok(dict.preferredChargers[pct], `Missing preferredCharger '${pct}' in '${lang}'`);
    }
    for (const ct of core.COOPERATION_TYPES) {
      assert.ok(dict.cooperationOptions[ct], `Missing cooperationOption '${ct}' in '${lang}'`);
    }
    for (const lt of core.LOCATION_TYPES) {
      assert.ok(dict.locations[lt], `Missing locationType '${lt}' in '${lang}'`);
    }
  }
});


