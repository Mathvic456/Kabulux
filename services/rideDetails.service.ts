import { useQuery } from "@tanstack/react-query";
import { api } from "./api"; // Ensure this path matches your project structure

export const rideKeys = {
  details: (id: string) => ["rides", "details", id] as const,
};

const fetchRideDetails = async (rideId: string) => {
  // console.log(`🔍 Fetching details for: ${rideId}`);
  const { data } = await api.get(`rides/${rideId}/details/`);
  return data;
};

export const useRideDetails = (rideId: string | null) => {
  return useQuery({
    queryKey: rideKeys.details(rideId || ""),
    queryFn: () => fetchRideDetails(rideId!),
    enabled: !!rideId, // Only fetch if rideId exists
    refetchInterval: 5000, // Optional: Poll every 5s to keep location/status fresh
  });
};