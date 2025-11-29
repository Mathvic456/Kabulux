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
      console.log("📨 [WS] Message received:", data.type);

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
    
    // Clear any pending reconnect
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }

    // Close existing connection
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log("⚠️ [WS] Closing existing connection");
      ws.current.close();
    }

    try {
      // Get valid token from AuthContext
      const accessToken = await getValidToken();

      if (!accessToken) {
        console.warn("❌ [WS] No valid token available - skipping connection");
        return;
      }

      // Validate token
      if (isTokenExpired(accessToken)) {
        console.warn("❌ [WS] Token expired - skipping connection");
        return;
      }

      // Create new connection
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
        console.log(`🔴 [WS] Closed - Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
        setIsConnected(false);

        // Don't reconnect on auth errors
        if (event.code === 4001 || event.code === 4003) {
          console.warn("❌ [WS] Closed due to invalid/expired token - not reconnecting");
          return;
        }

        // Reconnect if allowed
        if (shouldReconnect.current) {
          console.log("🔄 [WS] Scheduling reconnect in 3s...");
          reconnectTimeout.current = setTimeout(() => {
            console.log("🔄 [WS] Executing reconnect...");
            connectWebSocket();
          }, 3000);
        }
      };

      socket.onerror = (err) => {
        console.error("❌ [WS] Error:", err);
        setIsConnected(false);
      };
    } catch (error) {
      console.error("❌ [WS] Connection error:", error);
    }
  }, [getValidToken, isTokenExpired, handleWsMessage]);

  // Connect when component mounts and token becomes available
  useEffect(() => {
    console.log("🚀 [WS] Initializing WebSocketProvider...");
    connectWebSocket();
  }, [connectWebSocket]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      console.log(`📱 [WS] App state changed: ${state}`);
      
      if (state === "active") {
        console.log("🟢 [WS] App returned to foreground");
        console.log("🔄 [WS] Reconnecting after resume...");
        connectWebSocket();
      } else {
        console.log("🟡 [WS] App in background, closing gracefully");
        if (ws.current) {
          ws.current.close();
        }
      }
    });

    return () => {
      console.log("🧹 [WS] Cleaning up WebSocketProvider...");
      subscription.remove();
      shouldReconnect.current = false;
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      ws.current?.close();
    };
  }, [connectWebSocket]);

  const clearDriverResponses = useCallback(() => {
    console.log("🗑️ [WS] Clearing driver responses");
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