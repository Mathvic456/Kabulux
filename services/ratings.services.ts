import { useMutation } from "@tanstack/react-query";
import { api } from "./api";

interface RateRideParams {
  rideId: string;
  rating: number; // 1-5
  comments: string;
  role: "driver" | "rider";
}

export const useRateRideEndPoint = () => {
  return useMutation({
    mutationFn: ({ rideId, ...body }: RateRideParams) =>{
        console.log(body);
        return api.post(`rides/${rideId}/rate/`, body)
    },
    onSuccess: (res) => {
      console.log("✅ Ride rated successfully:", res.data);
    },

    onError: (error: any) => {
      console.error("❌ Failed to rate ride:", error.response?.data || error);
    },
  });
};