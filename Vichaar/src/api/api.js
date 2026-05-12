import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:7070/api",
  withCredentials: true,
});

export default API;
