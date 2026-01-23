import axios, { AxiosInstance, RawAxiosRequestHeaders } from "axios";
import Constants from "expo-constants";

// Ensure we fail fast if API URL isn't set
if (!Constants.expoConfig?.extra?.apiUrl) {
  // Fallback for development if needed, or throw error
  console.warn("⚠️ API URL missing in expoConfig.extra");
}

export const API_URL = Constants.expoConfig?.extra?.apiUrl;

console.log("🔧 [API Config] Base URL:", API_URL);

let getValidTokenFn: (() => Promise<string | null>) | null = null;
let globalLogoutFn: (() => Promise<void>) | null = null;

export const setAuthTokenGetter = (fn: () => Promise<string | null>) => {
  getValidTokenFn = fn;
  console.log("[API] Auth token getter registered");
};

export const setGlobalLogout = (fn: () => Promise<void>) => {
  globalLogoutFn = fn;
  console.log("[API] Global logout function registered");
};

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  } as RawAxiosRequestHeaders,
});

// --- REFRESH LOGIC STATE ---
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

api.interceptors.request.use(
  async (config) => {
    if (config.url?.includes("auth/")) {
      return config;
    }

    let token: string | null = null;

    if (getValidTokenFn) {
      token = await getValidTokenFn();
      // console.log(`🔐 [API Request] Token attached: ${!!token}`);
    } else {
      console.warn(`⚠️ [API Request] Auth getter not initialized yet`);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// --- RESPONSE INTERCEPTOR ---
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle non-401 errors
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Handle 401 - Authentication Error
    const requestId = Math.random().toString(36).substring(7);
    console.error(`🔐 [API Error ${requestId}] 401 Detected`);

    // Prevent infinite loops
    if (originalRequest._retry) {
      console.error(`🔐 [API Error ${requestId}] Retry failed, logging out`);

      if (globalLogoutFn) {
        await globalLogoutFn();
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      if (!getValidTokenFn) throw new Error("No token getter");

      // Attempt refresh via AuthContext
      const newToken = await getValidTokenFn();

      if (!newToken) throw new Error("Failed to get valid token");

      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      processQueue(null, newToken);
      isRefreshing = false;

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      isRefreshing = false;

      console.log(
        "🚪 [API] Logging out user due to critical refresh failure...",
      );
      if (globalLogoutFn) {
        setTimeout(async () => {
          await globalLogoutFn!();
        }, 100);
      }

      return Promise.reject(refreshError);
    }
  },
);

export const logoutApi: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});
