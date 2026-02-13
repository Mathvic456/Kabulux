import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRideId } from "./RideIdContext";
import { SocketContext } from "./WebSocketProvider";

// 1. Granular States
export type RideState =
  | "idle"
  | "negotiating"
  | "driver_on_way"
  | "driver_arrived"
  | "in_progress"
  | "completed";

interface DriverLocation {
  lat: number;
  lng: number;
}

interface RideContextValue {
  rideState: RideState;
  driverLocation: DriverLocation | null;
  resetRide: () => Promise<void>;
}

const STORAGE_KEYS = {
  RIDE_STATE: "@ride_state",
  RIDE_ID: "@ride_id",
  DRIVER_LOC: "@driver_loc",
};

export const RideContext = createContext<RideContextValue>({
  rideState: "idle",
  driverLocation: null,
  resetRide: async () => { },
});

export const useRide = () => useContext(RideContext);

export const RideProvider = ({ children }: { children: React.ReactNode }) => {
  const [rideState, setRideState] = useState<RideState>("idle");
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(
    null,
  );
  const { rideId, setRideId } = useRideId();
  const { socket } = useContext(SocketContext);

  // Helper to persist state updates
  const updateRideState = async (newState: RideState, newRideId?: string) => {
    console.log(`🔄 [RIDE_STATE_CHANGE] ${rideState} -> ${newState}`);
    setRideState(newState);
    await AsyncStorage.setItem(STORAGE_KEYS.RIDE_STATE, newState);

    if (newRideId) {
      setRideId(newRideId); // This now uses the shared context
    }
  };

  // Hydrate on mount
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
        if (savedId[1]) setRideId(savedId[1]);
        if (savedLoc[1]) setDriverLocation(JSON.parse(savedLoc[1]));
      } catch (error) {
        console.error("❌ [RIDE] Failed to load persisted state:", error);
      }
    };
    loadPersistedState();
  }, []);

  const handleWsMessage = useCallback(
    (event: MessageEvent) => {
      if (!event?.data) return;

      try {
        const msg =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        // Handle broadcast_location messages (FIXED!)
        if (msg.type === "broadcast_location" && msg.data) {
          const newLocation = { lat: msg.data.lat, lng: msg.data.lng };
          console.log("[RIDE] Driver location updated:", newLocation);
          setDriverLocation(newLocation);
          AsyncStorage.setItem(
            STORAGE_KEYS.DRIVER_LOC,
            JSON.stringify(newLocation),
          );

          // If we get location updates but state is idle, transition to driver_on_way
          if (rideState === "idle") {
            console.log(
              "[RIDE] Transitioning from idle to driver_on_way due to location update",
            );
            updateRideState("driver_on_way");
          }
          return;
        }

        if (msg.type === "notify" && msg.data) {
          const eventType = msg.data.type || msg.data.event;
          const payload = msg.data;

          console.log(`🔍 [RIDE] Processing Event: ${eventType}`, payload);

          switch (eventType) {
            case "DRIVER_ON_WAY":
              if (rideState !== "driver_on_way") {
                updateRideState("driver_on_way", payload.ride_id);
              }
              break;

            case "driver_arrived":
              if (rideState !== "driver_arrived") {
                updateRideState("driver_arrived");
              }
              break;

            case "ride_started":
              if (rideState !== "in_progress") {
                updateRideState("in_progress");
              }
              break;

            case "ride_completed":
              console.log(
                "🏁 [RIDE] Ride completed - waiting for user acknowledgement",
              );
              if (rideState !== "completed") {
                updateRideState("completed");
              }
              break;
            default:
              break;
          }
        }
      } catch (error) {
        console.error("❌ [RIDE] Failed to parse message:", error);
      }
    },
    [rideState]
  );

  const resetRide = async () => {
    console.log("🧹 [RIDE] Resetting ride context to IDLE");
    setRideState("idle");
    setDriverLocation(null);
    setRideId(null);
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.RIDE_STATE,
      STORAGE_KEYS.RIDE_ID,
      STORAGE_KEYS.DRIVER_LOC,
    ]);
  };

  useEffect(() => {
    if (!socket) return;
    socket.addEventListener("message", handleWsMessage);
    return () => {
      socket.removeEventListener("message", handleWsMessage);
    };
  }, [socket, handleWsMessage]);

  return (
    <RideContext.Provider value={{ rideState, driverLocation, resetRide }}>
      {children}
    </RideContext.Provider>
  );
};
