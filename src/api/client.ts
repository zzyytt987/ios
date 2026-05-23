import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE } from "../config";

const TOKEN_KEY = "auth_token";

let memoryToken: string | null = null;
let onAuthError: (() => void) | null = null;

export function setAuthErrorHandler(handler: () => void) {
  onAuthError = handler;
}

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  let token = memoryToken;
  if (!token) {
    token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) memoryToken = token;
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      memoryToken = null;
      SecureStore.deleteItemAsync(TOKEN_KEY);
      onAuthError?.();
    }
    return Promise.reject(err);
  }
);

export async function saveToken(token: string) {
  memoryToken = token;
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    // SecureStore failed, token still in memory
  }
}

export async function getToken() {
  if (memoryToken) return memoryToken;
  try {
    const t = await SecureStore.getItemAsync(TOKEN_KEY);
    if (t) memoryToken = t;
    return t;
  } catch {
    return memoryToken;
  }
}

export async function removeToken() {
  memoryToken = null;
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export default api;
