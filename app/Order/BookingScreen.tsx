import { useAuth } from "@/context/AuthContext";
import { SocketContext } from "@/context/WebSocketProvider";
import { getRideEstimate } from "@/services/apiservice";
import { useLogoutEndPoint } from "@/services/authentication.service";
import { darkMapStyle } from "@/styles/darkMapStyle";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

const { height } = Dimensions.get("window");

if (!Constants.expoConfig?.extra?.googleMapsApiKey) {
  throw new Error("API is missing in expoConfig.extra");
}

const GOOGLE_API_KEY = Constants.expoConfig.extra.googleMapsApiKey;

type RideOption = {
  name: string;
  details: string;
  price: string;
  rawPrice: number;
  originalPrice?: string | null;
  carType: string;
  passengers: number;
  image: any;
  screen: string;
  rideId: string;
};

interface RideDetails {
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
}

export default function BookingScreen({
  setScreen,
  goBack,
  pickupLat,
  pickupLong,
  dropoffLat,
  dropoffLong,
  pickupAddress,
  dropoffAddress,
}: {
  setScreen: (screen: string, navigationData?: any) => void;
  goBack: () => void;
  pickupLat: number;
  pickupLong: number;
  dropoffLat: number;
  dropoffLong: number;
  pickupAddress: string;
  dropoffAddress: string;
}) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);
  const [selectedRide, setSelectedRide] = useState<string | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [rideOptions, setRideOptions] = useState<RideOption[]>([]);
  const [rideId, setRideId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authExpired, setAuthExpired] = useState(false);
  const [rideDetails, setRideDetails] = useState<RideDetails>({
    pickup: {
      pickupLat: 0,
      pickupLong: 0,
    },
    destination: {
      dropoffLat: 0,
      dropoffLong: 0,
    },
    estimated_distance: "",
    estimated_duration: "",
    car_type: "",
    estimated_fare: 0,
  });

  const { socket, isConnected } = useContext(SocketContext);
  const { clearTokens, getValidToken } = useAuth();

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100) {
          Animated.timing(slideAnim, {
            toValue: height * 0.7,
            duration: 300,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const logoutMutation = useLogoutEndPoint();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      await clearTokens();
      setAuthExpired(false);
      setScreen("login");
    }
  };

  useEffect(() => {
    console.log("BookingScreen props:", pickupLat, pickupLong, dropoffLat, dropoffLong, pickupAddress, dropoffAddress);
  }, [pickupLat, pickupLong, dropoffLat, dropoffLong, pickupAddress, dropoffAddress]);

  useEffect(() => {
    if (mapRef.current && pickupLat && pickupLong && dropoffLat && dropoffLong) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(
          [
            { latitude: pickupLat, longitude: pickupLong },
            { latitude: dropoffLat, longitude: dropoffLong },
          ],
          {
            edgePadding: { top: 100, right: 50, bottom: 400, left: 50 },
            animated: true,
          }
        );
      }, 500);
    }
  }, [pickupLat, pickupLong, dropoffLat, dropoffLong]);

  const round6 = (n: number) => Number(n.toFixed(6));

  // Image mapping for ride types
  const images = [
    require("../../assets/images/car.png"),
    require("../../assets/images/car1.png"),
    require("../../assets/images/car2.png"),
  ];

  const fetchRideEstimates = useCallback(async () => {
    if (!pickupLat || !pickupLong || !dropoffLat || !dropoffLong) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getValidToken();
      if (!token) throw new Error("No active authentication token found (session missing)");

      const rideData = {
        pickup_lat: round6(pickupLat),
        pickup_lng: round6(pickupLong),
        dropoff_lat: round6(dropoffLat),
        dropoff_lng: round6(dropoffLong),
        pickup_address: pickupAddress,
        dropoff_address: dropoffAddress,
      };
      console.log("Ride payload:", JSON.stringify(rideData, null, 2));

      const response = await getRideEstimate(rideData);
      console.log("Ride estimates API response:", JSON.stringify(response, null, 2));

      // Updated to match your API response structure
      if (response.status_code === 200 && response.data?.rides) {
        const apiData = response.data;

        setRideDetails({
          pickup: { pickupLat, pickupLong },
          destination: { dropoffLat, dropoffLong },
          estimated_distance: apiData.estimated_distance.toString(),
          estimated_duration: apiData.estimated_duration.toString(),
          car_type: "",
          estimated_fare: 0,
        });

        const formattedRides = apiData.rides.map((ride: any, index: number) => ({
          name: `Kablux ${ride.name.charAt(0).toUpperCase() + ride.name.slice(1)}`,
          details: `${Math.round(apiData.estimated_duration / 60)} min - ${apiData.estimated_distance.toFixed(2)} km`,
          price: `₦${ride.estimated_fare.toLocaleString()}`,
          rawPrice: ride.estimated_fare,
          originalPrice: null, // No discount in current API response
          carType: ride.car_type,
          passengers: ride.car_size,
          rideId: ride.name,
          image: images[index] || images[0], // Use index to get corresponding image, fallback to first
          screen: "standardScreen",
        }));

        setRideOptions(formattedRides);
        const ride_request_id = apiData.ride_request_id;
        setRideId(ride_request_id);
        await AsyncStorage.setItem("ride_request_id", ride_request_id);
      } else {
        setError("Failed to fetch ride estimates");
      }
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("token found") || err.response?.status === 401) {
        setError("Session expired or missing. Please log in.");
        setAuthExpired(true);
      } else {
        setError(err.message || "Error fetching rides");
      }
    } finally {
      setLoading(false);
    }
  }, [pickupLat, pickupLong, dropoffLat, dropoffLong, pickupAddress, dropoffAddress, getValidToken]);

  useEffect(() => {
    fetchRideEstimates();
  }, [fetchRideEstimates]);

  function handleRetry() {
    fetchRideEstimates();
  }

  const handleConfirmRide = async () => {
    const selectedOption = rideOptions.find((option) => option.name === selectedRide);

    if (!selectedOption) {
      Alert.alert("Error", "Please select a ride option");
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }

    console.log("Selected ride option:", selectedOption);
    console.log("Selected payment method:", selectedPaymentMethod);

    const finalRideData = {
      ...selectedOption,
      rideDetails: {
        pickup: {
          pickupLat: pickupLat,
          pickupLong: pickupLong,
        },
        destination: {
          dropoffLat: dropoffLat,
          dropoffLong: dropoffLong,
        },
        estimated_distance: rideDetails.estimated_distance,
        estimated_duration: rideDetails.estimated_duration,
        car_type: selectedOption.carType,
        estimated_fare: selectedOption.rawPrice,
      },
      ride_request_id: rideId,
      paymentMethod: selectedPaymentMethod,
    };

    if (selectedRide?.includes("Standard")) {
      sendSubscription(socket, rideId, finalRideData);
      setScreen("standardScreen", finalRideData);
    } else if (selectedRide?.includes("Premium")) {
      sendSubscription(socket, rideId, finalRideData);
      setScreen("premiumScreen", finalRideData);
    } else if (selectedRide?.includes("Luxury")) {
      sendSubscription(socket, rideId, finalRideData);
      setScreen("standardScreen", finalRideData);
    } else {
      Alert.alert("Unavailable", "This ride option is not available.");
    }
  };

  function sendSubscription(socket: WebSocket | null, rideId: string, data: any, attempt = 0) {
    console.log(`🔍 [RIDER] sendSubscription called - attempt ${attempt + 1}`);

    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = {
        type: "subscribe_driver_offer_view",
        data: {
          ride_request_id: rideId,
        },
      };

      socket.send(JSON.stringify(message));
    }
  }

  return (
    <View style={styles.container}>
      {/* Map View */}
      {pickupLat && pickupLong && dropoffLat && dropoffLong ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: (pickupLat + dropoffLat) / 2,
            longitude: (pickupLong + dropoffLong) / 2,
            latitudeDelta: Math.abs(pickupLat - dropoffLat) * 2 || 0.05,
            longitudeDelta: Math.abs(pickupLong - dropoffLong) * 2 || 0.05,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          customMapStyle={darkMapStyle}
        >
          <Marker
            coordinate={{
              latitude: pickupLat,
              longitude: pickupLong,
            }}
            title="Pick-up Location"
            centerOffset={{ x: 0, y: -15 }}
          >
            <View style={styles.pickupMarkerContainer}>
              <Image
                source={require("../../assets/images/target.png")}
                style={{ width: 30, height: 30 }}
                resizeMode="contain"
              />
            </View>
          </Marker>

          <Marker
            coordinate={{
              latitude: dropoffLat,
              longitude: dropoffLong,
            }}
            title="Drop-off Location"
            pinColor="#f6a623"
          />

          <MapViewDirections
            origin={{
              latitude: pickupLat,
              longitude: pickupLong,
            }}
            destination={{
              latitude: dropoffLat,
              longitude: dropoffLong,
            }}
            apikey={GOOGLE_API_KEY}
            strokeWidth={4}
            strokeColor="#ffbc07"
            optimizeWaypoints={true}
            onReady={(result: any) => {
              console.log(`Distance: ${result.distance} km`);
              console.log(`Duration: ${result.duration} min`);
            }}
            onError={(errorMessage) => console.warn(errorMessage)}
          />
        </MapView>
      ) : (
        <View style={styles.mapPlaceholder}>
          <ActivityIndicator size="large" color="#f0d46d" />
          <Text style={styles.mapText}>Loading map...</Text>
        </View>
      )}

      {/* Sliding Bottom Overlay */}
      <Animated.View style={[styles.bottomPanel, { transform: [{ translateY: slideAnim }] }]} {...panResponder.panHandlers}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.panelHeader}>
            <TouchableOpacity style={styles.headerIconContainer} onPress={goBack}>
              <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Choose a Ride</Text>
          </View>

          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#f6a623" />
              <Text style={styles.loadingText}>Fetching available rides...</Text>
            </View>
          ) : error && authExpired ? (
            <View style={styles.centerContent}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleLogout}>
                <Text style={styles.retryButtonText}>Log In</Text>
              </TouchableOpacity>
            </View>
          ) : error ? (
            <View style={styles.centerContent}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : rideOptions.length > 0 ? (
            <>
              {rideOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.rideOptionItem,
                    selectedRide === option.name && {
                      borderColor: "#f6a623",
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => setSelectedRide(option.name)}
                >
                  <Image source={option.image} style={styles.rideImage} />
                  <View style={styles.rideDetails}>
                    <Text style={styles.rideName}>{option.name}</Text>
                    <Text style={styles.rideTiming}>{option.details}</Text>
                    <Text style={styles.rideInfo}>
                      {`${option.carType} `}
                      <Feather name="user" size={12} color="#aaa" />
                      {` ${option.passengers}`}
                    </Text>
                  </View>

                  <View style={styles.ridePriceContainer}>
                    <Text style={styles.ridePrice}>{option.price}</Text>
                    {option.originalPrice && <Text style={styles.rideOriginalPrice}>{option.originalPrice}</Text>}
                  </View>
                </TouchableOpacity>
              ))}

              <Modal visible={authExpired} transparent={true} animationType="fade">
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0,0,0,0.6)",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 12,
                      padding: 25,
                      width: "80%",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Session Expired</Text>
                    <Text style={{ textAlign: "center", marginBottom: 20 }}>
                      Your session has expired. Please log in again to continue.
                    </Text>
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#f6a623",
                        paddingVertical: 10,
                        paddingHorizontal: 25,
                        borderRadius: 8,
                      }}
                      onPress={async () => {
                        await clearTokens();
                        setAuthExpired(false);
                        setScreen("login");
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "bold" }}>Log In</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              {/* Payment Section */}
              <TouchableOpacity style={styles.paymentSection} onPress={() => setPaymentModalVisible(true)}>
                <Feather name="credit-card" size={20} color="#388e3c" />
                <Text style={styles.paymentText}>
                  {selectedPaymentMethod
                    ? `Pay with ${selectedPaymentMethod.charAt(0).toUpperCase() + selectedPaymentMethod.slice(1)}`
                    : "Select payment method"}
                </Text>
                <Feather name="chevron-right" size={20} color="#aaa" style={{ marginLeft: "auto" }} />
              </TouchableOpacity>

              {/* Confirm Button */}
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  {
                    backgroundColor: selectedRide && selectedPaymentMethod ? "#f6a623" : "#555",
                  },
                ]}
                disabled={!(selectedRide && selectedPaymentMethod)}
                onPress={handleConfirmRide}
              >
                <Text style={styles.confirmButtonText}>
                  {selectedPaymentMethod ? "Choose Ride" : "Select Payment Method"}
                </Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </>
          ) : (
            <View style={styles.centerContent}>
              <Text style={styles.errorText}>No rides available</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Payment Options Modal */}
      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Payment Method</Text>

            {["Cash", "Wallet"].map((method, i) => (
              <TouchableOpacity
                key={i}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedPaymentMethod(method.toLowerCase());
                  setPaymentModalVisible(false);
                }}
              >
                <Text style={styles.modalOptionText}>{`Pay with ${method}`}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setPaymentModalVisible(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  mapText: { fontSize: 18, fontWeight: "bold", color: "#aaa" },
  pickupMarkerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  headerIconContainer: {
    padding: 10,
    backgroundColor: "#333",
    borderRadius: 50,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.7,
    backgroundColor: "#1c1c1c",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  rideOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2b2b2b",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  rideImage: { width: 80, height: 50, resizeMode: "contain", marginRight: 15 },
  rideDetails: { flex: 1 },
  rideName: { fontSize: 18, fontWeight: "bold", color: "white" },
  rideTiming: { fontSize: 14, color: "#aaa", marginTop: 5 },
  rideInfo: { fontSize: 12, color: "#aaa", marginTop: 5 },
  ridePriceContainer: { alignItems: "flex-end" },
  ridePrice: { fontSize: 20, fontWeight: "bold", color: "white" },
  rideOriginalPrice: {
    fontSize: 12,
    color: "#aaa",
    textDecorationLine: "line-through",
  },
  paymentSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2b2b2b",
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  paymentText: { fontSize: 16, color: "white", marginLeft: 15 },
  confirmButton: {
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  confirmButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    color: "#aaa",
    fontSize: 16,
    marginTop: 15,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#f6a623",
    borderRadius: 10,
    padding: 12,
    marginTop: 20,
  },
  retryButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  modalOption: {
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginVertical: 8,
    width: "100%",
    alignItems: "center",
  },
  modalOptionText: { fontSize: 16, color: "#333" },
  modalCloseButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f6a623",
    borderRadius: 10,
  },
  modalCloseText: { color: "white", fontWeight: "bold" },
});