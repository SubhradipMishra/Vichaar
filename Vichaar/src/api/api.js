import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://vichaar-backend-2hy5.onrender.com/api",
  withCredentials: true,
});

export default API;
