import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { jwtDecode } from "jwt-decode";
import React, { createContext, useContext, useEffect, useState } from "react";
import { setLatestAccessToken } from "@/services/api";

if (!Constants.expoConfig?.extra?.apiUrl) {
  throw new Error("API URL is missing in expoConfig.extra");
}

const API_URL = Constants.expoConfig.extra.apiUrl;

interface AuthContextValue {
  token: string | null;
  refreshToken: string | null;
  rememberMe: boolean;
  setTokens: (
    access: string,
    refresh: string,
    remember: boolean,
  ) => Promise<void>;
  clearTokens: () => Promise<void>;
  getValidToken: () => Promise<string | null>;
  isTokenExpired: (token: string) => boolean;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  // Initialize: Check AsyncStorage on mount (for "remember me" users)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedRememberMe = await AsyncStorage.getItem("rememberMe");

        if (storedRememberMe === "true") {
          const storedToken = await AsyncStorage.getItem("token");
          const storedRefresh = await AsyncStorage.getItem("refreshToken");

          if (storedToken && storedRefresh) {
            console.log(
              "🔐 [Auth] Restoring session from AsyncStorage (Remember Me)",
            );
            setToken(storedToken);
            setRefreshToken(storedRefresh);
            setRememberMe(true);
          }
        } else {
          console.log("🔐 [Auth] No Remember Me - starting fresh session");
        }
      } catch (error) {
        console.error("[Auth] Error initializing auth:", error);
      }
    };

    initAuth();
  }, []);

  const isTokenExpired = (token: string): boolean => {
    try {
      const { exp } = jwtDecode<{ exp: number }>(token);
      return exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const setTokens = async (
    access: string,
    refresh: string,
    remember: boolean,
  ) => {
    console.log(`🔑 [Auth] Setting tokens (Remember Me: ${remember})`);

    setLatestAccessToken(access);
    setToken(access);
    setRefreshToken(refresh);
    setRememberMe(remember);

    // Only persist to AsyncStorage if "remember me" is enabled
    if (remember) {
      await AsyncStorage.setItem("token", access);
      await AsyncStorage.setItem("refreshToken", refresh);
      await AsyncStorage.setItem("rememberMe", "true");
      console.log("💾 [Auth] Tokens saved to AsyncStorage");
    } else {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("rememberMe");
      console.log(
        "🗑️ [Auth] Tokens cleared from AsyncStorage (not persisting)",
      );
    }
  };

  const clearTokens = async () => {
    console.log("🚪 [Auth] Clearing all tokens");

    setLatestAccessToken(null);
    setToken(null);
    setRefreshToken(null);
    setRememberMe(false);

    // Clear AsyncStorage
    await AsyncStorage.multiRemove(["token", "refreshToken", "rememberMe"]);
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      // Get refresh token from Context first, then AsyncStorage
      let refresh = refreshToken;
      if (!refresh) {
        refresh = await AsyncStorage.getItem("refreshToken");
      }

      if (!refresh) {
        console.error("[Auth] No refresh token available");
        return null;
      }

      console.log("🔄 [Auth] Refreshing access token...");

      const res = await fetch(`${API_URL}auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      if (!res.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await res.json();
      const newAccessToken = data.access;

      if (!newAccessToken) {
        throw new Error("Invalid refresh response");
      }

      setLatestAccessToken(newAccessToken);
      setToken(newAccessToken);

      if (rememberMe) {
        await AsyncStorage.setItem("token", newAccessToken);
      }

      console.log("[Auth] Token refreshed successfully");
      return newAccessToken;
    } catch (error) {
      console.error("[Auth] Token refresh failed:", error);
      await clearTokens();
      return null;
    }
  };

  const getValidToken = async (): Promise<string | null> => {
    // 1. Try Context first (primary source)
    if (token && !isTokenExpired(token)) {
      return token;
    }

    // 2. If Context token is expired, try refreshing
    if (token && isTokenExpired(token)) {
      console.log("⏰ [Auth] Context token expired, refreshing...");
      return await refreshAccessToken();
    }

    // 3. Fallback: Check AsyncStorage (for "remember me" sessions)
    const storedToken = await AsyncStorage.getItem("token");
    if (storedToken && !isTokenExpired(storedToken)) {
      console.log("📦 [Auth] Using token from AsyncStorage");
      setLatestAccessToken(storedToken);
      setToken(storedToken);
      return storedToken;
    }

    // 4. If AsyncStorage token is expired, try refreshing
    if (storedToken && isTokenExpired(storedToken)) {
      console.log("⏰ [Auth] AsyncStorage token expired, refreshing...");
      return await refreshAccessToken();
    }

    console.log("❌ [Auth] No valid token available");
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        refreshToken,
        rememberMe,
        setTokens,
        clearTokens,
        getValidToken,
        isTokenExpired,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
