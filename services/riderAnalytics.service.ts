import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export const useRiderAnalytics = () => {
  return useQuery({
    queryKey: ["rider_analytics"],
    queryFn: async () => {
      try {
        console.log("[RiderAnalytics] Fetching rider analytics...");
        const response = await api.get("users/rider_analytics/");
        console.log("[RiderAnalytics] Data fetched:", response.data.data);
        return response.data.data;
      } catch (error: any) {
        console.error(
          "❌ [RiderAnalytics] Error fetching analytics:",
          error.response?.data || error.message,
        );
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
};

export const useRedeemRewards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (points: number) => {
      console.log(
        `[RedeemRewards] Starting redemption for ${points} points...`,
      );

      const response = await api.post("rewards/redeem/", { points });

      console.log("[RedeemRewards] Response:", response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider_analytics"] });
    },
    onError: (error: any) => {
      console.error(
        "❌ [RedeemRewards] Error redeeming points:",
        error.response?.data || error.message,
      );
    },
  });
};
