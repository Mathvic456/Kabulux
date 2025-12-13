// import NetInfo from "@react-native-community/netinfo";   <-- REMOVED
import Constants from "expo-constants";
import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import { useAuth } from "./AuthContext";

interface DriverOffer {
  id: string;
  ride_request_id: string;
  driver_id: string;
  driver_name?: string;
  driver_rating?: string | number;
  counter_offer: number;
  negotiated_price: number;
  status?: string;
  expires_at?: string;
  timestamp: number;
}

interface QueuedMessage {
  id: string;
  payload: any;
  timestamp: number;
  retries: number;
}

interface RideAcceptedData {
  ride_id?: string;
  [key: string]: any;
}

if (!Constants.expoConfig?.extra?.wssUrl) {
  throw new Error("WSS URL missing in expoConfig.extra");
}

export const WSS_URL = Constants.expoConfig.extra.wssUrl;

interface SocketContextValue {
  socket: WebSocket | null;
  isConnected: boolean;
  driverOffers: Record<string, DriverOffer>;
  rideAccepted: RideAcceptedData | null;
  sendMessage: (payload: any) => Promise<void>;
  clearDriverOffers: () => void;
  clearRideAccepted: () => void;
  reconnect: () => void;
  queuedMessageCount: number;
  subscribeToRideOffers: (rideRequestId: string) => void;
}

export const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  driverOffers: {},
  rideAccepted: null,
  clearDriverOffers: () => {},
  clearRideAccepted: () => {},
  reconnect: () => {},
  sendMessage: async () => {},
  queuedMessageCount: 0,
  subscribeToRideOffers: () => {},
});

