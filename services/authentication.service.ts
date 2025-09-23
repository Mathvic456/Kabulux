import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import { api } from "./api";
import { CREATEACCOUNT_TYPE } from "./type";
export const useRegisterEndPoint = () => {
  return useMutation({
    mutationFn: (data: CREATEACCOUNT_TYPE) => api.post("auth/register/", data),
    onSuccess: () => {
      Alert.alert("Success", "Registered successfully!");
    },
    onError: (error) => {
      console.error("Registration error:", error);
      Alert.alert(
        "Registration Failed",
        // @ts-expect-error
        error?.response?.data?.message ||
          error.message ||
          "Unknown error occurred"
      );
    },
  });
};
export const useLoginEndPoint = () => {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post("auth/login/", data),
    onSuccess: async (res) => {
      const token = res.data?.token;
      if (token) {
        await AsyncStorage.setItem("token", token);
      }
      Alert.alert("Success", "Logged in successfully!");
      console.log("User logged in:", res.data);
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      Alert.alert(
        "Login Failed",
        error?.response?.data?.message || error.message || "Unknown error"
      );
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
      Alert.alert("Success", "Logged out successfully!");
      console.log("User logged out");
    },
    onError: (error: any) => {
      console.error("Logout error:", error);
      Alert.alert(
        "Logout Failed",
        error?.response?.data?.message || error.message || "Unknown error"
      );
    },
  });
};
