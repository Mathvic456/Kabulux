import { useMutation } from "@tanstack/react-query";
import { api } from "./api";

export const usePasswordReset = () => {
    return useMutation({
        mutationFn: (data: { new_password: string, email: string, otp: string }) =>
            api.post("auth/password_reset_confirm/", data),
        onSuccess: (res) => {
            console.log("Password has been reset! 💥✨✨")
        },
        onError: (e) => {
            console.log("An error has occured", e);
        }
    })

}
export const useResendOTP = () => {
    return useMutation({
        mutationFn: (data: { email: string }) =>
            api.post("auth/resend_otp/", data),
        onSuccess: (res) => {
            console.log("OTP has been resent! 💥✨✨")
        },
        onError: (e) => {
            console.log("An error has occured", e);
        }
    })

}
