import axios from "axios";

const dbAPI = axios.create({
  baseURL: import.meta.env.VITE_FIREBASE_DB_URL,
  headers: { "Content-Type": "application/json" },
});

// Automatically attach token to every DB request
dbAPI.interceptors.request.use((config) => {
  const raw = localStorage.getItem("adminAuth");
  if (raw) {
    const data = JSON.parse(raw);
    if (data?.token) {
      config.params = { ...(config.params || {}), auth: data.token };
    }
  }
  return config;
});

export default dbAPI;