const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_DELAY = 30000;
const HEARTBEAT_INTERVAL = 30000;

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [driverOffers, setDriverOffers] = useState<Record<string, DriverOffer>>({});
  const [rideAccepted, setRideAccepted] = useState<RideAcceptedData | null>(null);
  const [messageQueue, setMessageQueue] = useState<QueuedMessage[]>([]);
  const messageQueueRef = useRef<QueuedMessage[]>([]);
  const { token } = useAuth();

  const shouldReconnect = useRef(true);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const isReconnecting = useRef(false);

  const { getValidToken, isTokenExpired } = useAuth();

  useEffect(() => {
    messageQueueRef.current = messageQueue;
  }, [messageQueue]);

  const sendMessage = useCallback(
    (payload: any): Promise<void> =>
      new Promise((resolve, reject) => {
        const message: QueuedMessage = {
          id: `${Date.now()}_${Math.random()}`,
          payload,
          timestamp: Date.now(),
          retries: 0,
        };

        if (socket && socket.readyState === WebSocket.OPEN) {
          try {
            socket.send(JSON.stringify(payload));
            console.log("📡 [WSP] Sent message:", payload.type);
            resolve();
          } catch (error) {
            console.error("❌ [WSP] Failed to send message:", error);
            setMessageQueue((prev) => [...prev, message]);
            reject(error);
          }
        } else {
          console.warn("⚠️ [WSP] Socket not open, queueing message");
          setMessageQueue((prev) => [...prev, message]);
          reject(new Error("Socket not connected"));
        }
      }),
    [socket]
  );

  const subscribeToRideOffers = useCallback(
    (rideRequestId: string) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.warn("⚠️ [WSP] Cannot subscribe, socket not open");
        return;
      }

      const msg = {
        type: "subscribe_driver_offer_view",
        data: { ride_request_id: rideRequestId },
      };

      sendMessage(msg).catch((err) => {
        console.error("❌ [WSP] Failed to subscribe to ride offers:", err);
      });
    },
    [socket, sendMessage]
  );

  // Process queue once socket opens
  useEffect(() => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    if (messageQueueRef.current.length === 0) return;

    const processQueue = async () => {
      const queue = [...messageQueueRef.current];
      const failed: QueuedMessage[] = [];

      for (const msg of queue) {
        try {
          socket.send(JSON.stringify(msg.payload));
          console.log("📤 [WSP] Processed queued message:", msg.payload.type);
          setMessageQueue((prev) => prev.filter((m) => m.id !== msg.id));
        } catch (error) {
          console.error("❌ [WSP] Failed to process queued message:", error);
          if (msg.retries < 3) {
            failed.push({ ...msg, retries: msg.retries + 1 });
          }
        }
      }

      if (failed.length > 0) {
        setMessageQueue((prev) => [
          ...prev.filter((m) => !queue.includes(m)),
          ...failed,
        ]);
      }
    };

    processQueue();
  }, [socket, isConnected]);

  const handleWsMessage = useCallback((event: MessageEvent) => {
    if (!event?.data) return;

    try {
      const data = JSON.parse(event.data);
      
      // Ignore pong messages
      if (data.type === "pong") return;

      console.log("📩 [WSP] Received message:", data.type, data.event);

      // Handle driver offers
      if (data.type === "driver_offer" && data.data) {
        const payload = data.data;

        if (!payload.id || !payload.driver_id) {
          console.warn("❌ [WSP] Invalid driver offer, missing required fields");
          return;
        }

        const offer: DriverOffer = {
          id: String(payload.id),
          ride_request_id: String(payload.ride_request_id),
          driver_id: String(payload.driver_id),
          driver_name: payload.driver_name || `Driver ${payload.driver_id.slice(0, 8)}`,
          driver_rating: payload.driver_rating || "4.5",
          counter_offer: Number(payload.counter_offer || 0),
          negotiated_price: Number(payload.counter_offer || 0),
          status: payload.status,
          expires_at: payload.expires_at,
          timestamp: Date.now(),
        };

        console.log("✅ [WSP] Adding/updating driver offer:", offer.id);
        setDriverOffers((prev) => ({
          ...prev,
          [offer.id]: offer,
        }));
      }

      // Handle ride accepted events
      if (data.event === "ride_accepted" || data.event === "accept_ride_success") {
        console.log("🎉 [WSP] Ride accepted event");
        setRideAccepted(data.data || { ride_id: data.ride_id });
      }

    } catch (error) {
      console.error("❌ [WSP] Failed to parse message:", error);
    }
  }, []);

  const cleanup = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
  }, []);

  const teardownSocket = useCallback(() => {
    console.log("🧹 [WSP] Tearing down websocket");

    shouldReconnect.current = false;
    isReconnecting.current = false;
    reconnectAttempts.current = 0;

    cleanup();

    setIsConnected(false);
    setDriverOffers({});
    setRideAccepted(null);
    setMessageQueue([]);

    if (socket) {
      try {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        socket.close();
      } catch {}
    }

    setSocket(null);
  }, [socket, cleanup]);

  useEffect(() => {
    if (!token) {
      console.log("🚪 [WSP] Auth token missing — shutting down socket");
      teardownSocket();
      return;
    }

    // token exists → ensure connection
    shouldReconnect.current = true;
    connectWebSocket();
  }, [token]);

  const startHeartbeat = useCallback(
    (ws: WebSocket) => {
      cleanup();
      heartbeatInterval.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify({ type: "ping" }));
          } catch {
            ws.close();
          }
        }
      }, HEARTBEAT_INTERVAL);
    },
    [cleanup]
  );

  const connectWebSocket = useCallback(async () => {
    if (isReconnecting.current) return;
    isReconnecting.current = true;
    cleanup();

    try {
      console.log("🔌 [WSP] Connecting websocket...");

      const accessToken = await getValidToken();
      if (!accessToken || isTokenExpired(accessToken)) {
        console.warn("⚠️ [WSP] Token invalid, retrying in 3s");
        isReconnecting.current = false;
        reconnectTimeout.current = setTimeout(connectWebSocket, 3000);
        return;
      }

      if (socket) {
        try {
          socket.close();
        } catch {}
      }

      const wsUrl = `${WSS_URL}?token=${accessToken}`;
      const newSocket = new WebSocket(wsUrl);

      newSocket.onopen = () => {
        console.log("✅ [WSP] WebSocket connected");
        setIsConnected(true);
        reconnectAttempts.current = 0;
        isReconnecting.current = false;
        startHeartbeat(newSocket);
      };

      newSocket.onmessage = handleWsMessage;

      newSocket.onclose = () => {
        console.log("🔌 [WSP] WebSocket closed");
        setIsConnected(false);
        cleanup();
        if (shouldReconnect.current) {
          const delay = Math.min(
            RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current),
            MAX_RECONNECT_DELAY
          );
          reconnectAttempts.current++;
          console.log(`🔄 [WSP] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);
          reconnectTimeout.current = setTimeout(() => {
            isReconnecting.current = false;
            connectWebSocket();
          }, delay);
        }
      };

      newSocket.onerror = (error) => {
        console.error("❌ [WSP] WebSocket error:", error);
        setIsConnected(false);
      };

      setSocket(newSocket);
    } catch (error) {
      console.error("❌ [WSP] Connection error:", error);
      isReconnecting.current = false;
      reconnectTimeout.current = setTimeout(connectWebSocket, RECONNECT_DELAY);
    }
  }, [socket, getValidToken, isTokenExpired, handleWsMessage, cleanup, startHeartbeat]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    console.log("🔄 [WSP] Manual reconnect triggered");
    reconnectAttempts.current = 0;
    isReconnecting.current = false;
    shouldReconnect.current = true;
    if (socket) socket.close();
    connectWebSocket();
  }, [socket, connectWebSocket]);

  // Initial mount
  useEffect(() => {
    connectWebSocket();
    return () => {
      shouldReconnect.current = false;
      cleanup();
      if (socket) {
        try {
          socket.close();
        } catch {}
      }
    };
  }, []);

  // AppState handler
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        console.log("📱 [WSP] App became active");
        shouldReconnect.current = true;
        if (!socket || socket.readyState !== WebSocket.OPEN) {
          reconnectAttempts.current = 0;
          connectWebSocket();
        }
      } else if (state === "background") {
        console.log("📱 [WSP] App went to background");
        if (Platform.OS === "ios") cleanup();
      }
    });

    return () => subscription.remove();
  }, [socket, connectWebSocket, cleanup]);

  const clearDriverOffers = useCallback(() => {
    console.log("🧹 [WSP] Clearing driver offers");
    setDriverOffers({});
  }, []);

  const clearRideAccepted = useCallback(() => {
    console.log("🧹 [WSP] Clearing ride accepted");
    setRideAccepted(null);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        driverOffers,
        rideAccepted,
        clearDriverOffers,
        clearRideAccepted,
        reconnect,
        sendMessage,
        queuedMessageCount: messageQueue.length,
        subscribeToRideOffers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};