import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

// 1. Raw API Shape (Matches your JSON Log exactly)
export interface RideHistoryAPIItem {
  driver: string; 
  rider: string;  
  pickup_address: string; 
  dropoff_address: string;
  fare: number;
  start_time: string;
  end_time: string;
  status: string; 
}

// 2. Response Wrapper
export interface RideHistoryResponse {
  count: number;
  message: string;
  next: string | null;
  previous: string | null;
  results: RideHistoryAPIItem[];
  status: string;
}

export const useRideHistory = (enabled: boolean) => {
  return useQuery({
    queryKey: ["rideHistory"],
    queryFn: async () => {
      // Return the full response object
      const { data } = await api.get<RideHistoryResponse>("rides/history/");
      return data;
    },
    enabled,
  });
};