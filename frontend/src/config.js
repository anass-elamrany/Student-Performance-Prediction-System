// @ts-ignore
const PROD_URL = "https://edupredict-5910.onrender.com/api";
const DEV_URL = "http://localhost:8000/api";

// @ts-ignore
export const API_BASE_URL = import.meta.env.PROD ? PROD_URL : DEV_URL;