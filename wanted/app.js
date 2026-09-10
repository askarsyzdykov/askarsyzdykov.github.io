(function () {
  "use strict";

  var root = document.getElementById("wanted-app");
  var params = new URLSearchParams(location.search);
  var lang = (params.get("lang") || localStorage.getItem("evpoint-lang") || navigator.language || "ru").slice(0, 2).toLowerCase();
  if (lang === "kz") lang = "kk";
  if (!WANTED_MESSAGES[lang]) lang = "ru";

  var t = WANTED_MESSAGES[lang];
  var connectorTypes = ["GB/T", "CCS 2", "CHAdeMO", "NACS"];
  var googleMapsPromise;
  var STORAGE_KEY_MAP_STATE = "evpoint_wanted_map_state";
  var savedMapState = null;
  document.documentElement.lang = lang;

  function loadSavedMapState() {
    if (savedMapState && Number.isFinite(savedMapState.lat) && Number.isFinite(savedMapState.lng) && Number.isFinite(savedMapState.zoom)) {
      return savedMapState;
    }
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY_MAP_STATE);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && Number.isFinite(parsed.lat) && Number.isFinite(parsed.lng) && Number.isFinite(parsed.zoom)) {
          savedMapState = { lat: parsed.lat, lng: parsed.lng, zoom: parsed.zoom };
          return savedMapState;
        }
      }
    } catch (e) {}
    return null;
  }

  function saveMapState(lat, lng, zoom) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(zoom)) return;
    savedMapState = { lat: lat, lng: lng, zoom: zoom };
    try {
      sessionStorage.setItem(STORAGE_KEY_MAP_STATE, JSON.stringify(savedMapState));
    } catch (e) {}
  }

  var STORAGE_KEY_MY_PROPOSALS = "evpoint_wanted_my_proposals";
  function getMyProposalIds() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY_MY_PROPOSALS);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  }

  function saveMyProposalId(id) {
    if (!id) return;
    try {
      var list = getMyProposalIds();
      if (list.indexOf(id) === -1) {
        list.push(id);
        localStorage.setItem(STORAGE_KEY_MY_PROPOSALS, JSON.stringify(list));
      }
    } catch (e) {}
  }

  var currentSessionUser = null;
  WantedApi.session().then(function (session) {
    if (session && session.user) currentSessionUser = session.user;
  }).catch(function () {});

  function checkIsAuthor(item, user) {
    if (!item) return false;
    if (item.viewerIsAuthor || item.isAuthor) return true;
    var myIds = getMyProposalIds();
    if (item.id && myIds.indexOf(item.id) !== -1) return true;
    var u = user || currentSessionUser;
    if (u && u.id) {
      if (item.userId && item.userId === u.id) return true;
      if (item.authorId && item.authorId === u.id) return true;
    }
    return false;
  }

  function pluralVotes(count) {
    if (window.WantedCore && WantedCore.pluralVotes) {
      return WantedCore.pluralVotes(count, lang);
    }
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

  function getProposalShareData(item) {
    var votes = pluralVotes(item.votesCount);
    var title = item.placeLabel + " — " + item.votesCount + " " + votes + " | evPoint.kz";
    var text = item.placeLabel + " · " + item.votesCount + " " + votes + (item.reason ? ". " + item.reason : "");
    var url = location.origin + "/wanted/" + encodeURIComponent(item.id);
    return { title: title, text: text, url: url };
  }

  function shareProposal(item) {
    track("wanted_share", { proposal_id: item.id });
    var shareData = getProposalShareData(item);
    if (navigator.share) {
      navigator.share(shareData).catch(function () {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareData.url).then(function () {
        alert(t.shared);
      }).catch(function () {
        prompt(t.share, shareData.url);
      });
    } else {
      prompt(t.share, shareData.url);
    }
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function track(name, data) {
    if (typeof window.gtag === "function") window.gtag("event", name, data || {});
  }

  function languages() {
    return '<div class="languages" aria-label="Language">' +
      '<button data-lang="kk">ҚАЗ</button><button data-lang="ru">РУС</button><button data-lang="en">ENG</button></div>';
  }

  function header(back) {
    var left = back
      ? '<a class="back-link" href="/wanted/">← ' + t.back + "</a>"
      : '<a class="brand" href="/"><img class="brand-logo" src="/images/evpoint_logo.svg" alt="evPoint.kz" width="32" height="32">evPoint.kz</a>';
    return '<header class="topbar">' + left + '<div class="top-actions">' +
      languages() + "</div></header>";
  }

  function bindLanguages() {
    root.querySelectorAll("[data-lang]").forEach(function (button) {
      if (button.dataset.lang === lang) button.classList.add("active");
      button.onclick = function () {
        localStorage.setItem("evpoint-lang", button.dataset.lang);
        var url = new URL(location.href);
        url.searchParams.set("lang", button.dataset.lang);
        location.href = url;
      };
    });
  }

  function option(value, label) {
    return '<option value="' + value + '">' + label + "</option>";
  }

  function choice(name, value, label, selected) {
    return '<label class="choice"><input type="radio" name="' + name + '" value="' + value + '" ' +
      (selected ? "checked" : "") + "><span>" + label + "</span></label>";
  }

  function multiChoice(name, value, label) {
    return '<label class="choice"><input type="checkbox" name="' + name + '" value="' + value +
      '"><span>' + label + "</span></label>";
  }

  function loadGoogleMaps() {
    if (window.google && window.google.maps) return Promise.resolve(window.google.maps);
    if (googleMapsPromise) return googleMapsPromise;

    var config = window.EVPOINT_WANTED_CONFIG || {};
    var key = String(config.googleMapsApiKey || "").trim();
    if (!key || key.indexOf("PASTE_") === 0) {
      return Promise.reject(new Error("missing_google_maps_key"));
    }

    googleMapsPromise = new Promise(function (resolve, reject) {
      var callbackName = "__evpointGoogleMapsReady";
      var script = document.createElement("script");
      window[callbackName] = function () {
        delete window[callbackName];
        resolve(window.google.maps);
      };
      script.async = true;
      script.onerror = function () {
        delete window[callbackName];
        reject(new Error("google_maps_load_failed"));
      };
      script.src = "https://maps.googleapis.com/maps/api/js?" + new URLSearchParams({
        key: key,
        loading: "async",
        callback: callbackName,
        v: "weekly",
        language: lang,
        region: "KZ",
        auth_referrer_policy: "origin"
      });
      document.head.appendChild(script);
    });

    return googleMapsPromise;
  }

  function showMapError(element, error) {
    var missing = error && error.message === "missing_google_maps_key";
    element.innerHTML = '<div class="map-error"><strong>' +
      (missing ? t.mapKeyMissing : t.mapUnavailable) +
      '</strong><span>' + (missing ? "wanted/config.js" : "") + "</span></div>";
  }

  function createMap(id, center, zoom, ready) {
    var element = document.getElementById(id);
    element.innerHTML = '<div class="map-loading">' + t.loading + "</div>";

    loadGoogleMaps().then(function () {
      element.innerHTML = "";
      var map = new google.maps.Map(element, {
        center: { lat: center[0], lng: center[1] },
        zoom: zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        gestureHandling: "greedy"
      });
      ready(map);
    }).catch(function (error) {
      showMapError(element, error);
    });
  }

  function addLocationControl(map, onLocate) {
    if (!window.google || !google.maps || !google.maps.ControlPosition) return;
    var controlDiv = document.createElement("div");
    controlDiv.className = "gm-location-control";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gm-location-btn";
    btn.title = t.useLocation;
    btn.setAttribute("aria-label", t.useLocation);
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#666" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>';
    btn.onclick = function (e) {
      e.preventDefault();
      onLocate(btn);
    };
    controlDiv.appendChild(btn);
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
    return btn;
  }

  function markerOptions(item, map) {
    var markerSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">' +
      '<circle cx="22" cy="22" r="10" fill="#EA6035" stroke="#ffffff" stroke-width="3"/>' +
      "</svg>";

    return {
      map: map,
      position: { lat: item.latitude, lng: item.longitude },
      title: item.placeLabel || t.placeStep,
      icon: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(markerSvg),
        scaledSize: new google.maps.Size(44, 44),
        anchor: new google.maps.Point(22, 22)
      }
    };
  }

  function pinMarkerOptions(position, map, draggable) {
    return {
      map: map,
      position: position,
      draggable: Boolean(draggable),
      zIndex: 1000,
      title: t.placeStep,
      icon: {
        url: "/wanted/marker-pin.png",
        scaledSize: new google.maps.Size(34, 45),
        anchor: new google.maps.Point(17, 45)
      }
    };
  }

  function createUserLocationMarker(map) {
    var userLocationSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">' +
      '<circle cx="18" cy="18" r="16" fill="#007aff" fill-opacity="0.22"/>' +
      '<circle cx="18" cy="18" r="8" fill="#007aff" stroke="#ffffff" stroke-width="2.5"/>' +
      '</svg>';

    return new google.maps.Marker({
      map: map,
      visible: false,
      clickable: false,
      zIndex: 500,
      icon: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(userLocationSvg),
        scaledSize: new google.maps.Size(36, 36),
        anchor: new google.maps.Point(18, 18)
      }
    });
  }

  function statusPill(status) {
    return '<span class="status status-' + status + '">' + esc(t.statuses[status] || status) + "</span>";
  }

  function card(item) {
    var chargerLabel = (item.chargerType && item.chargerType !== "unknown" && (t.chargers[item.chargerType] || item.chargerType)) ? (t.chargers[item.chargerType] || item.chargerType) : "";
    var placeInfo = esc(t.locations[item.locationType] || item.locationType) + (chargerLabel ? " · " + esc(chargerLabel) : "");
    return '<article class="proposal-card"><div class="card-top">' + statusPill(item.status) +
      "<strong>" + item.votesCount + " " + esc(pluralVotes(item.votesCount)) + "</strong></div><h3>" +
      esc(item.placeLabel) + "</h3><p>" + placeInfo + '</p><a href="/wanted/' +
      encodeURIComponent(item.id) + '">' + t.open + " →</a></article>";
  }

  function sheetCard(item) {
    var isAuthor = checkIsAuthor(item, currentSessionUser);
    var hasVoted = Boolean(item.viewerHasVoted || isAuthor);
    var chevronSvg = '<svg class="sheet-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
    var shareSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>';
    var chargerLabel = (item.chargerType && item.chargerType !== "unknown" && (t.chargers[item.chargerType] || item.chargerType)) ? (t.chargers[item.chargerType] || item.chargerType) : "";
    var placeInfo = esc(t.locations[item.locationType] || item.locationType) + (chargerLabel ? " · " + esc(chargerLabel) : "");
    var voteBtnText = isAuthor ? ("✓ " + t.youAuthor) : (hasVoted ? ("✓ " + t.supported) : (t.addVote || t.support));
    var voteBtnClass = "sheet-vote-btn" + (hasVoted ? " voted" : "") + (isAuthor ? " is-author" : "");
    var voteBtnAttr = isAuthor ? ' disabled title="' + esc(t.cantRemoveAuthorVote) + '"' : '';

    return '<article class="sheet-proposal">' +
      '<h3><a class="sheet-title-link" href="/wanted/' + encodeURIComponent(item.id) + '">' +
      '<span>' + esc(item.placeLabel) + '</span>' + chevronSvg + '</a></h3>' +
      '<p class="sheet-place-info">' + placeInfo + '</p>' +
      '<div class="sheet-vote-row">' +
      '<div class="sheet-vote-count">' +
      '<strong class="sheet-votes-num">' + item.votesCount + '</strong> ' +
      '<span class="sheet-votes-label">' + esc(pluralVotes(item.votesCount)) + '</span>' +
      '</div>' +
      '<button type="button" class="' + voteBtnClass + '" id="sheet-vote-btn"' + voteBtnAttr + '>' +
      voteBtnText +
      '</button>' +
      '<button type="button" class="sheet-share-btn" id="sheet-share-btn" aria-label="' + t.share + '" title="' + t.share + '">' +
      shareSvg +
      '</button>' +
      '</div>' +
      '</article>';
  }

  function isAppleDevice() {
    var ua = navigator.userAgent || "";
    var platform = navigator.platform || "";
    var isIOS = /iPad|iPhone|iPod/.test(ua) || (platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var isMac = /Macintosh|MacIntel|MacPPC|Mac68K/.test(platform) || /Mac OS X/.test(ua);
    return isIOS || isMac;
  }

  function openAuthSheet(onSuccess, onCancel) {
    var existing = document.getElementById("auth-sheet");
    if (existing) existing.remove();

    var isApple = isAppleDevice();
    var closeSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    var sheetHtml = '<section id="auth-sheet" class="marker-sheet" role="dialog" aria-modal="true" aria-label="' + t.authSheetTitle + '">' +
      '<button class="sheet-backdrop" type="button" aria-label="' + t.close + '"></button>' +
      '<div class="sheet-panel">' +
      '<div class="sheet-handle" aria-hidden="true"></div>' +
      '<button class="sheet-close" type="button" aria-label="' + t.close + '">' + closeSvg + '</button>' +
      '<div class="auth-sheet-content">' +
      '<h3>' + t.authSheetTitle + '</h3>' +
      '<p>' + t.authSheetSubtitle + '</p>' +
      '<div class="auth-buttons">' +
      (isApple ? '<button type="button" class="social-btn social-btn-apple" id="auth-apple">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>' +
        '<span>' + t.signInApple + '</span></button>' : '') +
      '<button type="button" class="social-btn social-btn-google" id="auth-google">' +
      '<svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>' +
      '<span>' + t.signInGoogle + '</span></button>' +
      '</div>' +
      '<div id="auth-sheet-error" class="error-box" hidden></div>' +
      '</div>' +
      '</div></section>';

    document.body.insertAdjacentHTML("beforeend", sheetHtml);
    var sheet = document.getElementById("auth-sheet");
    var closeBtn = sheet.querySelector(".sheet-close");
    var backdrop = sheet.querySelector(".sheet-backdrop");
    var errorBox = document.getElementById("auth-sheet-error");

    function close(isCancelled) {
      sheet.classList.remove("is-open");
      setTimeout(function () {
        sheet.remove();
        if (isCancelled && typeof onCancel === "function") onCancel();
      }, 250);
    }

    closeBtn.onclick = function () { close(true); };
    backdrop.onclick = function () { close(true); };

    function handleAuth(provider) {
      var promise = provider === "apple" ? WantedApi.signInWithApple() : WantedApi.signInWithGoogle();
      promise.then(function (session) {
        close(false);
        if (typeof onSuccess === "function") onSuccess(session);
      }).catch(function (error) {
        if (errorBox) {
          var msg = error && error.message ? error.message : t.authUnavailable;
          if (error && error.code === "auth/unauthorized-domain") {
            msg = "Домен не разрешен в Firebase Console -> Authentication -> Settings -> Authorized domains";
          } else if (error && error.code === "auth/popup-blocked") {
            msg = "Всплывающее окно заблокировано браузером. Пожалуйста, разрешите всплывающие окна.";
          }
          errorBox.textContent = msg;
          errorBox.hidden = false;
        }
      });
    }

    var googleBtn = document.getElementById("auth-google");
    if (googleBtn) googleBtn.onclick = function () { handleAuth("google"); };

    var appleBtn = document.getElementById("auth-apple");
    if (appleBtn) appleBtn.onclick = function () { handleAuth("apple"); };

    requestAnimationFrame(function () {
      sheet.classList.add("is-open");
    });
  }

  function authGate(next) {
    WantedApi.session().then(function (session) {
      if (session && session.user) return next(session);
      openAuthSheet(next, function () {
        navigate("/wanted/");
      });
    }).catch(function () {
      openAuthSheet(next, function () {
        navigate("/wanted/");
      });
    });
  }

  function ensureAuth(next) {
    WantedApi.session().then(function (session) {
      if (session && session.user) return next(session);
      openAuthSheet(next);
    }).catch(function () {
      openAuthSheet(next);
    });
  }

  function renderList() {
    var closeSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    root.innerHTML = '<main class="map-page">' + header(false) +
      '<section class="map-intro"><div><h1>' + t.title +
      "</h1><p>" + t.subtitle + '</p></div><a class="primary cta" href="/wanted/new" id="propose">' +
      t.propose + '</a></section><section class="map-layout"><div id="wanted-map" class="big-map" aria-label="' +
      t.map + '"></div><aside id="results" class="results"><p class="loading">' +
      t.loading + '</p></aside></section><section id="marker-sheet" class="marker-sheet" role="dialog" aria-modal="true" aria-label="' +
      t.open + '" hidden><button class="sheet-backdrop" type="button" aria-label="' + t.close +
      '"></button><div class="sheet-panel"><div class="sheet-handle" aria-hidden="true"></div>' +
      '<button class="sheet-close" type="button" aria-label="' + t.close + '">' + closeSvg + '</button>' +
      '<div id="marker-sheet-content"></div></div></section></main>';

    bindLanguages();
    track("wanted_map_open");
    function handlePropose(event) {
      if (event) event.preventDefault();
      track("wanted_create_start");
      WantedApi.session().then(function (session) {
        if (session && session.user) {
          navigate("/wanted/new");
        } else {
          openAuthSheet(function () {
            navigate("/wanted/new");
          });
        }
      }).catch(function () {
        openAuthSheet(function () {
          navigate("/wanted/new");
        });
      });
    }

    var proposeBtn = document.getElementById("propose");
    if (proposeBtn) proposeBtn.onclick = handlePropose;

    var resultsEl = document.getElementById("results");
    if (resultsEl) {
      resultsEl.addEventListener("click", function (event) {
        var btn = event.target.closest(".empty-add-btn");
        if (btn) {
          handlePropose(event);
        }
      });
    }

    var sheet = document.getElementById("marker-sheet");
    var sheetContent = document.getElementById("marker-sheet-content");
    var sheetClose = sheet.querySelector(".sheet-close");
    var sheetCloseTimeout = null;

    function closeSheet() {
      sheet.classList.remove("is-open");
      clearTimeout(sheetCloseTimeout);
      sheetCloseTimeout = setTimeout(function () {
        if (!sheet.classList.contains("is-open")) {
          sheet.hidden = true;
        }
      }, 250);
    }

    function showSheet(item) {
      clearTimeout(sheetCloseTimeout);
      sheetContent.innerHTML = sheetCard(item);
      sheet.hidden = false;
      void sheet.offsetWidth;
      requestAnimationFrame(function () { sheet.classList.add("is-open"); });
      sheetClose.focus({ preventScroll: true });

      var voteBtn = document.getElementById("sheet-vote-btn");
      if (voteBtn) {
        voteBtn.onclick = function (e) {
          e.preventDefault();
          if (checkIsAuthor(item, currentSessionUser)) return;
          ensureAuth(function (session) {
            if (session && session.user) currentSessionUser = session.user;
            if (checkIsAuthor(item, currentSessionUser)) {
              item.viewerHasVoted = true;
              voteBtn.textContent = "✓ " + t.youAuthor;
              voteBtn.classList.add("voted", "is-author");
              voteBtn.disabled = true;
              voteBtn.title = t.cantRemoveAuthorVote;
              return;
            }
            var target = !item.viewerHasVoted;
            voteBtn.disabled = true;
            WantedApi.vote(item.id, target).then(function (updated) {
              item.votesCount = updated.votesCount;
              item.viewerHasVoted = updated.viewerHasVoted;
              var inList = items.find(function (x) { return x.id === item.id; });
              if (inList) {
                inList.votesCount = updated.votesCount;
                inList.viewerHasVoted = updated.viewerHasVoted;
                draw();
              }
              var countEl = sheetContent.querySelector(".sheet-votes-num");
              var labelEl = sheetContent.querySelector(".sheet-votes-label");
              if (countEl) countEl.textContent = item.votesCount;
              if (labelEl) labelEl.textContent = pluralVotes(item.votesCount);
              voteBtn.textContent = item.viewerHasVoted ? "✓ " + t.supported : (t.addVote || t.support);
              voteBtn.classList.toggle("voted", item.viewerHasVoted);
              voteBtn.disabled = false;
              track(item.viewerHasVoted ? "wanted_vote" : "wanted_vote_cancel", { proposal_id: item.id });
            }).catch(function (err) {
              voteBtn.disabled = false;
              console.warn("Vote error:", err);
            });
          });
        };

        WantedApi.getVote(item.id).then(function (res) {
          if (res) {
            if (res.isAuthor || res.viewerIsAuthor) item.viewerIsAuthor = true;
            var isAuthor = checkIsAuthor(item, currentSessionUser);
            if (isAuthor) {
              item.viewerHasVoted = true;
              voteBtn.textContent = "✓ " + t.youAuthor;
              voteBtn.classList.add("voted", "is-author");
              voteBtn.disabled = true;
              voteBtn.title = t.cantRemoveAuthorVote;
            } else if (res.voted != null || res.viewerHasVoted != null || res.hasVoted != null) {
              var hasVoted = Boolean(res.voted || res.viewerHasVoted || res.hasVoted);
              item.viewerHasVoted = hasVoted;
              voteBtn.textContent = hasVoted ? "✓ " + t.supported : (t.addVote || t.support);
              voteBtn.classList.toggle("voted", hasVoted);
            }
          }
        }).catch(function () {});
      }

      var shareBtn = document.getElementById("sheet-share-btn");
      if (shareBtn) {
        shareBtn.onclick = function (e) {
          e.preventDefault();
          shareProposal(item);
        };
      }
    }

    sheetClose.onclick = closeSheet;
    sheet.querySelector(".sheet-backdrop").onclick = closeSheet;
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !sheet.hidden) closeSheet();
    });

    var map = null;
    var userMarker = null;
    var cluster = null;
    var markers = [];
    var items = [];
    var requestNumber = 0;

    function updateMainLocation(lat, lng) {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      if (userMarker) {
        userMarker.setPosition({ lat: lat, lng: lng });
        userMarker.setVisible(true);
      }
    }

    function clearMarkers() {
      if (cluster && typeof cluster.clearMarkers === "function") {
        cluster.clearMarkers();
      }
      markers.forEach(function (marker) { marker.setMap(null); });
      markers = [];
    }

    function draw() {
      clearMarkers();

      if (map) {
        var hasClusterer = Boolean(window.markerClusterer && window.markerClusterer.MarkerClusterer);
        items.forEach(function (item) {
          var opts = markerOptions(item, hasClusterer ? null : map);
          var marker = new google.maps.Marker(opts);
          marker.addListener("click", function () {
            document.getElementById("results").innerHTML = card(item);
            showSheet(item);
          });
          markers.push(marker);
        });

        if (hasClusterer) {
          if (!cluster) {
            cluster = new window.markerClusterer.MarkerClusterer({ map: map, markers: markers });
          } else {
            cluster.addMarkers(markers);
          }
        }
      }

      document.getElementById("results").innerHTML = items.length
        ? items.slice().sort(function (a, b) { return b.votesCount - a.votesCount; }).slice(0, 8).map(card).join("")
        : '<div class="empty"><button type="button" class="empty-add-btn" aria-label="' + esc(t.propose) + '">＋</button><p>' + esc(t.empty) + "</p></div>";
    }

    function boundsForRequest() {
      if (!map || !map.getBounds()) return null;
      var bounds = map.getBounds();
      return {
        south: bounds.getSouthWest().lat(),
        north: bounds.getNorthEast().lat(),
        west: bounds.getSouthWest().lng(),
        east: bounds.getNorthEast().lng()
      };
    }

    function load() {
      var number = ++requestNumber;
      WantedApi.list(boundsForRequest(), {}).then(function (response) {
        if (number !== requestNumber) return;
        items = response.items;
        draw();
      }).catch(function () {
        document.getElementById("results").innerHTML = '<p class="error-box">' + t.loadError + "</p>";
      });
    }

    WantedApi.list(null, {}).then(function (response) {
      items = response.items;
      draw();
    });

    var initialSavedState = loadSavedMapState();
    var defaultCenter = initialSavedState ? [initialSavedState.lat, initialSavedState.lng] : [48.1, 67.7];
    var defaultZoom = initialSavedState ? initialSavedState.zoom : 5;

    createMap("wanted-map", defaultCenter, defaultZoom, function (createdMap) {
      map = createdMap;
      userMarker = createUserLocationMarker(map);
      if (!initialSavedState) {
        map.fitBounds({ south: 40.5, west: 46, north: 55.5, east: 88.5 }, 40);
      }

      function updateSavedMapPos() {
        if (!map) return;
        var c = map.getCenter();
        var z = map.getZoom();
        if (c && Number.isFinite(z)) {
          saveMapState(c.lat(), c.lng(), z);
        }
      }

      map.addListener("idle", function () {
        updateSavedMapPos();
        load();
      });
      draw();

      addLocationControl(map, function (btn) {
        if (!navigator.geolocation) return alert(t.locateError);
        if (btn) btn.classList.add("is-loading");
        navigator.geolocation.getCurrentPosition(function (position) {
          if (btn) btn.classList.remove("is-loading");
          var lat = position.coords.latitude;
          var lng = position.coords.longitude;
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            updateMainLocation(lat, lng);
            map.panTo({ lat: lat, lng: lng });
            map.setZoom(13);
            saveMapState(lat, lng, 13);
          }
        }, function () {
          if (btn) btn.classList.remove("is-loading");
          alert(t.locateError);
        }, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          var lat = position.coords.latitude;
          var lng = position.coords.longitude;
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            updateMainLocation(lat, lng);
            if (!initialSavedState) {
              map.setCenter({ lat: lat, lng: lng });
              map.setZoom(12);
              saveMapState(lat, lng, 12);
            }
          }
        }, function () {}, {
          enableHighAccuracy: false,
          timeout: 7000,
          maximumAge: 300000
        });
      }
    });
  }

  function renderNew(session) {
    track("wanted_create_start");

    var lat = Number(params.get("lat"));
    var lng = Number(params.get("lng"));
    var valid = Number.isFinite(lat) && Number.isFinite(lng) &&
      WantedCore.validateProposal({
        latitude: lat, longitude: lng, placeLabel: "x", locationType: "other",
        reason: "123456789012", frequency: "daily", chargerType: "unknown"
      }).errors.coordinates === undefined;

    var point = { latitude: valid ? lat : 43.2389, longitude: valid ? lng : 76.8897 };
    var step = 1;
    var map = null;
    var marker = null;
    var userMarker = null;

    root.innerHTML = '<main class="page create-page">' + header(true) +
      '<div class="create-head"><p class="eyebrow">' + t.step +
      ' <span id="step-number">1</span> / 4</p><div class="progress"><i></i></div></div>' +
      '<form id="proposal-form" class="panel wizard" novalidate>' +
      '<section class="wizard-step active" data-step="1"><h2>' + t.placeStep +
      '</h2><p class="hint">' + t.placeHelp + '</p><div id="pick-map" class="pick-map"></div>' +
      '<button type="button" class="secondary locate" id="locate">⌖ ' + t.useLocation +
      '</button><label>' + t.address +
      '<input name="placeLabel" maxlength="160" placeholder="Алматы, улица…"></label></section>' +
      '<section class="wizard-step" data-step="2"><h2>' + t.locationStep +
      '</h2><div class="choices">' + Object.keys(t.locations).map(function (key, index) {
        return choice("locationType", key, t.locations[key], index === 0);
      }).join("") + '</div></section><section class="wizard-step" data-step="3"><h2>' +
      t.reasonStep + '</h2><label><textarea name="reason" minlength="2" maxlength="500" required placeholder="' +
      t.reasonPlaceholder + '"></textarea></label></section><section class="wizard-step" data-step="4"><h2>' +
      t.chargerStep + '</h2><div class="choices horizontal">' +
      Object.keys(t.chargers).map(function (key, index) {
        return choice("chargerType", key, t.chargers[key], index === 2);
      }).join("") + '</div><fieldset class="connector-field"><legend>' + t.connectors +
      '</legend><div class="choices connector-choices">' +
      ["GB/T", "CCS 2 (Type 2)", "CHAdeMO", "NACS"].map(function (name) {
        return multiChoice("connectors", name, name);
      }).join("") + '</div></fieldset><label>' + t.comment +
      '<textarea name="authorComment" maxlength="500"></textarea></label></section>' +
      '<p class="error-box" id="error-box" hidden></p><div class="wizard-actions">' +
      '<button type="button" id="prev" class="secondary" hidden>' + t.prev +
      '</button><button type="button" id="next" class="primary">' + t.next +
      '</button><button type="submit" id="submit" class="primary" hidden>' + t.submit +
      '</button></div></form><dialog id="duplicate"><div class="dialog-body"><h2>' +
      t.duplicateTitle + '</h2><div id="duplicate-card"></div><div class="dialog-actions">' +
      '<button value="cancel" class="secondary">' + t.duplicateContinue +
      '</button><button id="support-duplicate" class="primary">' + t.duplicateSupport +
      "</button></div></div></dialog></main>";

    bindLanguages();

    var form = document.getElementById("proposal-form");
    var errorBox = document.getElementById("error-box");
    var previous = document.getElementById("prev");
    var next = document.getElementById("next");
    var submit = document.getElementById("submit");
    var geocoder = null;

    function formatGeocodeAddress(result) {
      if (!result) return "";
      var components = result.address_components || [];
      function get(type) {
        for (var i = 0; i < components.length; i++) {
          if (components[i].types && components[i].types.indexOf(type) !== -1) {
            return components[i].long_name;
          }
        }
        return "";
      }

      var route = get("route");
      var streetNumber = get("street_number");
      var neighborhood = get("neighborhood") || get("sublocality_level_1") || get("sublocality");
      var premise = get("premise") || get("subpremise") || get("point_of_interest") || get("establishment");
      var city = get("locality") || get("sublocality") || get("administrative_area_level_2") || get("administrative_area_level_1");

      var street = "";
      if (route) {
        street = streetNumber ? (route + ", " + streetNumber) : route;
      } else if (neighborhood) {
        street = streetNumber ? (neighborhood + ", " + streetNumber) : neighborhood;
      } else if (premise) {
        street = premise;
      }

      if (city && street) {
        if (street.indexOf(city) === -1) {
          return city + ", " + street;
        }
        return street;
      }
      if (street) return street;
      if (city) return city;

      var formatted = result.formatted_address || "";
      var country = get("country");
      var postalCode = get("postal_code");

      if (country) {
        formatted = formatted.replace(new RegExp(",?\\s*" + country.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&") + "\\b", "gi"), "");
      }
      if (postalCode) {
        formatted = formatted.replace(new RegExp("\\b" + postalCode + "\\b", "g"), "");
      }
      return formatted
        .replace(/,?\s*(Казахстан|Kazakhstan|Қазақстан)\b/gi, "")
        .replace(/\b\d{6}\b/g, "")
        .replace(/\s+,/g, ",")
        .replace(/,\s*,+/g, ",")
        .replace(/^\s*,\s*|\s*,\s*$/g, "")
        .trim();
    }

    function reverseGeocode(lat, lng) {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      if (typeof google === "undefined" || !google.maps || !google.maps.Geocoder) return;
      if (!geocoder) {
        geocoder = new google.maps.Geocoder();
      }
      geocoder.geocode({ location: { lat: lat, lng: lng } }, function (results, status) {
        if (status === "OK" && results && results.length > 0) {
          var formatted = formatGeocodeAddress(results[0]);
          if (form && form.placeLabel && formatted) {
            form.placeLabel.value = formatted;
          }
        }
      });
    }

    function updateUserLocation(userLat, userLng) {
      if (!Number.isFinite(userLat) || !Number.isFinite(userLng)) return;
      if (userMarker) {
        userMarker.setPosition({ lat: userLat, lng: userLng });
        userMarker.setVisible(true);
      }
    }

    function locate(button) {
      if (!navigator.geolocation) {
        alert(t.locateError);
        return;
      }
      if (button) button.classList.add("is-loading");
      navigator.geolocation.getCurrentPosition(function (position) {
        if (button) button.classList.remove("is-loading");
        var userLat = position.coords.latitude;
        var userLng = position.coords.longitude;
        if (Number.isFinite(userLat) && Number.isFinite(userLng)) {
          point = { latitude: userLat, longitude: userLng };
          var latLng = { lat: userLat, lng: userLng };
          updateUserLocation(userLat, userLng);
          if (marker) marker.setPosition(latLng);
          if (map) {
            map.panTo(latLng);
            map.setZoom(16);
          }
          reverseGeocode(userLat, userLng);
        }
      }, function () {
        if (button) button.classList.remove("is-loading");
        alert(t.locateError);
      }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    }

    createMap("pick-map", [point.latitude, point.longitude], valid ? 16 : 13, function (createdMap) {
      map = createdMap;
      userMarker = createUserLocationMarker(map);
      marker = new google.maps.Marker(pinMarkerOptions({ lat: point.latitude, lng: point.longitude }, map, true));

      if (valid && (!form.placeLabel.value || !form.placeLabel.value.trim())) {
        reverseGeocode(point.latitude, point.longitude);
      }

      marker.addListener("dragend", function (event) {
        point = { latitude: event.latLng.lat(), longitude: event.latLng.lng() };
        reverseGeocode(point.latitude, point.longitude);
      });

      map.addListener("click", function (event) {
        point = { latitude: event.latLng.lat(), longitude: event.latLng.lng() };
        marker.setPosition(event.latLng);
        reverseGeocode(point.latitude, point.longitude);
      });

      addLocationControl(map, function (btn) {
        locate(btn);
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          var userLat = position.coords.latitude;
          var userLng = position.coords.longitude;
          if (Number.isFinite(userLat) && Number.isFinite(userLng)) {
            var userLatLng = { lat: userLat, lng: userLng };
            updateUserLocation(userLat, userLng);
            if (!valid) {
              point = { latitude: userLat, longitude: userLng };
              if (marker) marker.setPosition(userLatLng);
              if (map) {
                map.setCenter(userLatLng);
                map.setZoom(16);
              }
              reverseGeocode(userLat, userLng);
            }
          }
        }, function () {}, {
          enableHighAccuracy: false,
          timeout: 7000,
          maximumAge: 300000
        });
      }
    });

    var locateBtn = document.getElementById("locate");
    if (locateBtn) {
      locateBtn.onclick = function () { locate(locateBtn); };
    }

    function showStep(number) {
      step = number;
      root.querySelectorAll(".wizard-step").forEach(function (section) {
        section.classList.toggle("active", Number(section.dataset.step) === step);
      });
      document.getElementById("step-number").textContent = step;
      root.querySelector(".progress i").style.width = (step * 25) + "%";
      previous.hidden = step === 1;
      next.hidden = step === 4;
      submit.hidden = step !== 4;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    next.onclick = function () {
      if (step === 3 && (!form.reason.value.trim() || form.reason.value.trim().length < 2)) {
        errorBox.textContent = t.validation;
        errorBox.hidden = false;
        form.reason.focus();
        return;
      }
      errorBox.hidden = true;
      showStep(step + 1);
    };

    previous.onclick = function () { showStep(step - 1); };

    form.onsubmit = function (event) {
      event.preventDefault();
      var data = new FormData(form);
      var authorName = (session && session.user && (session.user.displayName || session.user.email)) || undefined;
      var rawPlaceLabel = (data.get("placeLabel") || "").trim();
      var input = {
        latitude: point.latitude,
        longitude: point.longitude,
        placeLabel: rawPlaceLabel || (t.locations[data.get("locationType")] || t.placeStep),
        locationType: data.get("locationType"),
        reason: data.get("reason"),
        frequency: "unspecified",
        chargerType: data.get("chargerType"),
        connectors: data.getAll("connectors"),
        authorComment: data.get("authorComment"),
        authorName: authorName
      };
      var checked = WantedCore.validateProposal(input);
      if (!checked.valid) {
        errorBox.textContent = t.validation;
        errorBox.hidden = false;
        if (checked.errors.placeLabel) showStep(1);
        else if (checked.errors.reason) showStep(3);
        return;
      }
      if (checked.value.locationType === "residential") {
        checked.value.latitude = Number(checked.value.latitude.toFixed(4));
        checked.value.longitude = Number(checked.value.longitude.toFixed(4));
      }

      submit.disabled = true;
      WantedApi.nearby(checked.value).then(function (response) {
        if (!response.items.length) return publish(checked.value);

        track("wanted_duplicate_found");
        var item = response.items[0];
        var dialog = document.getElementById("duplicate");
        document.getElementById("duplicate-card").innerHTML = card(item);
        dialog.showModal();
        dialog.querySelector('[value="cancel"]').onclick = function () {
          dialog.close();
          publish(checked.value);
        };
        document.getElementById("support-duplicate").onclick = function () {
          WantedApi.vote(item.id, true).then(function () { navigate("/wanted/" + item.id); });
        };
        submit.disabled = false;
      }).catch(function () { publish(checked.value); });
    };

    function openCreatedModal(item) {
      var shareUrl = location.origin + "/wanted/" + encodeURIComponent(item.id);
      var copySvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
      var shareSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>';

      var dialogHtml = '<dialog id="created-dialog" class="created-modal">' +
        '<div class="dialog-body created-dialog-body">' +
        '<div class="created-icon-wrap"><span class="created-emoji">🎉</span></div>' +
        '<h2>' + esc(t.thankYouTitle) + '</h2>' +
        '<p class="created-place-name"><strong>' + esc(item.placeLabel) + '</strong></p>' +
        '<p class="created-desc">' + esc(t.thankYouText) + '</p>' +
        '<div class="created-actions">' +
        '<button type="button" id="created-copy-btn" class="primary created-action-btn">' +
        copySvg + '<span>' + esc(t.copyLink) + '</span>' +
        '</button>' +
        (navigator.share ? '<button type="button" id="created-share-btn" class="secondary created-action-btn">' +
        shareSvg + '<span>' + esc(t.shareInChats) + '</span>' +
        '</button>' : '') +
        '<button type="button" id="created-done-btn" class="created-done-btn">' +
        esc(t.gotIt) +
        '</button>' +
        '</div>' +
        '</div>' +
        '</dialog>';

      document.body.insertAdjacentHTML("beforeend", dialogHtml);
      var dialog = document.getElementById("created-dialog");
      try {
        dialog.showModal();
      } catch (e) {
        dialog.setAttribute("open", "");
      }

      function goToDetail() {
        if (dialog) {
          if (typeof dialog.close === "function") dialog.close();
          else dialog.removeAttribute("open");
          dialog.remove();
        }
        navigate("/wanted/" + encodeURIComponent(item.id));
      }

      var copyBtn = document.getElementById("created-copy-btn");
      if (copyBtn) {
        copyBtn.onclick = function () {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareUrl).then(function () {
              copyBtn.innerHTML = '<span>' + esc(t.copiedLink) + '</span>';
              copyBtn.classList.add("btn-copied");
            }).catch(function () {
              prompt(t.copyLink, shareUrl);
            });
          } else {
            prompt(t.copyLink, shareUrl);
          }
        };
      }

      var shareBtn = document.getElementById("created-share-btn");
      if (shareBtn) {
        shareBtn.onclick = function () {
          shareProposal(item);
        };
      }

      var doneBtn = document.getElementById("created-done-btn");
      if (doneBtn) doneBtn.onclick = goToDetail;

      dialog.addEventListener("cancel", function (e) {
        e.preventDefault();
        goToDetail();
      });
    }

    function publish(value) {
      WantedApi.create(value).then(function (item) {
        track("wanted_create_success", { proposal_id: item.id });
        saveMyProposalId(item.id);
        openCreatedModal(item);
      }).catch(function (error) {
        submit.disabled = false;
        errorBox.hidden = false;
        errorBox.textContent = error.status === 401 ? t.authText : t.loadError;
      });
    }
  }

  function renderDetail(id) {
    root.innerHTML = '<main class="page detail-page">' + header(true) +
      '<div class="page-loader" role="status" aria-live="polite"><div class="loader-spinner" aria-hidden="true"></div><p class="loader-text">' + esc(t.detailLoading) + '</p></div></main>';
    bindLanguages();

    WantedApi.get(id).then(function (item) {
      if (!item) {
        var loader = root.querySelector(".page-loader");
        if (loader) loader.innerHTML = '<p class="empty">' + esc(t.notFound) + '</p>';
        return;
      }

      if (!loadSavedMapState() && Number.isFinite(item.latitude) && Number.isFinite(item.longitude)) {
        saveMapState(item.latitude, item.longitude, 14);
      }

      var isAuthor = checkIsAuthor(item, currentSessionUser);
      if (isAuthor) item.viewerHasVoted = true;

      track("wanted_proposal_open", { proposal_id: id });
      document.title = item.placeLabel + " — " + item.votesCount + " " + esc(pluralVotes(item.votesCount)) + " | evPoint.kz";
      var description = item.placeLabel + " · " + item.votesCount + " " + pluralVotes(item.votesCount) + ". " + item.reason;
      document.querySelector('meta[name="description"]')?.setAttribute("content", description);
      document.querySelector('meta[property="og:title"]')?.setAttribute("content", document.title);
      document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);

      var authorName = item.authorName || t.driver || (lang === "kk" ? "Жүргізуші" : (lang === "en" ? "Driver" : "Водитель"));
      var authorSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
      var authorHtml = '<span class="author-tag">' + authorSvg + '<span>' + esc(authorName) + '</span></span>';
      var shareSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>';

      var preferredParts = [];
      if (item.chargerType && item.chargerType !== "unknown") {
        preferredParts.push(esc(t.chargers[item.chargerType] || item.chargerType));
      }
      if (item.connectors && item.connectors.length) {
        preferredParts.push(esc(item.connectors.join(", ")));
      }
      var preferredHtml = preferredParts.length
        ? "<div><dt>" + t.preferred + "</dt><dd>" + preferredParts.join(" · ") + "</dd></div>"
        : "";

      var voteBtnText = isAuthor ? ("✓ " + t.youAuthor) : (item.viewerHasVoted ? ("✓ " + t.supported) : t.support);
      var voteBtnClass = "primary" + (item.viewerHasVoted ? " voted" : "") + (isAuthor ? " is-author" : "");
      var voteBtnAttr = isAuthor ? ' disabled title="' + esc(t.cantRemoveAuthorVote) + '"' : '';

      root.innerHTML = '<main class="page detail-page">' + header(true) +
        '<section class="detail-grid"><div><div id="detail-map" class="detail-map"></div>' +
        '<article class="panel detail-card"><div class="card-top">' + authorHtml +
        "<span>" + new Intl.DateTimeFormat(lang, { dateStyle: "medium" }).format(new Date(item.createdAt)) +
        "</span></div><h1>" + esc(item.placeLabel) + '</h1><p class="category">' +
        esc(t.locations[item.locationType]) + '</p><dl><div><dt>' + t.reason + "</dt><dd>" +
        esc(item.reason) + "</dd></div>" +
        preferredHtml +
        '</dl></article></div><aside><section class="panel vote-panel">' +
        '<div class="vote-count"><strong id="vote-count">' + item.votesCount + '</strong><span id="vote-label">' +
        esc(pluralVotes(item.votesCount)) + '</span></div><button id="vote" class="' + voteBtnClass + '"' + voteBtnAttr + '>' +
        voteBtnText +
        '</button><button id="share" class="secondary share-btn">' +
        shareSvg + '<span>' + t.share + '</span>' +
        '</button><a class="app-link" href="/app/" id="install-app">' + t.installApp +
        ' →</a></section><section class="panel disclaimer">ⓘ ' + t.disclaimer +
        '</section></aside></section><section class="panel comments"><h2>' + t.comments +
        '</h2><div id="comments-list">' +
        ((item.comments || []).length ? item.comments.map(function (comment) {
          return "<article><p>" + esc(comment.text) + "</p><time>" +
            new Intl.DateTimeFormat(lang, { dateStyle: "medium" }).format(new Date(comment.createdAt)) +
            "</time></article>";
        }).join("") : '<p class="hint">' + t.noComments + "</p>") +
        '</div><form id="comment-form"><label>' + t.addComment +
        '<textarea name="text" maxlength="500" placeholder="' + t.commentPlaceholder +
        '" required></textarea></label><button class="primary">' + t.send +
        "</button></form></section></main>";

      bindLanguages();

      function updateVoteButtonState(hasVoted, forceAuthor) {
        var isAuth = forceAuthor !== undefined ? forceAuthor : checkIsAuthor(item, currentSessionUser);
        item.viewerHasVoted = Boolean(hasVoted || isAuth);
        var voteBtn = document.getElementById("vote");
        if (voteBtn) {
          if (isAuth) {
            voteBtn.textContent = "✓ " + t.youAuthor;
            voteBtn.classList.add("voted", "is-author");
            voteBtn.disabled = true;
            voteBtn.title = t.cantRemoveAuthorVote;
          } else {
            voteBtn.textContent = item.viewerHasVoted ? "✓ " + t.supported : t.support;
            voteBtn.classList.toggle("voted", item.viewerHasVoted);
            voteBtn.classList.remove("is-author");
            voteBtn.disabled = false;
            voteBtn.removeAttribute("title");
          }
        }
      }

      WantedApi.getVote(id).then(function (res) {
        if (res) {
          if (res.isAuthor || res.viewerIsAuthor) item.viewerIsAuthor = true;
          var isAuth = checkIsAuthor(item, currentSessionUser);
          if (isAuth) {
            updateVoteButtonState(true, true);
          } else if (res.voted != null || res.viewerHasVoted != null || res.hasVoted != null) {
            var hasVoted = Boolean(res.voted || res.viewerHasVoted || res.hasVoted);
            updateVoteButtonState(hasVoted, false);
          }
        }
      }).catch(function () {});

      createMap("detail-map", [item.latitude, item.longitude], 15, function (map) {
        new google.maps.Marker(pinMarkerOptions({ lat: item.latitude, lng: item.longitude }, map, false));
      });

      var vote = document.getElementById("vote");
      if (isAuthor) {
        vote.disabled = true;
        vote.title = t.cantRemoveAuthorVote;
      }
      vote.onclick = function () {
        if (checkIsAuthor(item, currentSessionUser)) {
          updateVoteButtonState(true, true);
          return;
        }
        ensureAuth(function (session) {
          if (session && session.user) currentSessionUser = session.user;
          if (checkIsAuthor(item, currentSessionUser)) {
            updateVoteButtonState(true, true);
            return;
          }
          var target = !item.viewerHasVoted;
          vote.disabled = true;
          WantedApi.vote(id, target).then(function (updated) {
            item.votesCount = (updated && typeof updated.votesCount === "number") ? updated.votesCount : Math.max(0, item.votesCount + (target ? 1 : -1));
            document.getElementById("vote-count").textContent = item.votesCount;
            var labelEl = document.getElementById("vote-label");
            if (labelEl) labelEl.textContent = pluralVotes(item.votesCount);
            var hasVoted = updated && updated.viewerHasVoted != null ? Boolean(updated.viewerHasVoted) : target;
            updateVoteButtonState(hasVoted, false);
            vote.disabled = false;
            track(hasVoted ? "wanted_vote" : "wanted_vote_cancel", { proposal_id: id });
          }).catch(function (err) {
            vote.disabled = false;
            console.warn("Vote error:", err);
          });
        });
      };

      var shareBtn = document.getElementById("share");
      if (shareBtn) {
        shareBtn.onclick = function () {
          shareProposal(item);
        };
      }

      document.getElementById("install-app").onclick = function () {
        track("wanted_install_app", { proposal_id: id });
      };

      document.getElementById("comment-form").onsubmit = function (event) {
        event.preventDefault();
        var form = event.currentTarget;
        ensureAuth(function () {
          WantedApi.addComment(id, form.text.value).then(function () { renderDetail(id); });
        });
      };
    }).catch(function () {
      var loader = root.querySelector(".page-loader");
      if (loader) loader.innerHTML = '<p class="empty">' + esc(t.loadError) + '</p>';
    });
  }

  function navigate(url, replace) {
    var fullUrl = typeof url === "string" ? new URL(url, location.origin) : url;
    var target = fullUrl.pathname + fullUrl.search + fullUrl.hash;
    if (replace) {
      history.replaceState(null, "", target);
    } else {
      history.pushState(null, "", target);
    }
    route();
  }

  function route() {
    var path = location.pathname.replace(/\/+$/, "");
    window.scrollTo({ top: 0, behavior: "instant" });

    if (path === "/wanted/new") {
      document.title = (t.newTitle || "Предложить место") + " | evPoint.kz";
      authGate(renderNew);
    } else if (path === "/wanted" || path === "") {
      document.title = (t.title || "Где нужна зарядка") + " | evPoint.kz";
      renderList();
    } else if (path.indexOf("/wanted/") === 0) {
      renderDetail(decodeURIComponent(path.slice(8)));
    } else {
      document.title = (t.title || "Где нужна зарядка") + " | evPoint.kz";
      renderList();
    }
  }

  window.addEventListener("popstate", function () {
    route();
  });

  document.addEventListener("click", function (event) {
    if (event.defaultPrevented) return;
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    var target = event.target;
    var anchor = target && target.closest ? target.closest("a") : null;
    if (!anchor) return;

    var href = anchor.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("tel:") || href.startsWith("mailto:")) return;
    if (anchor.target && anchor.target !== "_self") return;

    try {
      var url = new URL(anchor.href, location.origin);
      if (url.origin === location.origin) {
        var cleanPath = url.pathname.replace(/\/+$/, "");
        if (cleanPath === "/wanted" || cleanPath.startsWith("/wanted/")) {
          event.preventDefault();
          navigate(url.pathname + url.search + url.hash);
        }
      }
    } catch (e) {}
  });

  route();
}());
