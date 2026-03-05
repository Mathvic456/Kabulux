import axios, { AxiosInstance, RawAxiosRequestHeaders } from "axios";
import Constants from "expo-constants";

if (!Constants.expoConfig?.extra?.apiUrl) {
  console.warn("API URL missing in expoConfig.extra");
}

export const API_URL = Constants.expoConfig?.extra?.apiUrl;

console.log("[API Config] Base URL:", API_URL);

let getValidTokenFn: (() => Promise<string | null>) | null = null;
let globalLogoutFn: (() => Promise<void>) | null = null;

// Synced from AuthContext on setTokens/clearTokens so first request after login has the token (avoids iOS timing race).
let latestAccessToken: string | null = null;

export const setLatestAccessToken = (token: string | null) => {
  latestAccessToken = token;
};

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
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}[] = [];

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

// auth/* routes skip token injection by default, except these which require the user to be logged in
const AUTHENTICATED_AUTH_ROUTE_EXCEPTIONS = ["auth/request_delete_account/"];

// --- REQUEST INTERCEPTOR ---
api.interceptors.request.use(
  async (config) => {
    const isAuthRoute = config.url?.includes("auth/");
    const isException = AUTHENTICATED_AUTH_ROUTE_EXCEPTIONS.some((route) =>
      config.url?.includes(route)
    );

    if (isAuthRoute && !isException) {
      return config;
    }

    let token: string | null = latestAccessToken;
    if (!token && getValidTokenFn) {
      token = await getValidTokenFn();
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

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    const requestId = Math.random().toString(36).substring(7);
    console.error(`[API Error ${requestId}] 401 Detected`);

    if (originalRequest._retry) {
      console.error(`[API Error ${requestId}] Retry failed, logging out`);
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
      let newToken: string | null = latestAccessToken;
      if (!newToken && getValidTokenFn) {
        newToken = await getValidTokenFn();
      }

      if (!newToken) throw new Error("Failed to get valid token");

      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      processQueue(null, newToken);
      isRefreshing = false;

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      isRefreshing = false;

      console.log("[API] Logging out user due to critical refresh failure...");
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