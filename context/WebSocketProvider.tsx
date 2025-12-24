import NetInfo from "@react-native-community/netinfo";
import Constants from "expo-constants";
import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { useRideId } from './RideIdContext';

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

interface RideAcceptErrorData {
  message: string;
  offerId?: string;
}

if (!Constants.expoConfig?.extra?.wssUrl) {
  throw new Error("WSS URL missing in expoConfig.extra");
}

export const WSS_URL = Constants.expoConfig.extra.wssUrl;

interface SocketContextValue {
  socket: WebSocket | null;
  isConnected: boolean;
  isOnline: boolean;
  driverOffers: Record<string, DriverOffer>;
  rideAccepted: RideAcceptedData | null;
  rideAcceptError: RideAcceptErrorData | null;
  sendMessage: (payload: any) => Promise<void>;
  clearDriverOffers: () => void;
  clearRideAccepted: () => void;
  clearRideAcceptError: () => void;
  reconnect: () => void;
  queuedMessageCount: number;
  subscribeToRideOffers: (rideRequestId: string) => void;
  removeOffer: (id: string) => void;
  chatMessages: Record<string, any[]>;
  sendChatMessage: (rideId: string, text: string) => Promise<void>;
}

export const SocketContext = createContext<SocketContextValue>({} as any);

const RECONNECT_DELAY = 2000;
const MAX_RECONNECT_DELAY = 30000;
const MAX_RECONNECT_ATTEMPTS = 10;

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [driverOffers, setDriverOffers] = useState<Record<string, DriverOffer>>({});
  const [rideAccepted, setRideAccepted] = useState<RideAcceptedData | null>(null);
  const [rideAcceptError, setRideAcceptError] = useState<RideAcceptErrorData | null>(null);
  const [messageQueue, setMessageQueue] = useState<any[]>([]);
  const { token, getValidToken } = useAuth();
  const [chatMessages, setChatMessages] = useState<Record<string, any[]>>({});

  const { rideId } = useRideId();
  const currentRideIdRef = useRef<string | null>(null);
  
  // Refs for connection management
  const shouldReconnect = useRef(true);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const isReconnecting = useRef(false);
  const lastAcceptedOfferId = useRef<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const manualDisconnect = useRef(false);


