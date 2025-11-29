import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { Alert } from "react-native";
import { RideContext } from "../context/RideContext";
import { api } from "./api";

// ==================== Query Keys ====================
export const rideKeys = {
  all: ["rides"] as const,
  details: (id: string) => [...rideKeys.all, "details", id] as const,
  active: () => [...rideKeys.all, "active"] as const,
};


const fetchRideDetails = async (rideId: string) => {
  console.log(`🔍 Fetching ride details for ID: ${rideId}`);
  const { data } = await api.get(`rides/${rideId}/details/`);
  console.log("✅ Ride details fetched successfully:", data);
  return data;
};

const startRide = async (rideId: string) => {
  console.log(`🚗 Starting ride: ${rideId}`);
  const { data } = await api.patch(`rides/${rideId}/start/`);
  console.log("✅ Ride started successfully");
  return data;
};

const finishRide = async (rideId: string) => {
  console.log(`🏁 Finishing ride: ${rideId}`);
  const { data } = await api.patch(`rides/${rideId}/complete/`);
  console.log("✅ Ride finished successfully");
  return data;
};


export const useRideDetails = (
  rideId?: string | null,
  options?: {
    enabled?: boolean;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
  }
) => {
  const { rideId: contextRideId } = useContext(RideContext);
  const finalRideId = rideId || contextRideId;

  return useQuery({
    queryKey: rideKeys.details(finalRideId || ""),
    queryFn: () => fetchRideDetails(finalRideId!),
    enabled: !!finalRideId && (options?.enabled !== false),
    onSuccess: (data) => {
      console.log("📊 Ride details query success:", data);
      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      console.error("❌ Error fetching ride details:", error);
      options?.onError?.(error);
    },
    retry: 2,
    staleTime: 30000, // 30 seconds
    refetchInterval: 10000,
  });
};


export const useCurrentRide = () => {
  const context = useContext(RideContext);
  const { data: rideDetails, isLoading, refetch } = useRideDetails(
    context.rideId,
    {
      enabled: !!context.rideId && context.status !== "completed" && context.status !== "idle",
    }
  );

  return {
    ...context,
    rideDetails,
    isLoadingDetails: isLoading,
    refetchDetails: refetch,
  };
};

export const useStartRide = () => {
  const queryClient = useQueryClient();
  const { handleWsEvent } = useContext(RideContext);

  return useMutation({
    mutationFn: (rideId: string) => startRide(rideId),
    onSuccess: (data, rideId) => {
      console.log("✅ Ride started mutation successful");
      

      queryClient.invalidateQueries({ queryKey: rideKeys.details(rideId) });
      
      // Update context
      handleWsEvent({
        event: "ride_started",
        payload: { ride_id: rideId },
      });
      
      Alert.alert(
        "Ride Started",
        "You have arrived. Head to the destination!"
      );
    },
    onError: (error: any) => {
      console.error("❌ Error starting ride:", error);
      
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to start ride";
      
      Alert.alert("Error", errorMessage);
    },
  });
};


export const useFinishRide = () => {
  const queryClient = useQueryClient();
  const { handleWsEvent, resetRide } = useContext(RideContext);

  return useMutation({
    mutationFn: (rideId: string) => finishRide(rideId),
    onSuccess: (data, rideId) => {
      console.log("✅ Ride finished mutation successful");
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: rideKeys.details(rideId) });
      queryClient.invalidateQueries({ queryKey: rideKeys.active() });
      
      // Update context
      handleWsEvent({
        event: "ride_completed",
        payload: { ride_id: rideId },
      });
      
      Alert.alert(
        "Ride Completed",
        "The ride has been completed successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              // Reset ride after user acknowledges
              setTimeout(() => resetRide(), 1000);
            },
          },
        ]
      );
    },
    onError: (error: any) => {
      console.error("❌ Error finishing ride:", error);
      
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to finish ride";
      
      Alert.alert("Error", errorMessage);
    },
  });
};

import { useEffect } from "react";

export const useRideStatusMonitor = (callback: (status: string) => void) => {
  const { status } = useContext(RideContext);
  
  useEffect(() => {
    if (status) {
      callback(status);
    }
  }, [status, callback]);
};