import { useMutation } from "@tanstack/react-query";
import { api } from "./api";

interface CancelRideParams {
  rideId: string;
  reason: string;
}

export const useCancelRideEndPoint = () => {
  return useMutation({
    mutationFn: ({ rideId, reason }: CancelRideParams) => {
      console.log(`🚫 Cancelling ride: ${rideId}, Reason: ${reason}`);
      return api.post(`rides/${rideId}/cancel_ride/`, { reason });
    },
    onSuccess: (res) => {
      console.log("Ride cancelled successfully:", res.data);
    },
    onError: (error: any) => {
      console.error("❌ Failed to cancel ride:", error.response?.data || error);
    },
  });
};
