import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { api } from "./api";
import { CREATEACCOUNT_TYPE } from "./type";

// Define the new Login Payload type
type LoginPayload = {
  email: string;
  password: string;
  role: string;
  fcm_token: string;
  type: string; 
};

export const useRegisterEndPoint = () => {
  const mutation = useMutation<AxiosResponse<any>, any, CREATEACCOUNT_TYPE>({
    mutationFn: (data) => api.post("auth/register/", data),
    onSuccess: (res) => {
      console.log("✅ [Auth] Registration successful:", res.data);
    },
    onError: (error: any) => {
      console.error("❌ [Auth] Registration error:", error);
    },
  });

  return mutation;
};

export const useLoginEndPoint = (
  setTokens: (access: string, refresh: string, remember: boolean) => Promise<void>,
  remember: boolean
) => {
  return useMutation({
    // Updated mutationFn to accept the full payload
    mutationFn: (data: LoginPayload) => api.post("auth/login/", data),
    
    onSuccess: async (res) => {
      const token = res.data?.data?.access;
      const refreshToken = res.data?.data?.refresh;
      const userId = res.data?.data?.user?.id;

      if (!token || !refreshToken) {
        console.error("❌ [Auth] Missing tokens in response");
        throw new Error("Invalid login response");
      }

      console.log(`🔑 [Auth] Login successful (Remember Me: ${remember})`);

      // Store tokens in AuthContext
      await setTokens(token, refreshToken, remember);

      // Store userId separately
      if (userId) {
        await AsyncStorage.setItem("user_id", userId);
        console.log("✅ [Auth] User ID saved:", userId);
      }
    },
    
    onError: (error: any) => {
      console.error("❌ [Auth] Login error:", error);
    },
  });
};

export const useLogoutEndPoint = (
  clearTokens: () => Promise<void>
) => {
  return useMutation({
    mutationFn: async () => {
      await clearTokens();
      await AsyncStorage.removeItem("user_id");
      console.log("🗑️ [Auth] Cleared all user data");
      return true;
    },
    onSuccess: () => {
      console.log("✅ [Auth] User logged out successfully");
    },
    onError: (error: any) => {
      console.error("❌ [Auth] Logout error:", error);
    },
  });
};