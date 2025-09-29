import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export type RideHistoryItem = {
  id: number;
};

export type RideHistoryResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: RideHistoryItem[];
};

export const useRideHistory = () => {
  return useQuery({
    queryKey: ["rideHistory"],
    queryFn: async () => {
      const res = await api.get<{ data: RideHistoryResponse }>(
        "rides/history/"
      );
      return res.data.data;
    },
  });
};
