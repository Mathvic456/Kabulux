import { useMutation } from "@tanstack/react-query";
import { api } from "./api";

export const useForgotPassword = () => {
 return useMutation({
    mutationFn: (data: {email: string}) =>
        api.post("auth/forget_password/", data),
    onSuccess: (res) => {
        console.log("OTP sent successfully ✨✨")
    },
    onError: (e) => {
        console.log("An error has occured", e);
    }
    })

}
   