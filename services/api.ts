import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance, RawAxiosRequestHeaders } from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

console.log("🔧 [API Config] Base URL:", API_URL);

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  } as RawAxiosRequestHeaders,
});

api.interceptors.request.use(async (config) => {
  const requestId = Math.random().toString(36).substring(7);

  try {
    console.log(`🔧 [API Request ${requestId}] Starting request to:`, config.url);
    console.log(`🔧 [API Request ${requestId}] Method:`, config.method?.toUpperCase());

  
    if (!config.url?.includes("auth/login/")) { //I added this so we can skip token generation when logging in, that was the problem
      const token = await AsyncStorage.getItem("token");
      console.log(`🔐 [API Request ${requestId}] Token found in storage:`, !!token); 

      if (token) {
        console.log(`🔐 [API Request ${requestId}] Token length:`, token.length);
        console.log(`🔐 [API Request ${requestId}] Token preview:`, token.substring(0, 20) + '...');
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`✅ [API Request ${requestId}] Authorization header set with Bearer token`);
      } else {
        console.log(`❌ [API Request ${requestId}] No token found in AsyncStorage`);
      }
    } else {
      console.log(`⚡ [API Request ${requestId}] Skipping token for login endpoint`);
    }

    // Log request headers (excluding sensitive data)
    const safeHeaders = { ...config.headers };
    if (safeHeaders.Authorization && typeof safeHeaders.Authorization === "string") {
      safeHeaders.Authorization = safeHeaders.Authorization.substring(0, 20) + '...';
    }
    console.log(`📋 [API Request ${requestId}] Request headers:`, safeHeaders);

    if (config.data) {
      console.log(`📦 [API Request ${requestId}] Request data:`, config.data);
    }

  } catch (e) {
    console.error(`🚨 [API Request ${requestId}] Token read error:`, e);
  }

  return config;
});


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

// Test function to verify API configuration
export const testApiConnection = async () => {
  console.log("🧪 [API Test] Testing API connection...");
  
  try {
    const token = await AsyncStorage.getItem("token");
    console.log("🧪 [API Test] Stored token:", token ? `Exists (${token.length} chars)` : "None");
    
    console.log("🧪 [API Test] Base URL:", API_URL);
    console.log("🧪 [API Test] All storage keys:", await AsyncStorage.getAllKeys());
    
    return {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      baseUrl: API_URL,
      storageKeys: await AsyncStorage.getAllKeys()
    };
  } catch (error) {
    console.error("🧪 [API Test] Error during test:", error);
    throw error;
  }
};

export const logoutApi: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

console.log("🔧 [API Init] API instance created with interceptors");