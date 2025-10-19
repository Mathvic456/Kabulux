import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useRef, useState } from "react";

interface SocketContextValue {
  socket: WebSocket | null;
  isConnected: boolean;
}

export const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const ws = useRef<WebSocket | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load token ONCE on mount
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        console.log("🔐 Token loaded:", storedToken ? "✓ Found" : "✗ Not found");
        setToken(storedToken);
      } catch (err) {
        console.error("❌ Failed to load token:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  // Connect WebSocket when token is available
  useEffect(() => {
    if (isLoading) {
      console.log("⏳ Still loading token...");
      return;
    }

    if (!token) {
      console.log("⚠️ No token available, skipping WebSocket connection");
      return;
    }

    console.log("🔑 Connecting WebSocket with token:", token);

    ws.current = new WebSocket(`wss://api.kabluxe.com/api/v1/ws/?token=${token}`);

    ws.current.onopen = () => {
      console.log("✅ Connected to WebSocket");
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 WS message:", data);
    };

    ws.current.onclose = () => {
      console.log("🚪 WS closed");
      setIsConnected(false);
    };

    ws.current.onerror = (err) => {
      console.error("⚠️ WS error:", err);
      setIsConnected(false);
    };

    return () => {
      console.log("🧹 Closing WebSocket");
      ws.current?.close();
    };
  }, [token, isLoading]);

  return (
    <SocketContext.Provider value={{ socket: ws.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};