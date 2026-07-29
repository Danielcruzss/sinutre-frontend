// Cliente HTTP mínimo do front para o sinutre-back.
// Lê a base do servidor de import.meta.env.VITE_API_URL.
import axios from "axios";

const DEFAULT_API_URL =
  "https://sinutre-backend-production-6873.up.railway.app";

export const API_URL = (
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
).replace(/\/$/, "");

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});