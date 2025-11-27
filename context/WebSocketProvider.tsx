import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { jwtDecode } from "jwt-decode";
import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
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
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [driverResponses, setDriverResponses] = useState<DriverOffer[]>([]);

  const isExpired = (token: string) => {
    try {
      const { exp } = jwtDecode<{ exp: number }>(token);
      const isExp = exp * 1000 < Date.now();
      console.log(`🔐 Token expiry check: ${isExp ? 'EXPIRED' : 'VALID'}`);
      return isExp;
    } catch (err) {
      console.error("❌ Token decode failed:", err);
      return true;
    }
  };

  const handleWsMessage = useCallback((event: MessageEvent) => {
    if (!event?.data) return;

    try {
      const data = JSON.parse(event.data);
      console.log("📨 WS Message received:", data.type);

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
      console.error("❌ Failed WS parse:", error);
    }
  }, []);

  const connectWebSocket = useCallback((accessToken: string) => {
    console.log("🔌 [connectWebSocket] Attempting connection...");
    
    // Clear any pending reconnect
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }

    // Close existing connection
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log("⚠️ Closing existing WS connection");
      ws.current.close();
    }

    // Validate token
    if (isExpired(accessToken)) {
      console.warn("❌ Token expired — skipping WS connection");
      return;
    }

    // Create new connection
    const wsUrl = `${WSS_URL}?token=${accessToken}`;
    console.log("🌐 Connecting to:", WSS_URL);
    console.log("🔑 Token (first 30 chars):", accessToken.substring(0, 30) + "...");
    
    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      console.log("✅ WS connected successfully");
      setIsConnected(true);
    };

    socket.onmessage = handleWsMessage;

    socket.onclose = (event) => {
      console.log(`🔴 WS closed - Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
      setIsConnected(false);

      // Don't reconnect on auth errors
      if (event.code === 4001 || event.code === 4003) {
        console.warn("❌ WS closed due to invalid/expired token — not reconnecting");
        return;
      }

      // Reconnect if allowed and token is valid
      if (shouldReconnect.current && !isExpired(accessToken)) {
        console.log("🔄 Scheduling reconnect in 3s...");
        reconnectTimeout.current = setTimeout(() => {
          console.log("🔄 Executing reconnect...");
          connectWebSocket(accessToken);
        }, 3000);
      }
    };

    socket.onerror = (err) => {
      console.error("❌ WS error:", err);
      setIsConnected(false);
    };
  }, [handleWsMessage]); // Only depends on handleWsMessage

  // Initialize token from storage
  useEffect(() => {
    const init = async () => {
      console.log("🚀 Initializing WebSocketProvider...");
      const storedToken = await AsyncStorage.getItem("token");
      if (storedToken) {
        console.log("✅ Token loaded from storage");
        setToken(storedToken);
      } else {
        console.warn("⚠️ No token found in storage");
      }
    };

    init();
  }, []);

  // Connect when token becomes available
  useEffect(() => {
    console.log(`🔄 Token changed: ${token ? 'Present' : 'Null'}`);
    if (token && !isExpired(token)) {
      connectWebSocket(token);
    }
  }, [token, connectWebSocket]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      console.log(`📱 App state changed: ${state}`);
      
      if (state === "active") {
        console.log("🟢 App returned to foreground");

        if (token && !isExpired(token)) {
          console.log("🔄 Reconnecting WS after resume...");
          connectWebSocket(token);
        } else {
          console.warn("⚠️ Cannot reconnect: Token invalid/expired");
        }
      } else {
        console.log("🟡 App in background, closing WS gracefully");
        if (ws.current) {
          ws.current.close();
        }
      }
    });

    return () => {
      console.log("🧹 Cleaning up WebSocketProvider...");
      subscription.remove();
      shouldReconnect.current = false;
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      ws.current?.close();
    };
  }, [token, connectWebSocket]);

  const setTokenFromOutside = useCallback((newToken: string) => {
    console.log("🔑 Token updated externally");
    setToken(newToken);
  }, []);

  const clearDriverResponses = useCallback(() => {
    console.log("🗑️ Clearing driver responses");
    setDriverResponses([]);
  }, []);

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