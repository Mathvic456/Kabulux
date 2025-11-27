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

// REQUEST INTERCEPTOR - Add token to all requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    console.log(`🔐 [API Request] ${config.url} - Token: ${token ? 'Present' : 'Missing'}`);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    console.error("🚨 [API Request Error]", error);
    return Promise.reject(error);
  }
);

// Track if we're already refreshing to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// RESPONSE INTERCEPTOR - Handle 401 and refresh token
api.interceptors.response.use(
  (response) => {
    // Success response logging
    console.log(`✅ [API Response] ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const requestId = Math.random().toString(36).substring(7);

    // Log all errors
    console.error(`🚨 [API Error ${requestId}] URL: ${originalRequest?.url}`);
    console.error(`🚨 [API Error ${requestId}] Method: ${originalRequest?.method?.toUpperCase()}`);
    console.error(`🚨 [API Error ${requestId}] Status: ${error.response?.status}`);
    console.error(`🚨 [API Error ${requestId}] Message: ${error.message}`);

    // Handle non-401 errors
    if (error.response?.status !== 401) {
      if (error.response?.status === 404) {
        console.error(`🔍 [API Error ${requestId}] ENDPOINT NOT FOUND`);
      } else if (error.response?.status === 500) {
        console.error(`💥 [API Error ${requestId}] SERVER ERROR`);
      }
      
      if (error.response?.data) {
        console.error(`🚨 [API Error ${requestId}] Response data:`, error.response.data);
      }
      
      return Promise.reject(error);
    }

    // Handle 401 - Authentication Error
    console.error(`🔐 [API Error ${requestId}] AUTHENTICATION ERROR - Token expired or invalid`);

    // Don't retry if this is already a retry attempt
    if (originalRequest._retry) {
      console.error(`🔐 [API Error ${requestId}] Already retried, giving up`);
      console.log("🚪 [Auth] Logging out user...");
      await globalLogout();
      return Promise.reject(error);
    }

    // If we're already refreshing, queue this request
    if (isRefreshing) {
      console.log(`⏳ [API Error ${requestId}] Token refresh in progress, queuing request`);
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    // Mark this request as a retry
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      console.log(`🔄 [API Error ${requestId}] Attempting token refresh...`);
      
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      
      if (!refreshToken) {
        console.error(`🔐 [API Error ${requestId}] No refresh token found`);
        throw new Error("No refresh token available");
      }

      console.log(`🔄 [API Error ${requestId}] Sending refresh request...`);
      
      // Make refresh request
      const response = await api.post("/auth/refresh/", { refresh: refreshToken });
      
      const newAccessToken = response.data.access;
      
      if (!newAccessToken) {
        console.error(`🔐 [API Error ${requestId}] Refresh response missing access token`);
        throw new Error("Invalid refresh response");
      }

      console.log(`✅ [API Error ${requestId}] Token refreshed successfully`);
      
      // Save new token
      await AsyncStorage.setItem("token", newAccessToken);
      
      // Update the original request with new token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      
      // Process queued requests
      processQueue(null, newAccessToken);
      isRefreshing = false;
      
      // Retry the original request
      return api(originalRequest);
      
    } catch (refreshError) {
      console.error(`❌ [API Error ${requestId}] Token refresh failed:`, refreshError);
      
      // Process queued requests with error
      processQueue(refreshError, null);
      isRefreshing = false;
      
      // Check if refresh token is also invalid
      if (axios.isAxiosError(refreshError) && refreshError.response?.status === 401) {
        console.error(`🔐 [API Error ${requestId}] Refresh token is invalid/expired`);
      }
      
      // Log out user
      console.log("🚪 [Auth] Logging out user due to refresh failure...");
      
      // Give navigation ref time to register if app just started
      setTimeout(async () => {
        await globalLogout();
      }, 100);
      
      return Promise.reject(refreshError);
    }
  }
);

export const logoutApi: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

console.log("🔧 [API Init] API instance created with interceptors");