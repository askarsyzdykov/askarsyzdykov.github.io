// Browser API keys are visible by design.
// 1) Google Maps Key:
//    Restrict in Google Cloud Console to:
//    - Websites: https://evpoint.kz/* and http://127.0.0.1:4000/*
//    - API: Maps JavaScript API only.
//
// 2) Firebase Auth Config:
//    - Создайте проект в Firebase Console: https://console.firebase.google.com/
//    - В Project Settings -> General -> Your apps -> Web app скопируйте объект конфигурации сюда:
//    - В Authentication -> Sign-in method включите провайдеры Google и Apple.
//    - В Authentication -> Settings -> Authorized domains добавьте "evpoint.kz" и "localhost".
window.EVPOINT_WANTED_CONFIG = {
  apiUrl: "https://api.evpoint.kz/api/wanted",
  googleMapsApiKey: "AIzaSyCt06zxcHM71DegSMhNVI227jprZRRv43A",
  firebase: {
    apiKey: "AIzaSyBC1h-q5xWcOw87cRVqZCGP3Cto5yDREQ0",
    authDomain: "kz-ev-chargers-map.firebaseapp.com",
    projectId: "kz-ev-chargers-map",
    storageBucket: "kz-ev-chargers-map.appspot.com",
    messagingSenderId: "636146528990",
    appId: "1:636146528990:web:8ef2ed20ede64605e0084f",
    measurementId: "G-1GX101FHBM"
  }
};

