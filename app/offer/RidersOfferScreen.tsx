import { SocketContext } from "@/context/WebSocketProvider";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

type IncomingDriverOfferMsg = {
  type: string;
  event: string;
  ride_id: string;
  data?: any;
};

type OfferItem = {
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
};

interface RiderOfferProps {
  goBack: () => void;
  next: () => void;
}

export default function RiderOffersScreen({ goBack, next }: RiderOfferProps) {
  const { socket } = useContext(SocketContext);
  const route = useRoute();


  const { ride_request_id } = (route.params as any) || {};

  const [offers, setOffers] = useState<Record<string, OfferItem>>({});
  const [acceptedRide, setAcceptedRide] = useState<any>(null);
const [acceptedModalVisible, setAcceptedModalVisible] = useState(false);

  const [busyMap, setBusyMap] = useState<Record<string, boolean>>({});
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    wsRef.current = socket;
  }, [socket]);

  useEffect(() => {
    if (!ride_request_id) {
      console.warn("RiderOffersScreen: missing ride_request_id");
      return;
    }

    if (!wsRef.current) return;

    const sendSubscribe = () => {
      try {
        const msg = {
          type: "subscribe_driver_offer_view",
          data: { ride_request_id },
        };
        wsRef.current?.send(JSON.stringify(msg));
        console.log("📡 [RIDER] Sent subscribe_driver_offer_view", msg);
      } catch (err) {
        console.error("❌ Failed to send subscribe_driver_offer_view", err);
      }
    };

    if (wsRef.current.readyState === WebSocket.OPEN) {
      sendSubscribe();
    } else {
      const onOpen = () => sendSubscribe();
      (wsRef.current as any).addEventListener?.("open", onOpen);
      return () => {
        (wsRef.current as any).removeEventListener?.("open", onOpen);
      };
    }
  }, [ride_request_id]);

  // Listen for incoming messages
  useEffect(() => {
  if (!wsRef.current) return;

  const onMessage = (ev: any) => {
    try {
      const raw = typeof ev.data === "string" ? ev.data : JSON.stringify(ev.data);
      const msg: IncomingDriverOfferMsg = JSON.parse(raw);
      console.log("📩 [RIDER] RiderOffersScreen got ws message:", msg);

      // Only handle driver offers
      if (msg.type === "driver_offer" && msg.data) {
        const payload = msg.data;
        const offerId = payload.id;
        const rideReqId = payload.ride_request_id;
        const driverId = payload.driver_id;
        const counterOffer = payload.counter_offer;
        const status = payload.status;
        const expiresAt = payload.expires_at;

        if (!offerId || !driverId) {
          console.warn("❌ driver_offer missing required fields, ignoring");
          return;
        }

        console.log("✅ [RIDER] Processing driver offer:", {
          offerId,
          driverId,
          counterOffer,
          status,
        });

        setOffers(prev => {
          const exists = prev[offerId];
          const newItem: OfferItem = {
            id: String(offerId),
            ride_request_id: String(rideReqId),
            driver_id: String(driverId),
            driver_name: payload.driver_name || `Driver ${driverId.slice(0, 8)}`,
            driver_rating: payload.driver_rating || "4.5",
            counter_offer: Number(counterOffer || 0),
            negotiated_price: exists?.negotiated_price ?? Number(counterOffer || 0),
            status: status,
            expires_at: expiresAt,
            timestamp: Date.now(),
          };
          console.log("💾 [RIDER] Adding/updating offer:", newItem);
          return { ...prev, [newItem.id]: newItem };
        });

      }

    const eventType = msg.type || msg.event;

    if (eventType === "accept_ride_success") {
      setAcceptedRide(msg.data || msg.ride_id);
      setAcceptedModalVisible(true);
    }

    } catch (err) {
      console.error("❌ Failed to parse WS message in RiderOffersScreen:", err);
    }
  };

  wsRef.current.addEventListener?.("message", onMessage);

  return () => {
    wsRef.current?.removeEventListener?.("message", onMessage);
  };
}, [ride_request_id]);


  const updateLocalNegotiated = useCallback((offerId: string, newPrice: number) => {
    setOffers(prev => {
      const target = prev[offerId];
      if (!target) return prev;
      console.log("📝 [RIDER] Local price update:", { offerId, newPrice });
      return {
        ...prev,
        [offerId]: { ...target, negotiated_price: newPrice, timestamp: Date.now() },
      };
    });
  }, []);

  const sendNegotiation = useCallback(async (offerId: string, negotiated_price: number) => {
    const sock = wsRef.current;
    if (!sock || sock.readyState !== WebSocket.OPEN) {
      Alert.alert("Connection error", "WebSocket not connected. Please try again.");
      return;
    }

    const offer = offers[offerId];
    if (!offer) {
      console.error("❌ Offer not found:", offerId);
      return;
    }

    const isIncrement = negotiated_price > offer.counter_offer;

    setBusyMap(b => ({ ...b, [offerId]: true }));

    try {
      const payload = {
        type: isIncrement ? "negotiate_increment" : "negotiate_decrement",
        data: {
          ride_request_view_id: offerId,
          negotiated_price: negotiated_price,
        },
      };

      console.log("📡 [RIDER] Sending negotiation:", payload);
      sock.send(JSON.stringify(payload));

      // Remove card immediately
      setOffers(prev => {
        const updated = { ...prev };
        delete updated[offerId];
        return updated;
      });

      setBusyMap(b => ({ ...b, [offerId]: false }));

    } catch (err) {
      console.error("❌ Failed to send negotiation:", err);
      setBusyMap(b => ({ ...b, [offerId]: false }));
      Alert.alert("Error", "Failed to send negotiation. Try again.");
    }
  }, [offers, updateLocalNegotiated]);

  const adjustBy = useCallback((offerId: string, delta: number) => {
    const item = offers[offerId];
    if (!item) return;
    const current = item.negotiated_price;
    const next = Math.max(0, current + delta);
    updateLocalNegotiated(offerId, next);
  }, [offers, updateLocalNegotiated]);

