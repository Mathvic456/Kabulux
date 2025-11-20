import { globalLogout } from "@/scripts/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance, RawAxiosRequestHeaders } from "axios";
import Constants from "expo-constants";

if (!Constants.expoConfig?.extra?.apiUrl) {
  throw new Error("API URL is missing in expoConfig.extra");
}

const API_URL = Constants.expoConfig.extra.apiUrl;

console.log("🔧 [API Config] Base URL:", API_URL);

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  } as RawAxiosRequestHeaders,
});



api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue: ((token: string) => void)[] = [];

api.interceptors.response.use(
  res => res,
  async (error) => {
    const status = error?.response?.status;
    const original = error.config;

    if (status !== 401) return Promise.reject(error);

    if (original._retry) return Promise.reject(error);
    original._retry = true;

    try {
      const refresh = await AsyncStorage.getItem("refreshToken");
      if (!refresh) throw new Error("Missing refresh token");

      const res = await api.post("/auth/refresh/", { refresh });

      const newToken = res.data.access;
      await AsyncStorage.setItem("token", newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);

    } catch (err) {
      await globalLogout();
      return Promise.reject(err);
    }
  }
);




api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API Response ${response.config.url}] Status:`, response.status);
    console.log(`✅ [API Response ${response.config.url}] Data:`, response.data);
    return response;
  },
  (error) => {
    const requestId = Math.random().toString(36).substring(7);
    
    console.error(`🚨 [API Error ${requestId}] URL:`, error.config?.url);
    console.error(`🚨 [API Error ${requestId}] Method:`, error.config?.method?.toUpperCase());
    console.error(`🚨 [API Error ${requestId}] Status:`, error.response?.status);
    console.error(`🚨 [API Error ${requestId}] Status Text:`, error.response?.statusText);
    console.error(`🚨 [API Error ${requestId}] Message:`, error.message);
    
    if (error.response) {
      // Server responded with error status
      console.error(`🚨 [API Error ${requestId}] Response headers:`, error.response.headers);
      console.error(`🚨 [API Error ${requestId}] Response data:`, error.response.data);
      
      // Specific handling for common errors
      if (error.response.status === 401) {
        console.error(`🔐 [API Error ${requestId}] AUTHENTICATION ERROR - Invalid or missing token`);
        // Check if we have a token stored
        AsyncStorage.getItem("token").then(token => {
          console.log(`🔐 [API Error ${requestId}] Current stored token:`, token ? `Exists (${token.length} chars)` : "None");
        });
      } else if (error.response.status === 404) {
        console.error(`🔍 [API Error ${requestId}] ENDPOINT NOT FOUND`);
      } else if (error.response.status === 500) {
        console.error(`💥 [API Error ${requestId}] SERVER ERROR`);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error(`🌐 [API Error ${requestId}] NETWORK ERROR - No response received`);
      console.error(`🌐 [API Error ${requestId}] Request:`, error.request);
    } else {
      // Something else happened
      console.error(`⚡ [API Error ${requestId}] UNKNOWN ERROR:`, error.message);
    }
    
    console.error(`🚨 [API Error ${requestId}] Full error config:`, error.config);
    
    return Promise.reject(error);
  }
);


export const logoutApi: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

console.log("🔧 [API Init] API instance created with interceptors");