const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../wanted/core.js");

const validDriverDemand = {
  source_type: "driver_demand",
  location: { latitude: 43.2389, longitude: 76.8897 },
  place_label: "Двор на Абая",
  location_type: "residential",
  reason: "Ближайшая зарядка всегда занята",
  frequency: "daily",
  charger_type: "ac",
  connectors: ["Type 2"]
};

const validSiteOffer = {
  source_type: "site_offer",
  location: { latitude: 43.2389, longitude: 76.8897 },
  site_name: "ТРЦ Dostyk Plaza",
  place_label: "ТРЦ Dostyk Plaza",
  location_type: "mall",
  parking_spaces_available: "5_plus",
  site_access: "24_7",
  power_status: "available",
  available_power: "up_to_22",
  preferred_charger_type: "ac_dc",
  cooperation_types: ["provide_site", "rent"],
  contact_name: "Аскар Сыздыков",
  contact_phone: "+7 (777) 123-45-67",
  contact_email: "askar@example.com",
  site_role: "owner",
  representative_confirmed: true,
  author_comment: "Подземный паркинг, охрана 24/7"
};

test("validates a complete driver_demand proposal", () => {
  const res = core.validateProposal(validDriverDemand);
  assert.equal(res.valid, true);
  assert.equal(res.value.source_type, "driver_demand");
});

test("defaults sourceType to driver_demand when omitted", () => {
  const input = { ...validDriverDemand };
  delete input.source_type;
  const res = core.validateProposal(input);
  assert.equal(res.valid, true);
  assert.equal(res.value.source_type, "driver_demand");
});

test("validates a proposal without placeLabel for driver_demand", () => {
  const input = { ...validDriverDemand };
  delete input.place_label;
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
  assert.equal(res.value.source_type, "site_offer");
  assert.equal(res.value.place_label, "ТРЦ Dostyk Plaza");
  assert.equal(res.value.representative_confirmed, true);
  assert.equal(res.value.preferred_charger_type, "ac_dc");
  assert.deepEqual(res.value.cooperation_types, ["provide_site", "rent"]);
});

test("validates site_offer without optional email or authorComment", () => {
  const input = { ...validSiteOffer };
  delete input.contact_email;
  delete input.author_comment;
  const res = core.validateProposal(input);
  assert.equal(res.valid, true);
  assert.equal(res.value.contact_email, undefined);
  assert.equal(res.value.author_comment, undefined);
});

test("clears availablePower for site_offer if powerStatus is not 'available'", () => {
  const input = { ...validSiteOffer, power_status: "upgrade_possible", available_power: "up_to_22" };
  const res = core.validateProposal(input);
  assert.equal(res.valid, true);
  assert.equal(res.value.power_status, "upgrade_possible");
  assert.equal(res.value.available_power, undefined);
});

test("rejects site_offer with missing siteName and placeLabel", () => {
  const input = { ...validSiteOffer, site_name: "", place_label: "" };
  const res = core.validateProposal(input);
  assert.equal(res.valid, false);
  assert.equal(res.errors.place_label, "required");
});

test("rejects site_offer with missing or invalid siteRole", () => {
  const emptyRole = { ...validSiteOffer, site_role: "" };
  assert.equal(core.validateProposal(emptyRole).errors.site_role, "required");

  const invalidRole = { ...validSiteOffer, site_role: "invalid_role" };
  assert.equal(core.validateProposal(invalidRole).errors.site_role, "invalid");
});

test("rejects site_offer when representativeConfirmed is not true", () => {
  const input = { ...validSiteOffer, representative_confirmed: false };
  const res = core.validateProposal(input);
  assert.equal(res.valid, false);
  assert.equal(res.errors.representative_confirmed, "required");
});

test("rejects site_offer with invalid contactPhone", () => {
  const input = { ...validSiteOffer, contact_phone: "123" };
  const res = core.validateProposal(input);
  assert.equal(res.valid, false);
  assert.equal(res.errors.contact_phone, "invalid");
});

test("rejects site_offer with empty cooperationTypes", () => {
  const input = { ...validSiteOffer, cooperation_types: [] };
  const res = core.validateProposal(input);
  assert.equal(res.valid, false);
  assert.equal(res.errors.cooperation_types, "required");
});

test("filters map records with matches()", () => {
  assert.equal(core.matches(validDriverDemand, { location_type: "residential", charger_type: "ac" }), true);
  assert.equal(core.matches(validDriverDemand, { source_type: "driver_demand" }), true);
  assert.equal(core.matches(validDriverDemand, { source_type: "site_offer" }), false);
  assert.equal(core.matches(validDriverDemand, { source_type: "all" }), true);

  assert.equal(core.matches(validSiteOffer, { source_type: "site_offer" }), true);
  assert.equal(core.matches(validSiteOffer, { source_type: "driver_demand" }), false);
  assert.equal(core.matches(validSiteOffer, { location_type: "mall" }), true);
  assert.equal(core.matches(validSiteOffer, { source_type: "all" }), true);
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

test("debounces rapid consecutive calls into a single execution", async () => {
  let callCount = 0;
  let lastArg = null;
  const fn = (val) => {
    callCount++;
    lastArg = val;
  };

  const debounced = core.debounce(fn, 50);
  debounced(1);
  debounced(2);
  debounced(3);

  assert.equal(callCount, 0);

  await new Promise((resolve) => setTimeout(resolve, 80));

  assert.equal(callCount, 1);
  assert.equal(lastArg, 3);
});

test("supports cancelling debounced call", async () => {
  let callCount = 0;
  const debounced = core.debounce(() => {
    callCount++;
  }, 50);

  debounced();
  debounced.cancel();

  await new Promise((resolve) => setTimeout(resolve, 80));

  assert.equal(callCount, 0);
});


