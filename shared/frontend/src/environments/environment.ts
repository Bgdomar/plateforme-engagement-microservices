// src/environments/environment.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyDgr2gfKmloJHe3ZlGWDx1YGV2s-AxiHOg",
    authDomain: "dxc-stagiaires-platform.firebaseapp.com",
    projectId: "dxc-stagiaires-platform",
    storageBucket: "dxc-stagiaires-platform.firebasestorage.app",
    messagingSenderId: "384539773476",
    appId: "1:384539773476:web:4072c4ef84850dd991a6b1"
  },
  get apiUrl(): string {
    // Vérification sécurisée de window.__env
    if (typeof window !== 'undefined' && window.__env && window.__env.API_URL) {
      return window.__env.API_URL;
    }
    // Fallback pour le développement local
    return 'http://localhost:8080';
  },
  get facialAiUrl(): string {
    if (typeof window !== 'undefined' && window.__env && window.__env.FACIAL_AI_URL) {
      return window.__env.FACIAL_AI_URL;
    }
    return 'http://localhost:8082';
  },

};
