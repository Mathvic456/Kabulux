// services/rideHistory.service.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export type RideHistoryItem = {
  id: number;
  // Add actual fields from your backend when available
  vehicle?: {
    model: string;
    type: string;
  };
  driver?: {
    name: string;
  };
  createdAt?: string;
  date?: string;
  rating?: number;
  type?: string;
  status?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  price?: number;
};

export type RideHistoryResponse = {
  status: string;
  message: string;
  count: number;
  next: string | null;
  previous: string | null;
  results: RideHistoryItem[];
};

export const useRideHistory = () => {
  return useQuery({
    queryKey: ["rideHistory"],
    queryFn: async (): Promise<RideHistoryResponse> => {
      try {
        console.log("🔄 Fetching ride history...");
        const res = await api.get<RideHistoryResponse>("rides/history/");
        console.log("📦 Ride history response:", res.data);
        return res.data; // Directly return res.data, not res.data.data
      } catch (error: any) {
        console.error("🚨 Ride history fetch error:", error);
        
        if (error.response?.status === 401) {
          throw new Error("Authentication failed. Please login again.");
        } else {
          throw new Error("Failed to load ride history. Please try again.");
        }
      }
    },
    retry: 1,
  });
};