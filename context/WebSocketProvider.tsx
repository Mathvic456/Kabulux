import Constants from "expo-constants";
import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";

// ... [Keep your interfaces DriverOffer, QueuedMessage etc. exactly as they were] ...
// Re-declaring specific interfaces for clarity in the snippet
interface DriverOffer {
  id: string;
  ride_request_id: string;
  driver_id: string;
  driver_name?: string;
  driver_rating?: string | number;
  counter_offer: number;
  negotiated_price: number;
  status?: string;
  timestamp: number;
}

interface RideAcceptedData {
  ride_id?: string;
  driver_id?: string;
  driver_name?: string;
  message?: string;
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

export const SocketContext = createContext<SocketContextValue>({} as any);

const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_DELAY = 30000;
// const HEARTBEAT_INTERVAL = 30000; // Commented out - backend doesn't support ping yet

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [driverOffers, setDriverOffers] = useState<Record<string, DriverOffer>>({});
  const [rideAccepted, setRideAccepted] = useState<RideAcceptedData | null>(null);
  const [messageQueue, setMessageQueue] = useState<any[]>([]);
  const { token, getValidToken, isTokenExpired } = useAuth();
  
  // Refs for management
  const shouldReconnect = useRef(true);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  // const heartbeatInterval = useRef<NodeJS.Timeout | null>(null); // Commented out - no ping yet
  const isReconnecting = useRef(false);

