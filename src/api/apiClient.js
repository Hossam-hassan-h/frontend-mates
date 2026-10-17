import axios from "axios";

const rawUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
const sanitizedUrl = rawUrl
  .replace("https://localhost/8000", "http://localhost:8000")
  .replace("https://localhost:8000", "http://localhost:8000")
  .replace("http://localhost/8000", "http://localhost:8000");

export const apiClient = axios.create({
  baseURL: sanitizedUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
