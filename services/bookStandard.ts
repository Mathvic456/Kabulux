import { SocketContext } from "@/context/WebSocketProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { api } from "./api";

export const useBookStandard = () => {
  const { socket, isConnected } = useContext(SocketContext);

  const sendSubscription = (socket: WebSocket, rideId: string, attempt = 0) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "subscribe_driver_offer_view",
          data: { ride_id: rideId },
        })
      );
      console.log("📡 Subscribed to driver offer updates");
      return;
    }

    if (attempt < 5) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // exponential backoff, max 5s
      console.warn(`⚠️ WebSocket not ready, retrying in ${delay}ms... (attempt ${attempt + 1})`);
      setTimeout(() => sendSubscription(socket, rideId, attempt + 1), delay);
    } else {
      console.error("❌ Failed to subscribe after max retries");
    }
  };

  return useMutation({
    mutationFn: async (data: { rider_offer: number }) => {
      const rideId = await AsyncStorage.getItem("ride_request_id");
      if (!rideId) throw new Error("Ride ID not found in AsyncStorage");

      const response = await api.patch(`rides/requests/${rideId}/book/standard/`, data);
      return { response, rideId };
    },

    onSuccess: ({ response, rideId }) => {
      console.log("✅ Rider offer submitted:", response.data);
      sendSubscription(socket, rideId);
    },

    onError: (error: any) => {
      console.error("❌ Booking error:", error.response?.data || error);
    },
  });
};