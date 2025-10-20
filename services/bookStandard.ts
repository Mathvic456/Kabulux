import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { api } from "./api";

export const useBookStandard = () => {



  return useMutation({
    mutationFn: async (data: { rider_offer: number }) => {
      const rideId = await AsyncStorage.getItem("ride_request_id");
      if (!rideId) throw new Error("Ride ID not found in AsyncStorage");

      const response = await api.patch(`rides/requests/${rideId}/book/standard/`, data);
      return { response, rideId };
    },

    onSuccess: ({ response }) => {
      console.log("✅ Rider offer submitted:", response.data);
    },

    onError: (error: any) => {
      console.error("❌ Booking error:", error.response?.data || error);
    },
  });
};