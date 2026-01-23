import { useMutation } from "@tanstack/react-query";
import { api } from "./api";

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      api.post("/auth/change_password/", data),

    onSuccess: (res) => {
      console.log("Password changed successfully:", res.data);
    },

    onError: (error: any) => {
      console.error(
        "❌ Password change failed:",
        error.response?.data || error,
      );
    },
  });
};
