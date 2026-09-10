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

  var authReadyPromise = null;
  function waitForAuthReady() {
    if (authReadyPromise) return authReadyPromise;
    var auth = getFirebaseAuth();
    if (!auth) return Promise.resolve(null);
    if (auth.currentUser) return Promise.resolve(auth.currentUser);
    authReadyPromise = new Promise(function (resolve) {
      var unsubscribe = auth.onAuthStateChanged(function (fbUser) {
        unsubscribe();
        resolve(fbUser);
      });
      setTimeout(function () { resolve(auth.currentUser); }, 1200);
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

  function signInWithGoogle() {
    var auth = getFirebaseAuth();
    if (!auth) return Promise.reject(new Error("Firebase auth is not configured"));
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    return auth.signInWithPopup(provider).then(function (result) {
      return { user: formatUser(result.user) };
    });
  }

  function signInWithApple() {
    var auth = getFirebaseAuth();
    if (!auth) return Promise.reject(new Error("Firebase auth is not configured"));
    var provider = new firebase.auth.OAuthProvider("apple.com");
    provider.addScope("email");
    provider.addScope("name");
    return auth.signInWithPopup(provider).then(function (result) {
      return { user: formatUser(result.user) };
    });
  }

  function signIn() {
    return signInWithGoogle();
  }

  function signOut() {
    var auth = getFirebaseAuth();
    return auth ? auth.signOut() : Promise.resolve();
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

  function nearby(point) {
    return request("/nearby?lat=" + encodeURIComponent(point.latitude) + "&lng=" + encodeURIComponent(point.longitude) + "&radius=300");
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

  window.WantedApi = {
    session: session,
    signIn: signIn,
    signInWithGoogle: signInWithGoogle,
    signInWithApple: signInWithApple,
    signOut: signOut,
    list: list,
    get: get,
    getVote: getVote,
    nearby: nearby,
    create: create,
    vote: vote,
    addComment: addComment
  };
}());
