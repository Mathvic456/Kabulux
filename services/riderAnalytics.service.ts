import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export const useRiderAnalytics = () => {
  return useQuery({
    queryKey: ["rider_analytics"],
    queryFn: async () => {
      try {
        console.log("📊 [RiderAnalytics] Fetching rider analytics...");
        const response = await api.get(
          "users/rider_analytics/"
        );
        console.log(
          "✅ [RiderAnalytics] Data fetched:",
          response.data.data
        );
        return response.data.data;
      } catch (error: any) {
        console.error(
          "❌ [RiderAnalytics] Error fetching analytics:",
          error.response?.data || error.message
        );
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
};
