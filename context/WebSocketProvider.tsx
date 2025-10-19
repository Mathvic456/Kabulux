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

  // Watch token changes from AsyncStorage
  useEffect(() => {
    const initToken = async () => {
      const storedToken = await AsyncStorage.getItem("auth_token");
      setToken(storedToken);
    };

    // Listen for login changes
    const interval = setInterval(initToken, 500); // simple polling
    initToken();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!token) return;

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
      console.log("🧹 Closing old WS");
      ws.current?.close();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket: ws.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
