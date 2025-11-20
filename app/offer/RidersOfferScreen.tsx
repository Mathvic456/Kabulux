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

        // Handle driver offers
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
  }, [offers]);

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

    const rideId = offer.id;

    if (!rideId) {
      console.warn("❌ No valid ride_request_view_id or ride_id found in offer:", offer);
      Alert.alert("Error", "Invalid ride ID.");
      return;
    }

    try {
      const payload = {
        type: "accept_ride",
        data: {
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
    Alert.alert(
      "Decline Offer",
      "Are you sure you want to decline this offer?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Decline",
          style: "destructive",
          onPress: () => {
            setOffers(prev => {
              const updated = { ...prev };
              delete updated[offerId];
              return updated;
            });
          }
        }
      ]
    );
  }, []);

  const offersArray = Object.values(offers).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const renderOffer = ({ item }: { item: OfferItem }) => {
    const busy = !!busyMap[item.id];
    const currentPrice = item.negotiated_price;
    const difference = currentPrice - item.counter_offer;

    return (
      <View style={styles.card}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.driverInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={44} color="#facc15" />
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{item.driver_name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#facc15" />
                <Text style={styles.ratingText}>{item.driver_rating}</Text>
              </View>
            </View>
          </View>
          {item.status && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Offer Details */}
        <View style={styles.offerSection}>
          <Text style={styles.offerLabel}>Driver's Offer</Text>
          <Text style={styles.originalOffer}>₦{Number(item.counter_offer).toLocaleString()}</Text>
        </View>

        {/* Counter Offer Section */}
        <View style={styles.counterSection}>
          <Text style={styles.counterLabel}>Your Counter Offer</Text>
          <Text style={styles.counterPrice}>₦{Number(currentPrice).toLocaleString()}</Text>
          
          {difference !== 0 && (
            <View style={[
              styles.differenceBadge,
              difference > 0 ? styles.higherBadge : styles.lowerBadge
            ]}>
              <Ionicons 
                name={difference > 0 ? "trending-up" : "trending-down"} 
                size={14} 
                color={difference > 0 ? "#4CAF50" : "#f44336"} 
              />
              <Text style={[
                styles.differenceText,
                difference > 0 ? styles.higherText : styles.lowerText
              ]}>
                {difference > 0 ? '+' : ''}₦{Math.abs(difference).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Price Adjustment Controls */}
        <View style={styles.controlsSection}>
          <Text style={styles.controlsLabel}>Adjust your offer:</Text>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.controlButton, styles.decreaseButton]}
              onPress={() => adjustBy(item.id, -100)}
              disabled={busy || currentPrice <= 0}
            >
              <Ionicons name="remove" size={20} color="white" />
              <Text style={styles.controlButtonText}>-₦100</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.increaseButton]}
              onPress={() => adjustBy(item.id, +100)}
              disabled={busy}
            >
              <Ionicons name="add" size={20} color="black" />
              <Text style={[styles.controlButtonText, styles.increaseButtonText]}>+₦100</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.primaryButton, busy && styles.disabledButton]}
            onPress={() => sendNegotiation(item.id, currentPrice)}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="black" size="small" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="black" />
                <Text style={styles.primaryButtonText}>Send Counter Offer</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={[styles.secondaryButton, styles.acceptButton]}
              onPress={() => handleAcceptOffer(item.id)}
              disabled={busy}
            >
              <Ionicons name="checkmark-circle" size={18} color="white" />
              <Text style={styles.acceptButtonText}>Accept Original</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, styles.declineButton]}
              onPress={() => handleDeclineOffer(item.id)}
              disabled={busy}
            >
              <Ionicons name="close-circle" size={18} color="#666" />
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Driver Offers</Text>
          <Text style={styles.headerSubtitle}>{offersArray.length} active offers</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {offersArray.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="car-outline" size={64} color="#444" />
            </View>
            <Text style={styles.emptyTitle}>Waiting for offers</Text>
            <Text style={styles.emptyDescription}>
              Drivers will see your request and send offers shortly...
            </Text>
            <ActivityIndicator style={styles.loadingIndicator} size="large" color="#facc15" />
          </View>
        ) : (
          <FlatList
            data={offersArray}
            keyExtractor={(i) => i.id}
            renderItem={renderOffer}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={acceptedModalVisible}
        onRequestClose={() => {
          setAcceptedModalVisible(false);
          next();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            </View>
            <Text style={styles.modalTitle}>Ride Accepted!</Text>
            <Text style={styles.modalMessage}>
              Your ride has been confirmed. Driver is on the way!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setAcceptedModalVisible(false);
                next();
              }}
            >
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#000" 
  },
  
  // Header Styles
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    color: "white", 
    fontSize: 18, 
    fontWeight: "700" 
  },
  headerSubtitle: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40 
  },
  
  // Content Styles
  content: { 
    flex: 1, 
    padding: 16 
  },
  listContent: {
    paddingBottom: 20
  },
  
  // Empty State
  emptyState: {
    alignItems: "center", 
    justifyContent: "center",
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    padding: 20,
    backgroundColor: "#1a1a1a",
    borderRadius: 40,
    marginBottom: 16,
  },
  emptyTitle: {
    color: "white", 
    fontSize: 20, 
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyDescription: {
    color: "#888", 
    fontSize: 14, 
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  loadingIndicator: {
    marginTop: 16 
  },
  
  // Card Styles
  card: {
    backgroundColor: "#1a1a1a",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Header Section
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    color: "white", 
    fontSize: 16, 
    fontWeight: "600", 
    marginBottom: 4 
  },
  ratingContainer: {
    flexDirection: "row", 
    alignItems: "center" 
  },
  ratingText: {
    color: "#facc15", 
    fontSize: 13, 
    marginLeft: 4, 
    fontWeight: "600" 
  },
  statusBadge: {
    backgroundColor: "#facc15",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: "black", 
    fontSize: 10, 
    fontWeight: "bold" 
  },
  
  // Divider
  divider: {
    height: 1, 
    backgroundColor: "#2a2a2a", 
    marginBottom: 16 
  },
  
  // Offer Section
  offerSection: {
    marginBottom: 16,
  },
  offerLabel: {
    color: "#888", 
    fontSize: 12, 
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  originalOffer: {
    color: "#facc15", 
    fontSize: 18, 
    fontWeight: "700" 
  },
  
  // Counter Section
  counterSection: {
    alignItems: "center",
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#252525",
    borderRadius: 12,
  },
  counterLabel: {
    color: "#888", 
    fontSize: 12, 
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  counterPrice: {
    color: "white", 
    fontSize: 28, 
    fontWeight: "bold",
    marginBottom: 8,
  },
  differenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
  },
  higherBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.15)",
  },
  lowerBadge: {
    backgroundColor: "rgba(244, 67, 54, 0.15)",
  },
  differenceText: {
    fontSize: 13, 
    fontWeight: "600",
    marginLeft: 4,
  },
  higherText: {
    color: "#4CAF50"
  },
  lowerText: {
    color: "#f44336"
  },
  
  // Controls Section
  controlsSection: {
    marginBottom: 20,
  },
  controlsLabel: {
    color: "#888", 
    fontSize: 12, 
    marginBottom: 12,
    textAlign: "center",
  },
  controlsRow: {
    flexDirection: "row",
    gap: 12,
  },
  controlButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  decreaseButton: {
    backgroundColor: "#d32f2f",
  },
  increaseButton: {
    backgroundColor: "#facc15",
  },
  controlButtonText: {
    color: "white", 
    marginLeft: 6, 
    fontWeight: "700", 
    fontSize: 14 
  },
  increaseButtonText: {
    color: "black"
  },
  
  // Actions Section
  actionsSection: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#facc15",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: "black", 
    fontWeight: "700", 
    fontSize: 16 
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  declineButton: {
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#444",
  },
  acceptButtonText: {
    color: "white", 
    fontWeight: "600", 
    fontSize: 14 
  },
  declineButtonText: {
    color: "#888", 
    fontWeight: "600", 
    fontSize: 14 
  },
  disabledButton: { 
    opacity: 0.5 
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    padding: 28,
    borderRadius: 20,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  successIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    color: "#fff", 
    fontSize: 22, 
    fontWeight: "700", 
    marginBottom: 8,
    textAlign: "center",
  },
  modalMessage: {
    color: "#ccc", 
    fontSize: 16, 
    marginBottom: 24, 
    textAlign: "center",
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600" 
  },
});