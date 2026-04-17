import { RideContext } from "@/context/RideContext";
import { RideIdContext } from "@/context/RideIdContext";
import { SocketContext } from "@/context/WebSocketProvider";
import { useCancelRideRequest } from "@/services/cancelRideRequest.service";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import Constants from "expo-constants";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { darkMapStyle } from "../../styles/darkMapStyle";

if (!Constants.expoConfig?.extra?.googleMapsApiKey) {
  throw new Error("API is missing in expoConfig.extra");
}

const GOOGLE_API_KEY = Constants.expoConfig.extra.googleMapsApiKey;

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

interface RideData {
  name: string;
  details: string;
  price: string;
  rawPrice?: number;
  carType: string;
  passengers: number;
  rideDetails: {
    pickup: {
      pickupLat: number;
      pickupLong: number;
    };
    destination: {
      dropoffLat: number;
      dropoffLong: number;
    };
    estimated_distance: string;
    estimated_duration: string;
    car_type: string;
    estimated_fare: number;
  };
  ride_request_id: string;
  paymentMethod: string;
}

interface RiderOfferProps {
  goBack: () => void;
  next: () => void;
  rideData?: RideData;
  home?: () => void;
}

export default function RiderOffersScreen({ goBack, next, rideData, home }: RiderOfferProps) {
  const {
    driverOffers,
    rideAccepted,
    rideAcceptError,
    sendMessage,
    isConnected,
    isOnline,
    subscribeToRideOffers,
    clearRideAccepted,
    clearRideAcceptError,
    // queuedMessageCount,
    reconnect,
    removeOffer,
  } = useContext(SocketContext);

  const { rideState } = useContext(RideContext);
  const { rideId } = useContext(RideIdContext);

  const route = useRoute();

  const [localOffers, setLocalOffers] = useState<Record<string, OfferItem>>({});
  const [acceptedModalVisible, setAcceptedModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [busyMap, setBusyMap] = useState<Record<string, boolean>>({});
  const [errorOfferId, setErrorOfferId] = useState<string | null>(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const lastDeclinedTimestamps = useRef<Record<string, number>>({});
  const rideAcceptedRef = useRef(false);

  // Track connection state for proper re-subscription
  const previousConnectionState = useRef(false);
  const hasShownModal = useRef(false);
  const isInitialMount = useRef(true);
  const subscriptionAttempted = useRef(false);

  const { mutate: cancelRide, isPending: isCancelling } = useCancelRideRequest();

  // ✅ FIX #1: Proper subscription logic with reconnection handling
  useEffect(() => {
    if (!rideData?.ride_request_id) {
      console.warn("[RIDER] Missing ride_request_id");
      return;
    }

    // Initial subscription
    if (isConnected && !subscriptionAttempted.current) {
      console.log("[RIDER] 📡 Initial subscription for:", rideData.ride_request_id);
      subscribeToRideOffers(rideData.ride_request_id);
      subscriptionAttempted.current = true;
      previousConnectionState.current = true;
      return;
    }

    // Re-subscribe ONLY when transitioning from disconnected to connected
    if (isConnected && !previousConnectionState.current && subscriptionAttempted.current) {
      console.log("📡 [RIDER] Re-subscribing after reconnection");
      subscribeToRideOffers(rideData.ride_request_id);
    }

    previousConnectionState.current = isConnected;
  }, [rideData, isConnected, subscribeToRideOffers]);

  // Sync Context -> Local State (but NOT after ride is accepted)
  useEffect(() => {
    if (!rideAcceptedRef.current) {
      setLocalOffers(driverOffers);
    }
  }, [driverOffers]);

  // Handle Initial Mount - Clear stale data
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Clear any stale state on mount to prevent phantom modals
      if (rideAccepted) {
        console.log("🧹 [RIDER] Clearing stale rideAccepted on mount");
        clearRideAccepted();
      }
      if (rideAcceptError) {
        console.log("🧹 [RIDER] Clearing stale rideAcceptError on mount");
        clearRideAcceptError();
      }
    }
  }, [rideAccepted, rideAcceptError, clearRideAccepted, clearRideAcceptError]);

  // Filter offers based on decline history
  useEffect(() => {
    // Don't filter/process offers if ride already accepted
    if (rideAcceptedRef.current) {
      return;
    }

    const filteredOffers: Record<string, OfferItem> = {};

    Object.keys(driverOffers).forEach((id) => {
      const incomingOffer = driverOffers[id];
      const lastDeclinedAt = lastDeclinedTimestamps.current[id] || 0;

      // ONLY show the offer if:
      // It hasn't been declined OR its timestamp is newer than our decline action
      if (incomingOffer.timestamp > lastDeclinedAt) {
        filteredOffers[id] = incomingOffer;
      }
    });

    setLocalOffers(filteredOffers);
  }, [driverOffers]);

  // Show acceptance modal
  useEffect(() => {
    if (rideAccepted && !hasShownModal.current && !isInitialMount.current) {
      console.log("🎉 [RIDER] Ride accepted, showing modal:", rideAccepted);
      setAcceptedModalVisible(true);
      hasShownModal.current = true;
    }
  }, [rideAccepted]);

  // Handle acceptance errors
  useEffect(() => {
    if (rideAcceptError && !isInitialMount.current) {
      console.log("[RIDER] Ride accept error:", rideAcceptError);
      setErrorOfferId(rideAcceptError.offerId || null);
      setErrorModalVisible(true);

      // Remove the offer from local state
      if (rideAcceptError.offerId) {
        setLocalOffers((prev) => {
          const copy = { ...prev };
          delete copy[rideAcceptError.offerId];
          return copy;
        });
      }
    }
  }, [rideAcceptError]);

  // Navigate when ride state changes to driver_on_way
  useEffect(() => {
    if (rideState === "driver_on_way" && rideId) {
      console.log(
        "🚗 [RIDER] Ride is active, preparing to navigate...",
        rideState,
      );
      setTimeout(() => {
        if (!acceptedModalVisible) {
          next();
        }
      }, 500);
    }
  }, [rideState, rideId, acceptedModalVisible, next]);

  // Clear all offer cards when ride is accepted (driver_on_way)
  useEffect(() => {
    if (rideState === "driver_on_way") {
      console.log("🧹 [RIDER] Clearing all offer cards on driver_on_way");
      // Set flag to prevent any new offers from syncing
      rideAcceptedRef.current = true;
      // Clear all local offers immediately
      setLocalOffers({});
      // Reset the declined timestamps since we're done with this ride
      lastDeclinedTimestamps.current = {};
    }
  }, [rideState]);

  // ✅ FIX #2: Clear all busy states when ride is accepted
  useEffect(() => {
    if (rideAccepted) {
      console.log("🧹 [RIDER] Clearing all busy states on acceptance");
      setBusyMap({});
    }
  }, [rideAccepted]);

  // ✅ FIX #3: Clear specific busy state on error
  useEffect(() => {
    if (rideAcceptError?.offerId) {
      console.log("🧹 [RIDER] Clearing busy for failed offer:", rideAcceptError.offerId);
      setBusyMap((prev) => {
        const updated = { ...prev };
        delete updated[rideAcceptError.offerId];
        return updated;
      });
    }
  }, [rideAcceptError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      hasShownModal.current = false;
      subscriptionAttempted.current = false;
      rideAcceptedRef.current = false;
      clearRideAccepted();
      clearRideAcceptError();
    };
  }, [clearRideAccepted, clearRideAcceptError]);

  const closeModalAndContinue = () => {
    setAcceptedModalVisible(false);
    // clearRideAccepted();
    hasShownModal.current = false;
    next();
  };

  const closeErrorModal = () => {
    setErrorModalVisible(false);
    setErrorOfferId(null);
    clearRideAcceptError();
  };

  const handleCancelRide = () => {
    Alert.alert(
      "Cancel Request",
      "Are you sure you want to cancel this ride request? All offers will be lost.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            cancelRide(undefined, {
              onSuccess: () => {
                setCancelModalVisible(true);
              },
              onError: (err) => {
                Alert.alert(
                  "Error",
                  "Could not cancel ride. Please try again.",
                );
              },
            });
          },
        },
      ],
    );
  };

  const handleCancelSuccessClose = () => {
    setCancelModalVisible(false);
    home();
  };

  const adjustBy = useCallback((offerId: string, delta: number) => {
    setLocalOffers((prev) => {
      const target = prev[offerId];
      if (!target) return prev;
      const newPrice = Math.max(0, target.negotiated_price + delta);
      return {
        ...prev,
        [offerId]: { ...target, negotiated_price: newPrice },
      };
    });
  }, []);

  const sendNegotiation = async (
    offerId: string,
    rideRequestId: string,
    price: number,
  ) => {
    console.log({ 'offerId': offerId, 'rideRequestId': rideRequestId, 'price': price })
    if (!isConnected && !isOnline) {
      return Alert.alert(
        "No Connection",
        "You're offline. Please check your internet connection.",
      );
    }

    if (!isConnected && isOnline) {
      return Alert.alert(
        "Reconnecting",
        "Trying to reconnect to the server. Please wait...",
      );
    }

    setBusyMap((prev) => ({ ...prev, [offerId]: true }));

    const original = localOffers[offerId]?.counter_offer || 0;
    const type =
      price > original ? "negotiate_increment" : "negotiate_decrement";

    try {
      await sendMessage({
        type: type,
        data: {
          ride_request_id: rideRequestId,
          negotiated_price: price,
          ride_request_view_id: offerId,
        },
      });

      setLocalOffers((prev) => {
        const copy = { ...prev };
        delete copy[offerId];
        return copy;
      });

      removeOffer(offerId);
    } catch (err) {
      console.error("[RIDER] Negotiation failed:", err);
      Alert.alert(
        "Error",
        "Failed to send negotiation. It will be retried when connection is restored.",
      );
    } finally {
      setBusyMap((prev) => ({ ...prev, [offerId]: false }));
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    if (!isConnected && !isOnline) {
      return Alert.alert(
        "No Connection",
        "You're offline. Please check your internet connection.",
      );
    }

    if (!isConnected && isOnline) {
      return Alert.alert(
        "Reconnecting",
        "Trying to reconnect to the server. Please wait...",
      );
    }

    setBusyMap((prev) => ({ ...prev, [offerId]: true }));
    const message = {
      type: "accept_ride",
      data: { ride_request_view_id: offerId },
    };

    try {
      console.log("📤 [RIDER] Accepting ride:", message);
      await sendMessage(message);
      // Note: busy state will be cleared by useEffect when rideAccepted changes

    } catch (err) {
      console.error("[RIDER] Accept failed:", err);
      Alert.alert(
        "Error",
        "Failed to accept offer. It will be retried when connection is restored.",
      );
      setBusyMap((prev) => ({ ...prev, [offerId]: false }));
    }
  };

  const handleDeclineOffer = (offerId: string) => {
    const offerToDecline = localOffers[offerId];
    if (!offerToDecline) return;

    lastDeclinedTimestamps.current[offerId] = offerToDecline.timestamp;

    setLocalOffers((prev) => {
      const copy = { ...prev };
      delete copy[offerId];
      return copy;
    });

    const message = {
      type: "decline_ride_driver_offer",
      data: { ride_request_view_id: offerId },
    };

    console.log("📤 [RIDER] Declining offer:", JSON.stringify(message));

    try {
      sendMessage(message);
      console.log(
        `[RIDER] Declined offer ${offerId} at timestamp ${offerToDecline.timestamp}`,
      );
      removeOffer(offerId);
    } catch (err) {
      console.error("[RIDER] Decline failed:", err);
    }
  };

  const offersArray = Object.values(localOffers).sort(
    (a, b) => b.timestamp - a.timestamp,
  );

  const renderOffer = ({ item }: { item: OfferItem }) => {
    console.log('itemmmmm', item)
    const busy = !!busyMap[item.id];
    const diff = item.negotiated_price - item.counter_offer;

    return (
      <View style={styles.card}>
        <View style={styles.headerSection}>
          <View style={styles.driverInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={44} color="#facc15" />
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{item.driver_name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#facc15" />
                <Text style={styles.ratingText}>
                  {item.driver_rating || "N/A"}
                </Text>
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

        <View style={styles.offerSection}>
          <Text style={styles.offerLabel}>Drivers Offer</Text>
          <Text style={styles.originalOffer}>
            ₦{item.counter_offer.toLocaleString()}
          </Text>
        </View>

        <View style={styles.counterSection}>
          <Text style={styles.counterLabel}>Your Counter Offer</Text>
          <Text style={styles.counterPrice}>
            ₦{item.negotiated_price.toLocaleString()}
          </Text>

          {diff !== 0 && (
            <View
              style={[
                styles.differenceBadge,
                diff > 0 ? styles.higherBadge : styles.lowerBadge,
              ]}
            >
              <Ionicons
                name={diff > 0 ? "trending-up" : "trending-down"}
                size={14}
                color={diff > 0 ? "#4CAF50" : "#f44336"}
              />
              <Text
                style={[
                  styles.differenceText,
                  diff > 0 ? styles.higherText : styles.lowerText,
                ]}
              >
                {diff > 0 ? "+" : ""}₦{Math.abs(diff).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.controlsSection}>
          <Text style={styles.controlsLabel}>Adjust your offer:</Text>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.controlButton, styles.decreaseButton]}
              onPress={() => adjustBy(item.id, -100)}
              disabled={busy || item.negotiated_price <= 0}
            >
              <Ionicons name="remove" size={20} color="white" />
              <Text style={styles.controlButtonText}>-₦100</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.increaseButton]}
              onPress={() => adjustBy(item.id, 100)}
              disabled={busy}
            >
              <Ionicons name="add" size={20} color="black" />
              <Text
                style={[styles.controlButtonText, styles.increaseButtonText]}
              >
                +₦100
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.primaryButton, busy && styles.disabledButton]}
            onPress={() =>
              sendNegotiation(
                item.id,
                item.ride_request_id,
                item.negotiated_price,
              )
            }
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
              <Text style={styles.acceptButtonText}>Accept</Text>
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
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Background Map */}
      {rideData?.rideDetails?.pickup?.pickupLat != null &&
        rideData?.rideDetails?.pickup?.pickupLong != null && (
          <MapView
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: rideData.rideDetails.pickup.pickupLat,
              longitude: rideData.rideDetails.pickup.pickupLong,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={false}
            customMapStyle={darkMapStyle}
            pointerEvents="none"
          >
            <Marker
              coordinate={{
                latitude: rideData.rideDetails.pickup.pickupLat,
                longitude: rideData.rideDetails.pickup.pickupLong,
              }}
              title="Your Pickup Location"
            />
          </MapView>
        )}

      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Driver Offers</Text>
          <Text style={styles.headerSubtitle}>
            {offersArray.length} active{" "}
            {offersArray.length === 1 ? "offer" : "offers"}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Connection Status Banner */}
      {!isOnline && (
        <View style={[styles.connectionBanner, styles.offlineBanner]}>
          <Ionicons name="cloud-offline" size={16} color="#f44336" />
          <Text style={styles.offlineText}>
            Youre offline. Messages will be sent when back online.
          </Text>
        </View>
      )}

      {isOnline && !isConnected && (
        <View style={[styles.connectionBanner, styles.reconnectingBanner]}>
          <ActivityIndicator size="small" color="#facc15" />
          <Text style={styles.reconnectingText}>Reconnecting to server...</Text>
          <TouchableOpacity onPress={reconnect} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* {queuedMessageCount > 0 && (
        <View style={[styles.connectionBanner, styles.queueBanner]}>
          <Ionicons name="time-outline" size={16} color="#facc15" />
          <Text style={styles.queueText}>
            {queuedMessageCount}{" "}
            {queuedMessageCount === 1 ? "message" : "messages"} queued
          </Text>
        </View>
      )} */}

      <View style={styles.content}>
        <FlatList
          data={offersArray}
          keyExtractor={(item) => item.id}
          renderItem={renderOffer}
          contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="car-outline" size={64} color="#444" />
              </View>
              <Text style={styles.emptyTitle}>Waiting for offers</Text>
              <Text style={styles.emptyDescription}>
                Drivers will see your request and send offers shortly...
              </Text>
              {isConnected && (
                <ActivityIndicator
                  style={styles.loadingIndicator}
                  size="large"
                  color="#facc15"
                />
              )}
              {!isConnected && isOnline && (
                <TouchableOpacity
                  onPress={reconnect}
                  style={styles.reconnectButton}
                >
                  <Ionicons name="refresh" size={20} color="#facc15" />
                  <Text style={styles.reconnectButtonText}>Reconnect</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </View>

      <TouchableOpacity
        style={[
          styles.floatingCancelButton,
          isCancelling && styles.disabledButton,
        ]}
        onPress={handleCancelRide}
        disabled={isCancelling}
      >
        {isCancelling ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <Ionicons name="close-circle" size={20} color="white" />
            <Text style={styles.floatingCancelText}>Cancel Ride Request</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Success Modal */}
      <Modal visible={acceptedModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            </View>
            <Text style={styles.modalTitle}>Ride Accepted!</Text>
            <Text style={styles.modalMessage}>
              {rideAccepted?.driver_name || "Your driver"} is on the way!
            </Text>
            {rideAccepted?.message && (
              <Text style={styles.modalSubMessage}>{rideAccepted.message}</Text>
            )}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={closeModalAndContinue}
            >
              <Text style={styles.modalButtonText}>Track Driver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal visible={errorModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.errorIconContainer}>
              <Ionicons name="close-circle" size={60} color="#f44336" />
            </View>
            <Text style={styles.modalTitle}>Driver Unavailable</Text>
            <Text style={styles.modalMessage}>
              {rideAcceptError?.message ||
                "The selected driver is no longer available"}
            </Text>
            <Text style={styles.modalSubMessage}>
              Please select another driver from the available offers.
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, styles.errorModalButton]}
              onPress={closeErrorModal}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cancel Success Modal */}
      <Modal visible={cancelModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.errorIconContainer}>
              <Ionicons name="trash-bin" size={60} color="#ffb300" />
            </View>
            <Text style={styles.modalTitle}>Request Cancelled</Text>
            <Text style={styles.modalMessage}>
              Your ride request has been deleted.
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, styles.errorModalButton]}
              onPress={handleCancelSuccessClose}
            >
              <Text style={styles.modalButtonText}>Return Home</Text>
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
    backgroundColor: "#000",
  },

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
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },

  connectionBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 8,
  },
  offlineBanner: {
    backgroundColor: "#2a1a1a",
  },
  reconnectingBanner: {
    backgroundColor: "#1a1a0f",
  },
  floatingCancelButton: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#d32f2f",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 50,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    zIndex: 999,
    gap: 8,
  },
  floatingCancelText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    textTransform: "uppercase",
  },
  queueBanner: {
    backgroundColor: "#1a1a0f",
  },
  offlineText: {
    color: "#f44336",
    fontSize: 12,
    fontWeight: "600",
  },
  reconnectingText: {
    color: "#facc15",
    fontSize: 12,
    fontWeight: "600",
  },
  queueText: {
    color: "#facc15",
    fontSize: 12,
    fontWeight: "600",
  },
  retryButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#facc15",
    borderRadius: 6,
  },
  retryButtonText: {
    color: "black",
    fontSize: 11,
    fontWeight: "700",
  },

  content: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingBottom: 20,
  },

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
    marginTop: 16,
  },
  reconnectButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#facc15",
  },
  reconnectButtonText: {
    color: "#facc15",
    fontSize: 14,
    fontWeight: "600",
  },

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
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: "#facc15",
    fontSize: 13,
    marginLeft: 4,
    fontWeight: "600",
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
    fontWeight: "bold",
  },

  divider: {
    height: 1,
    backgroundColor: "#2a2a2a",
    marginBottom: 16,
  },

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
    fontWeight: "700",
  },

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
    color: "#4CAF50",
  },
  lowerText: {
    color: "#f44336",
  },

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
    fontSize: 14,
  },
  increaseButtonText: {
    color: "black",
  },

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
    fontSize: 16,
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
    fontSize: 14,
  },
  declineButtonText: {
    color: "#888",
    fontWeight: "600",
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },

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
  errorIconContainer: {
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
    marginBottom: 12,
    textAlign: "center",
    lineHeight: 22,
  },
  modalSubMessage: {
    color: "#888",
    fontSize: 14,
    marginBottom: 24,
    textAlign: "center",
    fontStyle: "italic",
  },
  modalButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  errorModalButton: {
    backgroundColor: "#ffb300",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});