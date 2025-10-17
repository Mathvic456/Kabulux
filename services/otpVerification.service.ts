import { useMutation } from "@tanstack/react-query";
import { api } from "./api";

export const useVerifyOtpEndPoint = () => {
  return useMutation({
    mutationFn: (data: { email: string; otp: string }) =>
      api.post("auth/verify_otp/", data),

    onSuccess: (res) => {
      console.log("✅ OTP verified:", res.data);
      // maybe navigate to login or next step here
    },

    onError: (error: any) => {
      console.error("❌ OTP verification failed:", error.response?.data || error);
    },
  });
};
