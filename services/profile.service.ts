import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import { ProfileResponse } from "./type";

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        console.log("📥 [Profile] Fetching user profile...");
        const response = await api.get<{ data: ProfileResponse }>("users/me");
        console.log(
          "[Profile] Profile fetched successfully:",
          response.data.data,
        );
        return response.data.data;
      } catch (error: any) {
        console.error(
          "❌ [Profile] Error fetching profile:",
          error.response?.data || error.message,
        );
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
};

//Check123check**
