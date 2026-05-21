// lib/api.ts — Axios instance with auth token injection
import axios from "axios";
import { useAuthStore } from "@/store/authStore";

let rawURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
if (rawURL && !rawURL.endsWith("/api") && !rawURL.endsWith("/api/")) {
  rawURL = rawURL.replace(/\/$/, "") + "/api";
}

const api = axios.create({
  baseURL: rawURL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("trustshield_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
