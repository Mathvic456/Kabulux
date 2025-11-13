import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { jwtDecode } from "jwt-decode";
import React, { createContext, useEffect, useRef, useState } from "react";

interface DriverOffer {
  driver_name: string;
  offer: number;
}

if (!Constants.expoConfig?.extra?.wssUrl || !Constants.expoConfig?.extra?.apiUrl) {
  throw new Error("WSS URL or API URL missing in expoConfig.extra");
}

export const WSS_URL = Constants.expoConfig.extra.wssUrl;
export const API_URL = Constants.expoConfig.extra.apiUrl;

interface SocketContextValue {
  socket: WebSocket | null;
  isConnected: boolean;
  setTokenFromOutside?: (token: string) => void;
  driverResponses: DriverOffer[];
  clearDriverResponses: () => void;
}

export const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  driverResponses: [],
  clearDriverResponses: () => {},
});

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [driverResponses, setDriverResponses] = useState<DriverOffer[]>([]);

  const isExpired = (token: string) => {
    try {
      const { exp } = jwtDecode<{ exp: number }>(token);
      return exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refresh = await AsyncStorage.getItem("refreshToken");
      if (!refresh) throw new Error("No refresh token");

      const res = await fetch(`${API_URL}auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      if (!res.ok) throw new Error("Failed to refresh");
      const data = await res.json();
      console.log(data);
      console.log("New token?", data.data.access);
      if (data.data.access) {
        await AsyncStorage.setItem("token", data.data.access);
        console.log("🔁 Token refreshed!");
        return data.data.access;
      }
      return null;
    } catch (err) {
      console.error("Token refresh failed:", err);
      return null;
    }
  };

  const handleWsMessage = (event: MessageEvent) => {
    try {
        const data = JSON.parse(event.data);
        console.log("📩 WS Message:", event.data);

        if (data.type === 'driver_offer' && data.data) {
            const newOffer: DriverOffer = {
                driver_name: data.data.driver_name,
                offer: data.data.offer,
            };

            setDriverResponses(prev => {
                const existingIndex = prev.findIndex(d => d.driver_name === newOffer.driver_name);

                if (existingIndex > -1) {
                    const updatedResponses = [...prev];
                    updatedResponses[existingIndex] = newOffer;
                    console.log(`Driver ${newOffer.driver_name} updated offer.`);
                    return updatedResponses;
                }
                
                console.log(`New offer received from ${newOffer.driver_name}.`);
                return [...prev, newOffer];
            });
        }

    } catch (error) {
        console.error("Failed to parse WS message:", error);
    }
  };


  const connectWebSocket = (accessToken: string) => {
    if (ws.current) {
      console.log("🔌 Closing existing WebSocket...");
      ws.current.close();
    }

    console.log("🔑 Connecting WebSocket with token:", accessToken);
    const socket = new WebSocket(`${WSS_URL}?token=${accessToken}`);
    ws.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      setIsConnected(true);
    };

    socket.onmessage = handleWsMessage;

    socket.onclose = () => {
      console.log("🚪 WS closed");
      setIsConnected(false);
    };

    socket.onerror = (err) => {
      console.error("⚠️ WS Error:", err);
      setIsConnected(false);
    };
  };


  useEffect(() => {
    const init = async () => {
      let storedToken = await AsyncStorage.getItem("token");
      console.log("🔐 Token found?", !!storedToken);

      // Refresh if expired
      if (!storedToken || isExpired(storedToken)) {
        console.log("🔁 Access token expired or missing, refreshing...");
        storedToken = await refreshAccessToken();
        console.log("Token refreshed!")
      }

      if (storedToken) {
        setToken(storedToken);
        connectWebSocket(storedToken);
      } else {
        console.log("🚫 No valid token, WebSocket not connected.");
      }
    };

    init();
    return () => ws.current?.close();
  }, []);

  
  const setTokenFromOutside = (newToken: string) => {
    setToken(newToken);
    connectWebSocket(newToken);
  };

  const clearDriverResponses = () => {
    setDriverResponses([]);
  };

  return (
    <SocketContext.Provider 
        value={{ 
            socket: ws.current, 
            isConnected, 
            setTokenFromOutside, 
            driverResponses,
            clearDriverResponses,
        }}
    >
      {children}
    </SocketContext.Provider>
  );
};
