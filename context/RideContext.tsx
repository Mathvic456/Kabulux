import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { API_URL, SocketContext } from "./WebSocketProvider";

interface DriverDetails {
  name: string;
  car: string;
  plate: string;
  avatar?: string;
}

type RideStatus =
  | "idle"
  | "accepted"
  | "driver_on_way"
//  | "on_ride"
  | "completed";

interface RideState {
  rideId: string | null;
  driverId: string | null;
  status: RideStatus;
}

const defaultState: RideState = {
  rideId: null,
  driverId: null,
  status: "idle",
};

export const RideContext = createContext({
  ...defaultState,
  resetRide: () => {},
  loadPersisted: () => {},
  handleWsEvent: (_data: any) => {},
});

export const RideProvider = ({ children }: { children: React.ReactNode }) => {
  const [rideState, setRideState] = useState<RideState>(defaultState);
  const { socket } = useContext(SocketContext);

  const persist = async (newState: RideState) => {
    setRideState(newState);
    await AsyncStorage.setItem("RIDE_STATE", JSON.stringify(newState));
  };

  // --- LOAD ON APP START ---
  const loadPersisted = async () => {
    const saved = await AsyncStorage.getItem("RIDE_STATE");
    console.log("SAVED STATE?:", saved)
    if (saved) setRideState(JSON.parse(saved));
  };


const loadRideDetails = async (rideId: string) => {
try {
  const response = await fetch(`${API_URL}rides/${rideId}/details/`);
  const text = await response.text();
  console.log("Driver fetch raw response:", text);
} catch (e) {
  console.error("Driver fetch failed:", e);
}

};

  const handleWsEvent = async (data: any) => {
    console.log("RIDE EVENT:", data);

    switch (data.event || data.type) {
      case "accept_ride_success":
        return persist({
          rideId: data.ride_id,
          driverId: data.driver_id,
          status: "accepted",
        });

      case "ride_accepted":
        persist({
          rideId: data.payload.ride_id,
          driverId: data.payload.driver_id,
          status: "accepted",
        });
        loadRideDetails(data.payload.ride_id);
        return;

      case "driver_on_way":
        return persist({
          rideId: data.payload.ride_id,
          driverId: data.payload.driver_id,
          status: "driver_on_way",
        });

     /* case "ride_started":
        return persist({
          ...rideState,
          status: "on_ride",
        });*/

      case "ride_completed":
        return persist({
          rideId: data.payload.ride_id,
          driverId: data.payload.driver_id,
          status: "completed",
        });
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);

        handleWsEvent(data);

      } catch (e) {
        console.log("WS parse error:", e);
      }
    };
  }, [socket, rideState]);

  const resetRide = async () => {
    setRideState(defaultState);
    await AsyncStorage.removeItem("RIDE_STATE");
  };

  return (
    <RideContext.Provider
      value={{
        ...rideState,
        resetRide,
        loadPersisted,
        handleWsEvent,
      }}
    >
      {children}
    </RideContext.Provider>
  );
};
