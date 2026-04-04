import { useMutation } from "@tanstack/react-query";
import { api } from "./api";

interface RateRideParams {
  rideId: string;
  rating: number;
  comment: string;
  role: "driver" | "rider";
}

export const useRateRideEndPoint = () => {
  return useMutation({
    mutationFn: ({ rideId, ...body }: RateRideParams) => {
      return api.post(`rides/${rideId}/rate/`, { ...body });
    },
  });
};