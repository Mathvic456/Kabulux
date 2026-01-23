import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { api } from "./api";

interface CancelRideResponse {
  success: boolean;
}

export const useCancelRideRequest = () => {
  return useMutation<CancelRideResponse, Error, void>({
    mutationFn: async () => {
      const rideId = await AsyncStorage.getItem("ride_request_id");

      if (!rideId) {
        throw new Error("Ride ID not found in AsyncStorage");
      }

      console.log("🗑️ Sending cancel request for ID:", rideId);
      const response = await api.patch(`rides/requests/${rideId}/cancel/`);

      console.log("📥 Cancel response status:", response.status);

      return { success: true };
    },

    onSuccess: () => {
      console.log("Ride request cancelled successfully");
      AsyncStorage.removeItem("ride_request_id").catch((err) =>
        console.warn("Failed to clear async storage", err),
      );
    },

    onError: (error: any) => {
      console.error("❌ Cancel error:", error);

      if (error.response) {
        console.error("Error response data:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
    },
  });
};
