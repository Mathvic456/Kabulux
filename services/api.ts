import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance, RawAxiosRequestHeaders } from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  } as RawAxiosRequestHeaders,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.warn("Token read error", e);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      message: error.message,
      data: error.response?.data,
      status: error.response?.status,
    });
    return Promise.reject(error);
  }
);

export const logoutApi: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});
