import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { api } from "./api";

interface BookStandardPayload {
  rider_offer: number;
  payment_method: string;
}

interface BookStandardResponse {
  response: any;
  rideId: string;
}

export const useBookStandard = () => {
  return useMutation<BookStandardResponse, Error, BookStandardPayload>({
    mutationFn: async (data: BookStandardPayload) => {
      // Get ride_request_id from AsyncStorage
      const rideId = await AsyncStorage.getItem("ride_request_id");
      
      if (!rideId) {
        throw new Error("Ride ID not found in AsyncStorage");
      }

      // Validate payment method
      const validPaymentMethods = ["CASH", "CARD", "WALLET"];
      const upperPaymentMethod = data.payment_method.toUpperCase();
      
      if (!validPaymentMethods.includes(upperPaymentMethod)) {
        throw new Error(`Invalid payment method: ${data.payment_method}`);
      }

      // Ensure rider_offer is a number
      if (typeof data.rider_offer !== 'number' || isNaN(data.rider_offer)) {
        throw new Error("Rider offer must be a valid number");
      }

      const payload = {
        rider_offer: data.rider_offer,
        payment_method: upperPaymentMethod,
      };

      console.log("📤 Sending booking request:", {
        endpoint: `rides/requests/${rideId}/book/standard/`,
        payload,
      });

      const response = await api.patch(
        `rides/requests/${rideId}/book/standard/`,
        payload
      );

      console.log("📥 Booking response:", response.data);

      return { response, rideId };
    },

    onSuccess: ({ response, rideId }) => {
      console.log("✅ Rider offer submitted successfully");
      console.log("Ride ID:", rideId);
      console.log("Response data:", response.data);
    },

    onError: (error: any) => {
      console.error("❌ Booking error:", error);
      
      if (error.response) {
        // Server responded with error
        console.error("Error response data:", error.response.data);
        console.error("Error status:", error.response.status);
      } else if (error.request) {
        // Request made but no response
        console.error("No response received:", error.request);
      } else {
        // Something else went wrong
        console.error("Error message:", error.message);
      }
    },
  });
};