  // Send Message Logic
  const sendMessage = useCallback(async (payload: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify(payload));
        console.log("📡 [WSP] Sent:", JSON.stringify(payload));
      } catch (e) {
        console.error("❌ [WSP] Send error", e);
        throw e;
      }
    } else {
      console.warn("⚠️ [WSP] Socket not ready. Queueing...");
      setMessageQueue(prev => [...prev, payload]);
    }
  }, [socket]);

  // Handle Incoming Messages
  const handleWsMessage = useCallback((event: MessageEvent) => {
    if (!event?.data) return;
    
    // LOG RAW MESSAGE FIRST - before any processing
    console.log(`📩 [WSP] RAW MESSAGE:`, event.data);
    
    try {
      const msg = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      
      // Log parsed message
      console.log(`📩 [WSP] PARSED:`, JSON.stringify(msg));
      
      // Skip pong responses (for future when backend implements ping/pong)
      // if (msg.type === "pong") return;

      // 1. Notify Wrapper
      if (msg.type === "notify" && msg.data) {
        const payload = msg.data;
        const innerType = payload.type || payload.event;

        // RIDE ACCEPTED (Driver on way)
        if (innerType === "DRIVER_ON_WAY") {
          console.log("🎉 [WSP] DRIVER_ON_WAY Detected!");
          setRideAccepted({
            ride_id: payload.ride_id,
            driver_id: payload.driver_id,
            driver_name: payload.message?.split(" has accepted")[0] || "Driver",
            message: payload.message,
            notification_id: payload.notification_id,
          });
          // Also clear offers as they are no longer needed
          setDriverOffers({});
        }

        // DRIVER OFFER
        if (innerType === "driver_offer") {
          const message = payload.message || "";
          const priceMatch = message.match(/₦\s*([\d,]+)/);
          const rawAmount = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ''), 10) : 0;
          
          const offer: DriverOffer = {
            id: payload.offer_id || payload.id,
            ride_request_id: payload.ride_request_id,
            driver_id: payload.driver_id || payload.offer_id, 
            driver_name: message.split(" offered")[0] || "Driver",
            counter_offer: rawAmount,
            negotiated_price: rawAmount,
            timestamp: Date.now(),
            status: 'pending'
          };
          setDriverOffers(prev => ({ ...prev, [offer.id]: offer }));
        }
      }

      // 2. Direct Offer Message
      if (msg.type === "driver_offer" && msg.data) {
        const payload = msg.data;
        setDriverOffers(prev => ({
          ...prev,
          [payload.id]: {
             id: String(payload.id),
             ride_request_id: String(payload.ride_request_id),
             driver_id: String(payload.driver_id),
             driver_name: payload.driver_name,
             driver_rating: payload.driver_rating,
             counter_offer: Number(payload.counter_offer),
             negotiated_price: Number(payload.counter_offer),
             timestamp: Date.now(),
             status: payload.status
          }
        }));
      }

      // 3. Direct Ride Success (Legacy/Fallback)
      if (msg.type === "accept_ride_success") {
        setRideAccepted({ ride_id: msg.ride_id });
        setDriverOffers({});
      }

    } catch (e) {
      console.error("❌ [WSP] Parse Error:", e);
    }
  }, []);

  // Connection Logic
  const connectWebSocket = useCallback(async () => {
    if (isReconnecting.current) return;
    isReconnecting.current = true;

    try {
      const accessToken = await getValidToken();
      if (!accessToken) throw new Error("No token");

      const wsUrl = `${WSS_URL}?token=${accessToken}`;
      console.log("🔌 [WSP] Connecting to", WSS_URL);
      
      const newSocket = new WebSocket(wsUrl);

      newSocket.onopen = () => {
        console.log("✅ [WSP] Connected");
        setIsConnected(true);
        isReconnecting.current = false;
        reconnectAttempts.current = 0;
        
        // Process Queue
        messageQueue.forEach(msg => newSocket.send(JSON.stringify(msg)));
        setMessageQueue([]);

        // Heartbeat/Ping - Commented out until backend implements it
        // if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
        // heartbeatInterval.current = setInterval(() => {
        //   if (newSocket.readyState === WebSocket.OPEN) {
        //     newSocket.send(JSON.stringify({ type: "ping" }));
        //     console.log("💓 [WSP] Ping sent");
        //   }
        // }, HEARTBEAT_INTERVAL);
      };

      newSocket.onmessage = handleWsMessage;
      
      newSocket.onclose = () => {
        console.log("🔌 [WSP] Closed");
        setIsConnected(false);
        
        // Clear heartbeat
        // if (heartbeatInterval.current) {
        //   clearInterval(heartbeatInterval.current);
        //   heartbeatInterval.current = null;
        // }
        
        // Reconnect logic
        if (shouldReconnect.current) {
           const delay = Math.min(RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current), MAX_RECONNECT_DELAY);
           console.log(`🔄 [WSP] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1})`);
           reconnectAttempts.current++;
           reconnectTimeout.current = setTimeout(() => {
             isReconnecting.current = false;
             connectWebSocket();
           }, delay);
        }
      };

      newSocket.onerror = (e) => {
        console.error("❌ [WSP] Error:", e);
        // Network check could go here
        // Example: NetInfo.fetch().then(state => console.log("Network:", state.isConnected));
      };
      
      setSocket(newSocket);

    } catch (e) {
      console.error("❌ [WSP] Connection failed", e);
      isReconnecting.current = false;
      // Could add network check here too
    }
  }, [getValidToken, handleWsMessage, messageQueue]);

  useEffect(() => {
    if (token) connectWebSocket();
    return () => {
      shouldReconnect.current = false;
      // if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      socket?.close();
    };
  }, [token]);

  const subscribeToRideOffers = useCallback((id: string) => {
    sendMessage({ type: "subscribe_driver_offer_view", data: { ride_request_id: id } });
  }, [sendMessage]);

  return (
    <SocketContext.Provider value={{
      socket, 
      isConnected, 
      driverOffers, 
      rideAccepted,
      sendMessage, 
      clearDriverOffers: () => setDriverOffers({}),
      clearRideAccepted: () => setRideAccepted(null),
      reconnect: () => { 
        socket?.close(); 
        connectWebSocket(); 
      },
      queuedMessageCount: messageQueue.length,
      subscribeToRideOffers
    }}>
      {children}
    </SocketContext.Provider>
  );
};