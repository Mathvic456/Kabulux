import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { SocketContext } from "./WebSocketProvider";

type RideState = "idle" | "in_ride";

interface DriverLocation {
  lat: number;
  lng: number;
}

interface RideContextValue {
  rideState: RideState;
  driverLocation: DriverLocation | null;
  rideId: string | null;
}

// Storage Keys
const STORAGE_KEYS = {
  RIDE_STATE: '@ride_state',
  RIDE_ID: '@ride_id',
  DRIVER_LOC: '@driver_loc',
};

export const RideContext = createContext<RideContextValue>({
  rideState: "idle",
  driverLocation: null,
  rideId: null,
});

export const useRide = () => useContext(RideContext);

export const RideProvider = ({ children }: { children: React.ReactNode }) => {
  const [rideState, setRideState] = useState<RideState>("idle");
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [rideId, setRideId] = useState<string | null>(null);
  const { socket } = useContext(SocketContext);

  // 1. Hydrate state from storage on mount
  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        const [savedState, savedId, savedLoc] = await AsyncStorage.multiGet([
          STORAGE_KEYS.RIDE_STATE,
          STORAGE_KEYS.RIDE_ID,
          STORAGE_KEYS.DRIVER_LOC,
        ]);

        if (savedState[1]) {
          console.log("💾 [RIDE] Restoring state:", savedState[1]);
          setRideState(savedState[1] as RideState);
        }
        
        if (savedId[1]) {
          setRideId(savedId[1]);
        }
        
        if (savedLoc[1]) {
          setDriverLocation(JSON.parse(savedLoc[1]));
        }
      } catch (error) {
        console.error("❌ [RIDE] Failed to load persisted state:", error);
      }
    };
    
    loadPersistedState();
  }, []);

  const handleWsMessage = useCallback((event: MessageEvent) => {
    if (!event?.data) return;

    try {
      const data = JSON.parse(event.data);
      console.log("🚗 [RIDE] Message received:", data.type);

      if (data.type === "notify") {
        const eventType = data.event || data.data?.event || data.payload?.event;
        console.log("🔍 [RIDE] Processing notify event:", eventType);

        // Handle Ride Start
        if (eventType === "driver_on_way") {
          console.log("✅ [RIDE] Ride started:", eventType);
          
          const newRideId = data.payload?.ride_id || data.data?.ride_id || data.ride_id;
          
          // Update State
          setRideState("in_ride");
          if (newRideId) setRideId(newRideId);

          // Persist to Storage
          AsyncStorage.setItem(STORAGE_KEYS.RIDE_STATE, "in_ride");
          if (newRideId) AsyncStorage.setItem(STORAGE_KEYS.RIDE_ID, newRideId);
        }
        
        // Handle Ride Completion
        if (eventType === "ride_completed") {
          console.log("🏁 [RIDE] Ride completed");
          
          // Reset State
          setRideState("idle");
          setDriverLocation(null);
          setRideId(null);

          // Clear Storage
          AsyncStorage.multiRemove([
            STORAGE_KEYS.RIDE_STATE, 
            STORAGE_KEYS.RIDE_ID, 
            STORAGE_KEYS.DRIVER_LOC
          ]);
        }
      }

      // Handle Location Updates
      if (data.type === "broadcast_location" && data.lat && data.lng) {
        const newLocation = { lat: data.lat, lng: data.lng };
        
        // Update State
        setDriverLocation(newLocation);
        
        // Persist Location (so map shows driver immediately on app restart)
        AsyncStorage.setItem(STORAGE_KEYS.DRIVER_LOC, JSON.stringify(newLocation));
      }

    } catch (error) {
      console.error("❌ [RIDE] Failed to parse message:", error);
    }
  }, []);

  useEffect(() => {
    if (!socket) {
      console.log("⚠️ [RIDE] No socket connection");
      return;
    }

    console.log("🔌 [RIDE] Attaching message listener");
    socket.addEventListener("message", handleWsMessage);

    return () => {
      console.log("🧹 [RIDE] Removing message listener");
      socket.removeEventListener("message", handleWsMessage);
    };
  }, [socket, handleWsMessage]);

  return (
    <RideContext.Provider
      value={{
        rideState,
        driverLocation,
        rideId,
      }}
    >
      {children}
    </RideContext.Provider>
  );
};