useEffect(() => {
  console.log("🔄 [WSP RIDER] rideId changed:", rideId);
  currentRideIdRef.current = rideId;
}, [rideId]);

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable !== false;
      console.log(`🌐 [WSP] Network status: ${online ? 'Online' : 'Offline'}`);
      setIsOnline(online);

      // If we came back online and should reconnect, attempt connection
      if (online && !isConnected && shouldReconnect.current && token) {
        console.log("🌐 [WSP] Network restored, attempting reconnection...");
        reconnectAttempts.current = 0; // Reset attempts on network restore
        connectWebSocket();
      }
    });

    return () => unsubscribe();
  }, [isConnected, token]);

  // Send Message Logic with Queue
  const sendMessage = useCallback(async (payload: any) => {
    // Track the offer ID when accepting a ride
    if (payload.type === "accept_ride" && payload.data?.ride_request_view_id) {
      lastAcceptedOfferId.current = payload.data.ride_request_view_id;
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        const message = JSON.stringify(payload);
        socket.send(message);
        console.log("📡 [WSP] Sent:", message);
      } catch (e) {
        console.error("❌ [WSP] Send error:", e);
        // Queue message if send fails
        setMessageQueue(prev => [...prev, payload]);
        throw e;
      }
    } else {
      console.warn("⚠️ [WSP] Socket not ready. Queueing message...");
      setMessageQueue(prev => [...prev, payload]);
    }
  }, [socket]);

  const removeOffer = useCallback((id: string) => {
  setDriverOffers(prev => {
    const newOffers = { ...prev };
    delete newOffers[id];
    return newOffers;
  });
}, []);

  // Handle Incoming Messages
  const handleWsMessage = useCallback((event: MessageEvent) => {
    if (!event?.data) return;
    
    console.log(`📩 [WSP] RAW MESSAGE:`, event.data);
    
    try {
      const msg = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      console.log(`📩 [WSP] PARSED:`, JSON.stringify(msg));

      // 1. Handle accept_ride_error
      if (msg.type === "accept_ride_error") {
        console.log("❌ [WSP] Accept Ride Error:", msg.message);
        setRideAcceptError({
          message: msg.message || "Driver is no longer available",
          offerId: lastAcceptedOfferId.current || undefined
        });
        lastAcceptedOfferId.current = null;
        return;
      }

      // 2. Notify Wrapper
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
          setDriverOffers({});
          lastAcceptedOfferId.current = null;
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

      // 3. Direct Offer Message
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

      // 4. Direct Ride Success (Legacy/Fallback)
      if (msg.type === "accept_ride_success") {
        setRideAccepted({ ride_id: msg.ride_id });
        setDriverOffers({});
        lastAcceptedOfferId.current = null;
      }



if (msg.type === "chat_message" && msg.message) {
  const { id, content, sender_role, created_at } = msg.message;
  
  const activeRideId = currentRideIdRef.current; 
  
  if (activeRideId) {
    const newMessage = {
      id: String(id),
      text: content,
      sender: sender_role === 'driver' ? 'driver' : 'user',
      timestamp: new Date(created_at),
    };

    setChatMessages(prev => {
      const existing = prev[activeRideId] || [];
      
      // 1. STRICT DUPLICATE CHECK
      if (existing.some(m => m.id === String(id))) {
        return prev;
      }
      
      // 2. OPTIMISTIC CLEANUP (The Fix)
      // Remove any temp message that has the exact same text
      const cleanExisting = existing.filter(m => {
        const isTemp = m.id.startsWith('temp_');
        const isSameContent = m.text === content;
        return !(isTemp && isSameContent);
      });
      
      return {
        ...prev,
        [activeRideId]: [...cleanExisting, newMessage]
      };
    });
  } else {
    console.warn("⚠️ [CHAT] No activeRideId available");
  }
}
      

    } catch (e) {
      console.error("❌ [WSP] Parse Error:", e);
    }
  }, []);

