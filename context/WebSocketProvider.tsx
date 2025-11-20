import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { jwtDecode } from "jwt-decode";
import React, { createContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

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
  const shouldReconnect = useRef(true);
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





  useEffect(() => {
    const init = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      if (storedToken) setToken(storedToken);
    };

    init();

  const subscription = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      console.log("App returned to foreground");

      if (token && !isExpired(token)) {
        console.log("Reconnecting WS after resume...");
        connectWebSocket(token);
      }
    } else {
      // App went background — close WS but allow reconnect on resume
      console.log("App in background, closing WS gracefully");
      ws.current?.close();
    }
  });

  return () => {
    subscription.remove();
    shouldReconnect.current = false;
    ws.current?.close();
  };
}, []);



  

  useEffect(() => {
    if (token && !isExpired(token)) connectWebSocket(token);
  }, [token]);

  const handleWsMessage = (event: MessageEvent) => {
    if (!event?.data) return;

    try {
      const data = JSON.parse(event.data);

      if (data.type === "driver_offer" && data.data) {
        const newOffer: DriverOffer = {
          driver_name: data.data.driver_name,
          offer: data.data.offer,
        };

        setDriverResponses((prev) => {
          const index = prev.findIndex((d) => d.driver_name === newOffer.driver_name);

          if (index > -1) {
            const updated = [...prev];
            updated[index] = newOffer;
            return updated;
          }

          return [...prev, newOffer];
        });
      }
    } catch (error) {
      console.error("Failed WS parse:", error);
    }
  };

  const connectWebSocket = (accessToken: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.close();
    }

    if (isExpired(accessToken)) {
      console.warn("❌ Token expired — skipping WS connection.");
      return;
    }

    const socket = new WebSocket(`${WSS_URL}?token=${accessToken}`);
    ws.current = socket;

    socket.onopen = () => {
      console.log("WS connected");
      setIsConnected(true);
    };

    socket.onmessage = handleWsMessage;

    socket.onclose = (event) => {
      console.log("WS closed:", event.code, event.reason);
      setIsConnected(false);

      if (event.code === 4001 || event.code === 4003) {
        console.warn("❌ WS closed due to invalid/expired token — not reconnecting.");
        return;
      }

      if (shouldReconnect.current && !isExpired(accessToken)) {
        console.log("Reconnecting in 3s…");
        setTimeout(() => connectWebSocket(accessToken), 3000);
      }
    };

    socket.onerror = (err) => {
      console.error("WS error:", err);
      setIsConnected(false);
    };
  };

  const setTokenFromOutside = (newToken: string) => {
    setToken(newToken); 
  };

  const clearDriverResponses = () => setDriverResponses([]);

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
