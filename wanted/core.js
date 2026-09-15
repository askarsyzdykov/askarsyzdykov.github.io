(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.WantedCore = api;
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var SOURCE_TYPES = ["driver_demand", "site_offer"];
  var LOCATION_TYPES = [
    "residential",
    "office",
    "mall",
    "retail",
    "restaurant",
    "hotel",
    "gas_station",
    "parking",
    "roadside",
    "service_center",
    "public_parking",
    "hotel_tourism",
    "highway",
    "other"
  ];
  var SITE_ROLES = [
    "owner",
    "tenant",
    "management_company",
    "business_representative",
    "government_representative",
    "other"
  ];
  var PARKING_SPACES = ["1", "2", "3_4", "5_plus", "unknown"];
  var SITE_ACCESS = ["24_7", "business_hours", "restricted", "other"];
  var POWER_STATUS = ["available", "upgrade_possible", "probably_insufficient", "unknown"];
  var AVAILABLE_POWER = ["up_to_22", "22_50", "50_100", "100_200", "200_plus", "unknown"];
  var PREFERRED_CHARGER_TYPES = ["ac", "dc", "ac_dc", "unknown"];
  var COOPERATION_TYPES = [
    "provide_site",
    "rent",
    "revenue_share",
    "co_invest",
    "own_investment",
    "discuss"
  ];
  var FREQUENCIES = ["unspecified", "daily", "several_weekly", "several_monthly", "trips"];
  var CHARGER_TYPES = ["ac", "dc", "unknown"];
  var STATUSES = [
    "collecting_votes",
    "sent_to_operators",
    "under_review",
    "planned",
    "installed",
    "rejected",
    "archived"
  ];

  function asNumber(value) {
    var n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function clean(value, max) {
    return String(value == null ? "" : value)
      .replace(/[\u0000-\u001f<>]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, max);
  }

  function validCoordinate(lat, lng) {
    return lat >= 40.5 && lat <= 55.5 && lng >= 46 && lng <= 88.5;
  }

  function validPhone(phone) {
    var digits = String(phone || "").replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  }

  function validEmail(email) {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateProposal(input) {
    input = input || {};
    var location = input.location || {};
    var sourceType = clean(input.sourceType, 30);
    if (!sourceType || SOURCE_TYPES.indexOf(sourceType) < 0) {
      sourceType = "driver_demand";
    }

    var errors = {};
    var lat = asNumber(location.latitude);
    var lng = asNumber(location.longitude);

    if (lat === null || lng === null || !validCoordinate(lat, lng)) {
      errors.coordinates = "invalid";
    }

    var placeLabel = clean(input.placeLabel, 160);
    if (placeLabel && placeLabel.length < 2) {
      errors.placeLabel = "invalid";
    }

    var locationType = clean(input.locationType, 30);
    if (LOCATION_TYPES.indexOf(locationType) < 0) {
      errors.locationType = "invalid";
    }

    if (sourceType === "site_offer") {
      var siteName = clean(input.siteName || input.placeLabel, 160);
      if (!siteName || siteName.length < 2) {
        errors.siteName = "required";
        errors.placeLabel = "required";
      }

      var siteRole = clean(input.siteRole, 40);
      if (!siteRole) {
        errors.siteRole = "required";
      } else if (SITE_ROLES.indexOf(siteRole) < 0) {
        errors.siteRole = "invalid";
      }

      var representativeConfirmed = Boolean(input.representativeConfirmed);
      if (representativeConfirmed !== true) {
        errors.representativeConfirmed = "required";
      }

      var parkingSpacesAvailable = clean(input.parkingSpacesAvailable || input.parkingSpaces, 20);
      if (!parkingSpacesAvailable) {
        errors.parkingSpacesAvailable = "required";
      } else if (PARKING_SPACES.indexOf(parkingSpacesAvailable) < 0) {
        errors.parkingSpacesAvailable = "invalid";
      }

      var siteAccess = clean(input.siteAccess, 30);
      if (!siteAccess) {
        errors.siteAccess = "required";
      } else if (SITE_ACCESS.indexOf(siteAccess) < 0) {
        errors.siteAccess = "invalid";
      }

      var powerStatus = clean(input.powerStatus, 30);
      if (!powerStatus) {
        errors.powerStatus = "required";
      } else if (POWER_STATUS.indexOf(powerStatus) < 0) {
        errors.powerStatus = "invalid";
      }

      var availablePower;
      if (powerStatus === "available") {
        var rawPower = clean(input.availablePower, 30);
        if (rawPower && AVAILABLE_POWER.indexOf(rawPower) >= 0) {
          availablePower = rawPower;
        } else if (rawPower) {
          errors.availablePower = "invalid";
        }
      }

      var preferredChargerType = clean(input.preferredChargerType, 20);
      if (!preferredChargerType && Array.isArray(input.preferredChargerTypes) && input.preferredChargerTypes.length > 0) {
        preferredChargerType = clean(input.preferredChargerTypes[0], 20);
      }
      if (!preferredChargerType) {
        preferredChargerType = "unknown";
      }
      if (PREFERRED_CHARGER_TYPES.indexOf(preferredChargerType) < 0) {
        errors.preferredChargerType = "invalid";
      }

      var rawCoop = Array.isArray(input.cooperationTypes) ? input.cooperationTypes : [];
      var cooperationTypes = rawCoop
        .map(function (x) { return clean(x, 40); })
        .filter(function (x) { return COOPERATION_TYPES.indexOf(x) >= 0; });
      if (cooperationTypes.length === 0) {
        errors.cooperationTypes = "required";
      }

      var contactName = clean(input.contactName, 120);
      if (!contactName || contactName.length < 2) {
        errors.contactName = "required";
      }

      var contactPhone = clean(input.contactPhone, 50);
      if (!contactPhone) {
        errors.contactPhone = "required";
      } else if (!validPhone(contactPhone)) {
        errors.contactPhone = "invalid";
      }

      var contactEmail = clean(input.contactEmail, 120);
      if (contactEmail && !validEmail(contactEmail)) {
        errors.contactEmail = "invalid";
      }

      var authorCommentSite = clean(input.authorComment, 1000);

      var siteValue = {
        sourceType: "site_offer",
        location: { latitude: lat, longitude: lng },
        placeLabel: placeLabel,
        locationType: locationType,
        siteName: siteName,
        siteRole: siteRole,
        representativeConfirmed: representativeConfirmed,
        parkingSpacesAvailable: parkingSpacesAvailable,
        siteAccess: siteAccess,
        powerStatus: powerStatus,
        preferredChargerType: preferredChargerType,
        cooperationTypes: cooperationTypes,
        contactName: contactName,
        contactPhone: contactPhone
      };

      if (availablePower) {
        siteValue.availablePower = availablePower;
      }
      if (contactEmail) {
        siteValue.contactEmail = contactEmail;
      }
      if (authorCommentSite) {
        siteValue.authorComment = authorCommentSite;
      }

      return {
        valid: Object.keys(errors).length === 0,
        errors: errors,
        value: siteValue
      };
    }

    // driver_demand flow
    var reason = clean(input.reason, 500);
    if (!reason || reason.length < 2) {
      errors.reason = "required";
    }

    var frequency = clean(input.frequency || "unspecified", 30);
    if (FREQUENCIES.indexOf(frequency) < 0) {
      errors.frequency = "invalid";
    }

    var chargerType = clean(input.chargerType, 20);
    if (CHARGER_TYPES.indexOf(chargerType) < 0) {
      errors.chargerType = "invalid";
    }

    var connectors = Array.isArray(input.connectors)
      ? input.connectors.map(function (x) { return clean(x, 24); }).filter(Boolean).slice(0, 8)
      : [];

    var authorComment = clean(input.authorComment, 1000);
    var authorName = clean(input.authorName, 120);

    var driverValue = {
      sourceType: "driver_demand",
      location: { latitude: lat, longitude: lng },
      placeLabel: placeLabel,
      locationType: locationType,
      reason: reason,
      frequency: frequency,
      chargerType: chargerType,
      connectors: connectors,
      authorComment: authorComment,
      authorName: authorName
    };

    return {
      valid: Object.keys(errors).length === 0,
      errors: errors,
      value: driverValue
    };
  }

  function distanceMeters(a, b) {
    var rad = Math.PI / 180;
    var p1 = a.location.latitude * rad;
    var p2 = b.location.latitude * rad;
    var dp = (b.location.latitude - a.location.latitude) * rad;
    var dl = (b.location.longitude - a.location.longitude) * rad;
    var h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    return 12742000 * Math.asin(Math.sqrt(h));
  }

  function nearby(items, point, radius) {
    return items
      .filter(function (item) {
        return !["archived", "rejected"].includes(item.status) && distanceMeters(item, point) <= (radius || 300);
      })
      .sort(function (a, b) {
        return distanceMeters(a, point) - distanceMeters(b, point);
      });
  }

  function inBounds(item, bounds) {
    return !bounds || (
      item.location.latitude >= bounds.south &&
      item.location.latitude <= bounds.north &&
      item.location.longitude >= bounds.west &&
      item.location.longitude <= bounds.east
    );
  }

  function matches(item, filters) {
    var itemSource = item.sourceType || "driver_demand";
    var sourceOk = !filters.sourceType || filters.sourceType === "all" || itemSource === filters.sourceType;
    return sourceOk &&
      (!filters.status || item.status === filters.status) &&
      (!filters.locationType || item.locationType === filters.locationType) &&
      (!filters.chargerType || item.chargerType === filters.chargerType);
  }

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

  function debounce(fn, wait) {
    var timeout = null;
    var debounced = function () {
      var context = this;
      var args = arguments;
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(function () {
        timeout = null;
        fn.apply(context, args);
      }, wait != null ? wait : 300);
    };
    debounced.cancel = function () {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    };
    return debounced;
  }

  return {
    SOURCE_TYPES: SOURCE_TYPES,
    LOCATION_TYPES: LOCATION_TYPES,
    SITE_ROLES: SITE_ROLES,
    PARKING_SPACES: PARKING_SPACES,
    SITE_ACCESS: SITE_ACCESS,
    POWER_STATUS: POWER_STATUS,
    AVAILABLE_POWER: AVAILABLE_POWER,
    PREFERRED_CHARGER_TYPES: PREFERRED_CHARGER_TYPES,
    COOPERATION_TYPES: COOPERATION_TYPES,
    FREQUENCIES: FREQUENCIES,
    CHARGER_TYPES: CHARGER_TYPES,
    STATUSES: STATUSES,
    clean: clean,
    validCoordinate: validCoordinate,
    validPhone: validPhone,
    validEmail: validEmail,
    validateProposal: validateProposal,
    distanceMeters: distanceMeters,
    nearby: nearby,
    inBounds: inBounds,
    matches: matches,
    pluralVotes: pluralVotes,
    debounce: debounce
  };
}));