const sendChatMessage = useCallback(async (rideId: string, text: string) => {
  const payload = {
    type: "send_message",
    data: { ride_id: rideId, message: text }
  };

  const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const newMessage = { 
    id: tempId,
    text, 
    sender: 'user', 
    timestamp: new Date() 
  };
  
  setChatMessages(prev => {
    const existing = prev[rideId] || [];
    
    if (existing.some(m => m.id === tempId)) {
      console.log("⚠️ [CHAT] Duplicate temp message, skipping");
      return prev;
    }
    
    return {
      ...prev,
      [rideId]: [...existing, newMessage]
    };
  });

  await sendMessage(payload);
}, [sendMessage]);

  // Process Queued Messages
  const processMessageQueue = useCallback(() => {
    if (messageQueue.length === 0 || !socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    console.log(`📤 [WSP] Processing ${messageQueue.length} queued messages...`);
    const queue = [...messageQueue];
    setMessageQueue([]);

    queue.forEach(msg => {
      try {
        socket.send(JSON.stringify(msg));
        console.log("📤 [WSP] Sent queued:", JSON.stringify(msg));
      } catch (e) {
        console.error("❌ [WSP] Failed to send queued message:", e);
        // Re-queue failed messages
        setMessageQueue(prev => [...prev, msg]);
      }
    });
  }, [messageQueue, socket]);

  // Connection Logic
  const connectWebSocket = useCallback(async () => {
    if (isReconnecting.current || manualDisconnect.current) {
      console.log("⏸️ [WSP] Connection already in progress or manually disconnected");
      return;
    }

    if (!isOnline) {
      console.log("⏸️ [WSP] Offline, skipping connection attempt");
      return;
    }

    if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
      console.log("🛑 [WSP] Max reconnection attempts reached. Stopping.");
      shouldReconnect.current = false;
      return;
    }

    isReconnecting.current = true;

    try {
      const accessToken = await getValidToken();
      if (!accessToken) {
        throw new Error("No valid token available");
      }

      // Close existing socket if any
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }

      const wsUrl = `${WSS_URL}?token=${accessToken}`;
      console.log(`🔌 [WSP] Connecting... (Attempt ${reconnectAttempts.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);
      
      const newSocket = new WebSocket(wsUrl);
      socketRef.current = newSocket;

      newSocket.onopen = () => {
        console.log("✅ [WSP] Connected successfully!");
        setIsConnected(true);
        isReconnecting.current = false;
        reconnectAttempts.current = 0;
        
        // Process queued messages
        setTimeout(() => processMessageQueue(), 100);
      };

      newSocket.onmessage = handleWsMessage;
      
      newSocket.onclose = (event) => {
        console.log(`🔌 [WSP] Connection closed (Code: ${event.code}, Reason: ${event.reason || 'Unknown'})`);
        setIsConnected(false);
        socketRef.current = null;
        
        // Only reconnect if not manually disconnected and should reconnect
        if (shouldReconnect.current && !manualDisconnect.current && isOnline) {
          const delay = Math.min(
            RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current),
            MAX_RECONNECT_DELAY
          );
          console.log(`🔄 [WSP] Scheduling reconnection in ${delay}ms...`);
          
          reconnectTimeout.current = setTimeout(() => {
            isReconnecting.current = false;
            reconnectAttempts.current++;
            connectWebSocket();
          }, delay);
        } else {
          console.log("⏸️ [WSP] Reconnection not scheduled");
        }
      };

      newSocket.onerror = (error) => {
        console.error("❌ [WSP] WebSocket error:", error);
        // Error will trigger onclose, which handles reconnection
      };
      
      setSocket(newSocket);

    } catch (e) {
      console.error("❌ [WSP] Connection failed:", e);
      isReconnecting.current = false;
      
      // Retry connection if online and should reconnect
      if (shouldReconnect.current && isOnline && reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(
          RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current),
          MAX_RECONNECT_DELAY
        );
        console.log(`🔄 [WSP] Retrying connection in ${delay}ms...`);
        
        reconnectTimeout.current = setTimeout(() => {
          reconnectAttempts.current++;
          connectWebSocket();
        }, delay);
      }
    }
  }, [getValidToken, handleWsMessage, processMessageQueue, isOnline]);

  // Initial connection when token is available
  useEffect(() => {
    if (token && isOnline) {
      manualDisconnect.current = false;
      shouldReconnect.current = true;
      connectWebSocket();
    }

    return () => {
      console.log("🧹 [WSP] Cleaning up WebSocket...");
      shouldReconnect.current = false;
      manualDisconnect.current = true;
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [token, isOnline]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    console.log("🔄 [WSP] Manual reconnection triggered");
    shouldReconnect.current = true;
    manualDisconnect.current = false;
    reconnectAttempts.current = 0;
    
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    isReconnecting.current = false;
    connectWebSocket();
  }, [connectWebSocket]);

  const subscribeToRideOffers = useCallback((id: string) => {
    sendMessage({ 
      type: "subscribe_driver_offer_view", 
      data: { ride_request_id: id } 
    });
  }, [sendMessage]);

  return (
    <SocketContext.Provider value={{
      socket, 
      isConnected,
      isOnline,
      driverOffers, 
      rideAccepted,
      rideAcceptError,
      sendMessage, 
      clearDriverOffers: () => setDriverOffers({}),
      clearRideAccepted: () => setRideAccepted(null),
      clearRideAcceptError: () => setRideAcceptError(null),
      reconnect,
      queuedMessageCount: messageQueue.length,
      subscribeToRideOffers,
      removeOffer,
      chatMessages,
      sendChatMessage,
    }}>
      {children}
    </SocketContext.Provider>
  );
};