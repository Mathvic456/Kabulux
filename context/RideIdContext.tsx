import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface RideIdContextValue {
  rideId: string | null;
  setRideId: (id: string | null) => void;
}

const RIDE_ID_KEY = '@current_ride_id';

export const RideIdContext = createContext<RideIdContextValue>({
  rideId: null,
  setRideId: () => {},
});

export const useRideId = () => useContext(RideIdContext);

export const RideIdProvider = ({ children }: { children: React.ReactNode }) => {
  const [rideId, setRideId] = useState<string | null>(null);

  // Load persisted rideId on mount
  useEffect(() => {
    const loadRideId = async () => {
      try {
        const saved = await AsyncStorage.getItem(RIDE_ID_KEY);
        if (saved) {
          console.log("💾 [RIDE_ID] Restored:", saved);
          setRideId(saved);
        }
      } catch (error) {
        console.error("❌ [RIDE_ID] Failed to load:", error);
      }
    };
    loadRideId();
  }, []);

  // Persist rideId when it changes
  const updateRideId = async (newId: string | null) => {
    console.log("🔄 [RIDE_ID] Updating to:", newId);
    setRideId(newId);
    
    if (newId) {
      await AsyncStorage.setItem(RIDE_ID_KEY, newId);
    } else {
      await AsyncStorage.removeItem(RIDE_ID_KEY);
    }
  };

  return (
    <RideIdContext.Provider value={{ rideId, setRideId: updateRideId }}>
      {children}
    </RideIdContext.Provider>
  );
};