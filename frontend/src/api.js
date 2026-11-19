import axios from "axios";
const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const api = axios.create({ baseURL: apiBaseUrl });
api.interceptors.request.use(config => {
  const token = localStorage.getItem("cc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export const fileUrl = path => path?.startsWith("http") ? path : new URL(path || "", new URL(apiBaseUrl).origin).toString();
export default api;