const handleAcceptOffer = useCallback((offerId: string) => {
  const sock = wsRef.current;
  if (!sock || sock.readyState !== WebSocket.OPEN) {
    Alert.alert("Connection error", "WebSocket not connected. Please try again.");
    return;
  }

  const offer = offers[offerId];
  if (!offer) {
    console.warn("❌ Offer not found:", offerId);
    return;
  }

  // The backend accepts either ride_request_view_id OR ride_id
  const rideId = offer.id;

  if (!rideId) {
    console.warn("❌ No valid ride_request_view_id or ride_id found in offer:", offer);
    Alert.alert("Error", "Invalid ride ID.");
    return;
  }

  try {
    const payload = {
      type: "accept_ride",
      data : {
        ride_request_view_id: offerId,
      }
      
    };

    console.log("📡 [RIDER] Sending accept:", payload);
    sock.send(JSON.stringify(payload));

    // Remove this offer from the list
    setOffers(prev => {
      const updated = { ...prev };
      delete updated[offerId];
      return updated;
    });

    Alert.alert("Success", "Offer accepted!");
  } catch (err) {
    console.error("❌ Failed to accept offer:", err);
    Alert.alert("Error", "Failed to accept offer. Try again.");
  }
}, [offers]);


  const handleDeclineOffer = useCallback((offerId: string) => {
    setOffers(prev => {
      const updated = { ...prev };
      delete updated[offerId];
      return updated;
    });
  }, []);

  const offersArray = Object.values(offers).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const renderOffer = ({ item }: { item: OfferItem }) => {
    const busy = !!busyMap[item.id];
    const currentPrice = item.negotiated_price;
    const difference = currentPrice - item.counter_offer;

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="person-circle" size={46} color="#facc15" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.driverName}>{item.driver_name}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#facc15" />
              <Text style={styles.ratingText}>{item.driver_rating}</Text>
            </View>
            <Text style={styles.smallText}>Driver Offer: ₦{Number(item.counter_offer).toLocaleString()}</Text>
          </View>
          {item.status && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
            </View>
          )}
        </View>

        <View style={styles.separator} />

        <View style={styles.center}>
          <Text style={styles.negotiatedLabel}>Your Counter Offer</Text>
          <Text style={styles.negotiatedPrice}>₦{Number(currentPrice).toLocaleString()}</Text>

          {difference !== 0 && (
            <View style={styles.differenceContainer}>
              <Text style={[styles.differenceText, difference > 0 ? styles.higher : styles.lower]}>
                {difference > 0 ? '+' : ''}₦{Math.abs(difference).toLocaleString()}
              </Text>
            </View>
          )}

          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.controlBtn, { backgroundColor: "#f44336" }]}
              onPress={() => adjustBy(item.id, -100)}
              disabled={busy || currentPrice <= 0}
            >
              <Ionicons name="remove" size={20} color="white" />
              <Text style={styles.controlText}>₦100</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlBtn, { backgroundColor: "#facc15" }]}
              onPress={() => adjustBy(item.id, +100)}
              disabled={busy}
            >
              <Ionicons name="add" size={20} color="black" />
              <Text style={[styles.controlText, { color: "black" }]}>₦100</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.sendButton, busy && styles.disabledButton]}
            onPress={() => sendNegotiation(item.id, currentPrice)}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text style={styles.sendButtonText}>Send Counter Offer</Text>
            )}
          </TouchableOpacity>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => handleAcceptOffer(item.id)}
              disabled={busy}
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.acceptText}>Accept Original</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.declineButton}
              onPress={() => handleDeclineOffer(item.id)}
              disabled={busy}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
              <Text style={styles.declineText}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Offers ({offersArray.length})</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {offersArray.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="car-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>Waiting for drivers to respond...</Text>
            <ActivityIndicator style={{ marginTop: 16 }} size="large" color="#facc15" />
          </View>
        ) : (
          <FlatList
            data={offersArray}
            keyExtractor={(i) => i.id}
            renderItem={renderOffer}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>

      <Modal
  animationType="fade"
  transparent={true}
  visible={acceptedModalVisible}
  onRequestClose={() => {
    setAcceptedModalVisible(false);
    next(); // or your home screen name
  }}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
      <Text style={styles.modalTitle}>Ride Accepted!</Text>
      <Text style={styles.modalMessage}>
        Ride with ID: {acceptedRide?.ride_request_view_id ?? "N/A"} has been accepted.
      </Text>
      <TouchableOpacity
        style={styles.modalButton}
        onPress={() => {
          setAcceptedModalVisible(false);
          next() // navigate home on OK;
        }}
      >
        <Text style={styles.modalButtonText}>OK</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </KeyboardAvoidingView>

    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#111",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "700" },
  content: { padding: 16, flex: 1 },
  empty: { alignItems: "center", marginTop: 80 },
  emptyText: { color: "#999", fontSize: 16, marginTop: 16 },
  card: {
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  row: { flexDirection: "row", alignItems: "center" },
  driverName: { color: "white", fontSize: 16, fontWeight: "600", marginBottom: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  ratingText: { color: "#facc15", fontSize: 13, marginLeft: 4, fontWeight: "600" },
  smallText: { color: "#999", fontSize: 13 },
  statusBadge: {
    backgroundColor: "#facc15",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { color: "black", fontSize: 10, fontWeight: "bold" },
  separator: { height: 1, backgroundColor: "#333", marginVertical: 14 },
  center: { alignItems: "center" },
  negotiatedLabel: { color: "#999", fontSize: 13, marginBottom: 6 },
  negotiatedPrice: { color: "#facc15", fontSize: 32, fontWeight: "bold" },
  differenceContainer: { marginTop: 6, marginBottom: 12 },
  differenceText: { fontSize: 15, fontWeight: "600" },
  higher: { color: "#4CAF50" },
  lower: { color: "#f44336" },
  controls: { flexDirection: "row", marginTop: 16, gap: 12 },
  controlBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  controlText: { color: "white", marginLeft: 6, fontWeight: "700", fontSize: 15 },
  sendButton: {
    backgroundColor: "#facc15",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 16,
    width: "100%",
    alignItems: "center",
  },
  sendButtonText: { color: "black", fontWeight: "700", fontSize: 15 },
  actionRow: { 
    flexDirection: "row", 
    marginTop: 16, 
    width: "100%", 
    gap: 12 
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  acceptText: { color: "white", fontWeight: "600", fontSize: 14 },
  declineButton: {
    flex: 1,
    backgroundColor: "#333",
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  declineText: { color: "#999", fontWeight: "600", fontSize: 14 },
  disabledButton: { opacity: 0.5 },

  modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.6)",
  justifyContent: "center",
  alignItems: "center",
},
modalContent: {
  backgroundColor: "#111",
  padding: 24,
  borderRadius: 12,
  alignItems: "center",
  width: "80%",
},
modalTitle: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 12 },
modalMessage: { color: "#ccc", fontSize: 16, marginTop: 8, textAlign: "center" },
modalButton: {
  marginTop: 20,
  backgroundColor: "#4CAF50",
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 10,
},
modalButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

});