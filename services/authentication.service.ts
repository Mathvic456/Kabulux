import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { api } from "./api";
import { CREATEACCOUNT_TYPE } from "./type";

// Types for modal control
export type AuthResult = {
  success: boolean;
  message: string;
  data?: any;
};

export const useRegisterEndPoint = () => {
  return useMutation({
    mutationFn: (data: CREATEACCOUNT_TYPE) => api.post("auth/register/", data),
    onSuccess: (res) => {
      console.log("Registration successful:", res.data);
      // Don't show alert here - let component handle the modal
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      // Return error for component to handle
    },
  });
};

export const useLoginEndPoint = () => {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post("auth/login/", data),
    onSuccess: async (res) => {
      const token = res.data?.data?.access;
      if (token) {
        await AsyncStorage.setItem("token", token);

          const storedToken = await AsyncStorage.getItem("token");
        console.log("Token in AsyncStorage after login:", storedToken);
      }
      console.log("User logged in:", res.data);
      // Don't show alert here - let component handle the modal
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      // Return error for component to handle
    },
  });
};

export const useLogoutEndPoint = () => {
  return useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem("token");
      return true;
    },
    onSuccess: () => {
      console.log("User logged out");
      // Don't show alert here - let component handle the modal
    },
    onError: (error: any) => {
      console.error("Logout error:", error);
      // Return error for component to handle
    },
  });
};
