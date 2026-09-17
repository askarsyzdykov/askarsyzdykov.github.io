(function () {
  "use strict";

  var firebaseAuth = null;

  function getFirebaseAuth() {
    if (firebaseAuth) return firebaseAuth;
    var config = window.EVPOINT_WANTED_CONFIG || {};
    if (window.firebase && config.firebase && config.firebase.apiKey && config.firebase.apiKey.indexOf("PASTE_") !== 0) {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(config.firebase);
        }
        firebaseAuth = firebase.auth();
      } catch (e) {
        console.warn("Firebase init error:", e);
      }
    }
    return firebaseAuth;
  }

  function getApiBaseUrl() {
    var config = window.EVPOINT_WANTED_CONFIG || {};
    return config.apiUrl;
  }

  function isMobileDevice() {
    if (typeof window === "undefined" || !window.navigator) return false;
    var ua = navigator.userAgent || navigator.vendor || window.opera || "";
    var isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    var isTouchMac = /Macintosh/i.test(ua) && typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 2;
    return isMobileUA || isTouchMac;
  }

  var redirectResultPromise = null;
  function getRedirectResult() {
    if (redirectResultPromise) return redirectResultPromise;
    var auth = getFirebaseAuth();
    if (!auth || typeof auth.getRedirectResult !== "function") {
      return Promise.resolve(null);
    }
    redirectResultPromise = auth.getRedirectResult().then(function (result) {
      if (result && result.user) {
        return { user: formatUser(result.user), credential: result.credential };
      }
      return null;
    }).catch(function (error) {
      console.warn("Firebase getRedirectResult error:", error);
      return { error: error };
    });
    return redirectResultPromise;
  }

  var authReadyPromise = null;
  function waitForAuthReady() {
    if (authReadyPromise) return authReadyPromise;
    var auth = getFirebaseAuth();
    if (!auth) return Promise.resolve(null);
    if (auth.currentUser) return Promise.resolve(auth.currentUser);
    authReadyPromise = getRedirectResult().then(function () {
      if (auth.currentUser) return Promise.resolve(auth.currentUser);
      return new Promise(function (resolve) {
        var unsubscribe = auth.onAuthStateChanged(function (fbUser) {
          unsubscribe();
          resolve(fbUser);
        });
        setTimeout(function () { resolve(auth.currentUser); }, 1500);
      });
    });
    return authReadyPromise;
  }

  async function getAuthToken() {
    var auth = getFirebaseAuth();
    if (!auth) return null;
    if (!auth.currentUser) {
      await waitForAuthReady();
    }
    if (auth.currentUser) {
      try {
        return await auth.currentUser.getIdToken();
      } catch (e) {
        console.warn("Error getting Firebase ID token:", e);
      }
    }
    return null;
  }

  async function request(path, options) {
    options = options || {};
    var headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
    var token = await getAuthToken();
    if (token) {
      headers["Authorization"] = "Bearer " + token;
    }

    var url = getApiBaseUrl() + path;
    var response = await fetch(url, Object.assign({}, options, { headers: headers }));
    var body = await response.json().catch(function () { return {}; });

    if (!response.ok) {
      var error = new Error(body.message || body.error || "API error");
      error.status = response.status;
      error.data = body;
      throw error;
    }
    return body;
  }

  function formatUser(fbUser) {
    if (!fbUser) return null;
    return {
      id: fbUser.uid,
      displayName: fbUser.displayName || fbUser.email || "Пользователь",
      email: fbUser.email,
      photoURL: fbUser.photoURL,
      provider: (fbUser.providerData && fbUser.providerData[0] && fbUser.providerData[0].providerId) || "firebase"
    };
  }

  function session() {
    var auth = getFirebaseAuth();
    if (!auth) {
      return Promise.resolve({ user: null });
    }
    if (auth.currentUser) {
      return Promise.resolve({ user: formatUser(auth.currentUser) });
    }
    return waitForAuthReady().then(function (fbUser) {
      return { user: formatUser(fbUser || auth.currentUser) };
    }).catch(function () {
      return { user: null };
    });
  }

  function signInWithGoogle(options) {
    var auth = getFirebaseAuth();
    if (!auth) return Promise.reject(new Error("Firebase auth is not configured"));
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    var useRedirect = (options && options.redirect != null) ? options.redirect : isMobileDevice();
    if (useRedirect) {
      return auth.signInWithRedirect(provider).then(function () {
        return { redirecting: true };
      });
    }
    return auth.signInWithPopup(provider).then(function (result) {
      return { user: formatUser(result.user) };
    }).catch(function (error) {
      if (error && (error.code === "auth/popup-blocked" || error.code === "auth/cancelled-popup-request")) {
        return auth.signInWithRedirect(provider).then(function () {
          return { redirecting: true };
        });
      }
      throw error;
    });
  }

  function signInWithApple(options) {
    var auth = getFirebaseAuth();
    if (!auth) return Promise.reject(new Error("Firebase auth is not configured"));
    var provider = new firebase.auth.OAuthProvider("apple.com");
    provider.addScope("email");
    provider.addScope("name");
    var useRedirect = (options && options.redirect != null) ? options.redirect : isMobileDevice();
    if (useRedirect) {
      return auth.signInWithRedirect(provider).then(function () {
        return { redirecting: true };
      });
    }
    return auth.signInWithPopup(provider).then(function (result) {
      return { user: formatUser(result.user) };
    }).catch(function (error) {
      if (error && (error.code === "auth/popup-blocked" || error.code === "auth/cancelled-popup-request")) {
        return auth.signInWithRedirect(provider).then(function () {
          return { redirecting: true };
        });
      }
      throw error;
    });
  }

  function signIn(options) {
    return signInWithGoogle(options);
  }

  function signOut() {
    var auth = getFirebaseAuth();
    return auth ? auth.signOut() : Promise.resolve();
  }

  function onAuthStateChanged(callback) {
    var auth = getFirebaseAuth();
    if (!auth) return function () {};
    return auth.onAuthStateChanged(function (fbUser) {
      if (typeof callback === "function") {
        callback(formatUser(fbUser));
      }
    });
  }

  function list(bounds, filters) {
    var params = new URLSearchParams();
    if (bounds) {
      if (bounds.south != null) params.set("south", bounds.south);
      if (bounds.north != null) params.set("north", bounds.north);
      if (bounds.west != null) params.set("west", bounds.west);
      if (bounds.east != null) params.set("east", bounds.east);
    }
    if (filters) {
      if (filters.sourceType) params.set("sourceType", filters.sourceType);
      if (filters.status) params.set("status", filters.status);
      if (filters.locationType) params.set("locationType", filters.locationType);
      if (filters.chargerType) params.set("chargerType", filters.chargerType);
    }
    var q = params.toString();
    return request(q ? "?" + q : "");
  }

  function get(id) {
    return request("/" + encodeURIComponent(id)).catch(function (error) {
      if (error.status === 404) return null;
      throw error;
    });
  }

  function nearby(point, sourceType) {
    var lat = point && point.location ? point.location.latitude : (point ? point.latitude : null);
    var lng = point && point.location ? point.location.longitude : (point ? point.longitude : null);
    var src = sourceType || (point && point.sourceType) || "driver_demand";
    var params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      radius: "300",
      sourceType: String(src)
    });
    return request("/nearby?" + params.toString());
  }

  function create(input) {
    return request("", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }

  function vote(id, enabled) {
    return request("/" + encodeURIComponent(id) + "/vote", {
      method: enabled ? "PUT" : "DELETE"
    });
  }

  async function getVote(id) {
    var token = await getAuthToken();
    if (!token) {
      return { voted: false, viewerHasVoted: false };
    }
    return request("/" + encodeURIComponent(id) + "/vote", {
      method: "GET"
    }).catch(function (error) {
      if (error && (error.status === 401 || error.status === 404)) {
        return { voted: false, viewerHasVoted: false };
      }
      return { voted: false, viewerHasVoted: false };
    });
  }

  function addComment(id, text) {
    return request("/" + encodeURIComponent(id) + "/comments", {
      method: "POST",
      body: JSON.stringify({ text: text })
    });
  }

  function myProposals() {
    return request("/my/proposals").catch(function () {
      return list(null, {}).then(function (res) {
        var items = (res && res.items) || [];
        var filtered = items.filter(function (x) {
          return Boolean(x.isAuthor);
        });
        return { items: filtered };
      });
    });
  }

  window.WantedApi = {
    session: session,
    signIn: signIn,
    signInWithGoogle: signInWithGoogle,
    signInWithApple: signInWithApple,
    signOut: signOut,
    onAuthStateChanged: onAuthStateChanged,
    getRedirectResult: getRedirectResult,
    isMobileDevice: isMobileDevice,
    formatUser: formatUser,
    list: list,
    myProposals: myProposals,
    get: get,
    getVote: getVote,
    nearby: nearby,
    create: create,
    vote: vote,
    addComment: addComment
  };
}());
