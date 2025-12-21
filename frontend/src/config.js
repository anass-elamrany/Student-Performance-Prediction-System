// @ts-ignore

// 1. Définition des URLs
const PROD_URL = "https://edupredict-5910.onrender.com/api";
const DEV_URL = "http://localhost:8000/api";

// 2. Détection infaillible basée sur le navigateur
// Si l'adresse dans la barre est "localhost" ou "127.0.0.1", on est en Dev.
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export const API_BASE_URL = isLocal ? DEV_URL : PROD_URL;

// 3. Debug (Pour voir la vérité dans la console)
console.log("🌍 MODE:", isLocal ? "DEVELOPMENT (Local)" : "PRODUCTION (Live)");
console.log("🔗 API URL utilisée:", API_BASE_URL);