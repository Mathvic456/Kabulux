import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export const useUpdateRiderProfile = (userId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      
      profile_picture?: string | null;
      ride_preference?: string;  // Changed from object to string
      security_preference?: string;  // Changed from object to string
    }) => {
      console.log("\n🔄 [useUpdateRiderProfile] Mutation initiated");
      console.log("📊 UserId parameter:", userId);
      console.log("📤 Request data:", JSON.stringify(data, null, 2));
      console.log("🌐 Full URL being called:", `rider_profile/${userId}`);
      return api.patch(`rider_profile/${userId}/`, data);
    },

    onSuccess: (res) => {
      console.log("✅ Rider profile updated:", res.data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },

    onError: (error: any) => {
      console.error("❌ Rider profile update failed:", error.response?.data || error);
    },
  });
};