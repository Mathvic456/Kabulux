import Constants from "expo-constants";
import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { useAuth } from "./AuthContext";

interface DriverOffer {
  driver_name: string;
  offer: number;
}

if (!Constants.expoConfig?.extra?.wssUrl) {
  throw new Error("WSS URL missing in expoConfig.extra");
}

export const WSS_URL = Constants.expoConfig.extra.wssUrl;

interface SocketContextValue {
  socket: WebSocket | null;
  isConnected: boolean;
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
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [driverResponses, setDriverResponses] = useState<DriverOffer[]>([]);

  const { getValidToken, isTokenExpired } = useAuth();

  const handleWsMessage = useCallback((event: MessageEvent) => {
    if (!event?.data) return;

    try {
      const data = JSON.parse(event.data);
      console.log("📨 [WS] Full message:", JSON.stringify(data, null, 2));

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
      console.error("❌ [WS] Failed to parse message:", error);
    }
  }, []);

  const connectWebSocket = useCallback(async () => {
    console.log("🔌 [WS] Attempting connection...");
    
    // Clear any pending reconnect to prevent double loops
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log("⚠️ [WS] Closing existing connection");
      ws.current.close();
    }

    try {
      // 1. ATTEMPT TO GET TOKEN
      const accessToken = await getValidToken();

      // 2. CHECK TOKEN VALIDITY
      // If no token or expired, we DON'T return. We wait and try again.
      // This ensures we keep trying "at all costs" until a token appears.
      if (!accessToken || isTokenExpired(accessToken)) {
        console.warn("❌ [WS] Token invalid/missing. Retrying in 3s...");
        reconnectTimeout.current = setTimeout(connectWebSocket, 3000);
        return; 
      }

      const wsUrl = `${WSS_URL}?token=${accessToken}`;
      console.log("🌐 [WS] Connecting to:", WSS_URL);
      
      const socket = new WebSocket(wsUrl);
      ws.current = socket;

      socket.onopen = () => {
        console.log("✅ [WS] Connected successfully");
        setIsConnected(true);
      };

      socket.onmessage = handleWsMessage;

      socket.onclose = async (event) => {
        console.log(`🔴 [WS] Closed - Code: ${event.code}`);
        setIsConnected(false);

        // 3. REMOVED AUTH CHECK BLOCK
        // We removed the 'if (code === 4001)' block so it NEVER gives up.

        if (shouldReconnect.current) {
          console.log("🔄 [WS] Connection lost. Reconnecting in 3s...");
          reconnectTimeout.current = setTimeout(connectWebSocket, 3000);
        }
      };

      socket.onerror = (err) => {
        console.error("❌ [WS] Error:", err);
        // We let onclose handle the reconnection logic
        setIsConnected(false);
      };

    } catch (error) {
      console.error("❌ [WS] Fatal setup error:", error);
      // 4. CATCH BLOCK RECOVERY
      // If getValidToken crashes (e.g. AsyncStorage error), we still retry.
      if (shouldReconnect.current) {
         reconnectTimeout.current = setTimeout(connectWebSocket, 3000);
      }
    }
  }, [getValidToken, isTokenExpired, handleWsMessage]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      shouldReconnect.current = false;
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      ws.current?.close();
    };
  }, [connectWebSocket]);

  // Handle AppState changes (Foreground/Background)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        console.log("🟢 [WS] App active, ensuring connection...");
        shouldReconnect.current = true;
        connectWebSocket();
      } else if (state === "background") {
         // Optional: decide if you want to keep it alive in background
         // or close it to save battery. Currently closing it.
         console.log("🟡 [WS] App backgrounded");
         // We do NOT set shouldReconnect to false here, 
         // so if the OS keeps the app alive, it might try to reconnect.
         // But usually, we want to close explicit sockets to be safe:
         // ws.current?.close(); 
      }
    });

    return () => subscription.remove();
  }, [connectWebSocket]);

  const clearDriverResponses = useCallback(() => {
    setDriverResponses([]);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: ws.current,
        isConnected,
        driverResponses,
        clearDriverResponses,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};