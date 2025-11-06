import { SocketContext } from "@/context/WebSocketProvider";
import { getRideEstimate } from "@/services/apiservice";
import { useBookStandard } from "@/services/bookStandard";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useEffect, useRef, useState } from "react";
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
import Car from "../../assets/images/car.png";

const { height } = Dimensions.get("window");

// Google Maps API Key - replace with your actual key
const GOOGLE_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

// Dark map style
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#181818" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#2c2c2c" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8a8a8a" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#373737" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3c3c3c" }],
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [{ color: "#4e4e4e" }],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3d3d3d" }],
  },
];

type RideOption = {
  name: string;
  details: string;
  price: string;
  originalPrice?: string | null;
  carType: string;
  passengers: number;
  image: any;
  screen: string;
  rideId: string;
};

// Add this after the existing interfaces

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
  dropoffLong
}: { 
  setScreen: (screen: string) => void; 
  goBack: () => void;
  pickupLat: number;
  pickupLong: number;
  dropoffLat: number;
  dropoffLong: number;
}) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);
  const [selectedRide, setSelectedRide] = useState<string | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [rideOptions, setRideOptions] = useState<RideOption[]>([]);
  const [rideId, setRideId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bookStandard = useBookStandard();
  const [rideDetails, setRideDetails] = useState<RideDetails>({
    pickup: {
      pickupLat: 0,
      pickupLong: 0
    },
    destination: {
      dropoffLat: 0,
      dropoffLong: 0
    },
    estimated_distance: '',
    estimated_duration: '',
    car_type: '',
    estimated_fare: 0
  });


  const { socket, isConnected } = useContext(SocketContext);

  // Handle swipe gestures
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

  useEffect(() => {
    console.log("BookingScreen props:", pickupLat, pickupLong, dropoffLat, dropoffLong);
  }, [pickupLat, pickupLong, dropoffLat, dropoffLong]);

  // Fit map to show both markers
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

  useEffect(() => {
    const fetchRideEstimates = async () => {
      if (!pickupLat || !pickupLong || !dropoffLat || !dropoffLong) return;

      setLoading(true);
      setError(null);

      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        // Build ride data
        const rideData = {
          pickup_lat: pickupLat,
          pickup_lng: pickupLong,
          dropoff_lat: dropoffLat,
          dropoff_lng: dropoffLong,
        };

        // Call the reusable hook
        const data = await getRideEstimate(rideData);
        console.log("Ride estimates API response:", data);
        console.log(data.data.rides[0]);

        if (data.status === "success" && data.data?.rides) {
          const formattedRides = data.data.rides.map((ride: any) => ({
            name: `Kablux ${ride.name.charAt(0).toUpperCase() + ride.name.slice(1)}`,
            details: `${data.data.estimated_duration} - ${data.data.estimated_distance}`,
            price: `₦${(ride.estimated_fare / 100).toLocaleString()}`,
            originalPrice: ride.discount_price 
              ? `₦${(ride.discount_price / 100).toLocaleString()}`
              : null,
            carType: ride.car_type,
            passengers: ride.car_size,
            image: Car,
            screen: ride.name.toLowerCase() + "Screen",
            rideId: ride.name,
          }));

          setRideOptions(formattedRides);
          const ride_request_id = data.data.ride_request_id;
          setRideId(ride_request_id);
          setRideDetails({
            pickup: {pickupLat, pickupLong},
          destination: {dropoffLat, dropoffLong},
          estimated_distance: data.data.estimated_distance,
          estimated_duration: data.data.estimated_duration,
          car_type: "Mid-size car",
          estimated_fare: data.data.rides[0].estimated_fare,
          })
          await AsyncStorage.setItem("ride_request_id", ride_request_id);
          console.log("Stored", ride_request_id);
        } else {
          setError("Failed to fetch ride estimates");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error fetching rides");
      } finally {
        setLoading(false);
      }
    };

    fetchRideEstimates();
  }, [pickupLat, pickupLong, dropoffLat, dropoffLong]);

  // Handle confirm ride navigation
  const handleConfirmRide = async () => {
    const selectedOption = rideOptions.find((option) => option.name === selectedRide);
    console.log(selectedOption);
    console.log(selectedRide);
    
    if (selectedRide?.includes("Standard")) {
      sendSubscription(socket, rideId);
      setScreen("standardScreen");
    } else {
      Alert.alert(
        "Unavailable",
        "This ride option is not available at the moment. Please choose Standard.",
        [{ text: "OK" }]
      );
    }
  };

function sendSubscription(socket: WebSocket | null, rideId: string, attempt = 0) {
  console.log(`🔍 [RIDER] sendSubscription called - attempt ${attempt + 1}`);
  
  if (socket && socket.readyState === WebSocket.OPEN) {
    const message = {
      type: "subscribe_driver_offer_view", 
      data: {
        ride_id: rideId,
        // ✅ FIXED: Standardize coordinate structure
        pickup: { 
          lat: rideDetails.pickup.pickupLat, 
          long: rideDetails.pickup.pickupLong 
        },
        destination: { 
          lat: rideDetails.destination.dropoffLat, 
          long: rideDetails.destination.dropoffLong 
        },
        estimated_distance: rideDetails.estimated_distance,
        estimated_duration: rideDetails.estimated_duration,
        car_type: rideDetails.car_type,
        estimated_fare: rideDetails.estimated_fare,
        timestamp: Date.now(),
      },
    };
    
    console.log("📡 [RIDER] Sending message:", JSON.stringify(message, null, 2));
    
    try {
      socket.send(JSON.stringify(message));
      console.log("✅ [RIDER] Message sent successfully!");
      return;
    } catch (err) {
      console.error("❌ [RIDER] Failed to send message:", err);
      return;
    }
  }
  // ... rest of retry logic
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
          {/* Pickup Location Marker */}
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
                source={require('../../assets/images/target.png')}
                style={{ width: 30, height: 30 }}
                resizeMode="contain"
              />
            </View>
          </Marker>

          {/* Dropoff Location Marker */}
          <Marker
            coordinate={{
              latitude: dropoffLat,
              longitude: dropoffLong,
            }}
            title="Drop-off Location"
            pinColor="#f6a623"
          />

          {/* Route Line */}
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
      <Animated.View
        style={[styles.bottomPanel, { transform: [{ translateY: slideAnim }] }]}
        {...panResponder.panHandlers}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.panelHeader}>
            <TouchableOpacity style={styles.headerIconContainer} onPress={goBack}>
              <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Choose a Ride</Text>
          </View>

          {/* Loading State */}
          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#f6a623" />
              <Text style={styles.loadingText}>Fetching available rides...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContent}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                  setError(null);
                  setLoading(true);
                }}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : rideOptions.length > 0 ? (
            <>
              {/* Ride Options */}
              {rideOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.rideOptionItem,
                    selectedRide === option.name && { 
                      borderColor: "#f6a623", 
                      borderWidth: 2 
                    },
                  ]}
                  onPress={() => setSelectedRide(option.name)}
                >
                  <Image source={option.image} style={styles.rideImage} />
                  <View style={styles.rideDetails}>
                    <Text style={styles.rideName}>{option.name}</Text>
                    <Text style={styles.rideTiming}>{option.details}</Text>
                    <Text style={styles.rideInfo}>
                      {option.carType} <Feather name="user" size={12} color="#aaa" />{" "}
                      {option.passengers}
                    </Text>
                  </View>

                  <View style={styles.ridePriceContainer}>
                    <Text style={styles.ridePrice}>{option.price}</Text>
                    {option.originalPrice && (
                      <Text style={styles.rideOriginalPrice}>
                        {option.originalPrice}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              {/* Payment Section */}
              <TouchableOpacity
                style={styles.paymentSection}
                onPress={() => setPaymentModalVisible(true)}
              >
                <Feather name="credit-card" size={20} color="#388e3c" />
                <Text style={styles.paymentText}>Pay with cash</Text>
                <Feather
                  name="chevron-right"
                  size={20}
                  color="#aaa"
                  style={{ marginLeft: "auto" }}
                />
              </TouchableOpacity>

              {/* Confirm Button */}
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  { backgroundColor: selectedRide ? "#f6a623" : "#555" },
                ]}
                disabled={!selectedRide}
                onPress={handleConfirmRide}
              >
                <Text style={styles.confirmButtonText}>Choose Ride</Text>
              </TouchableOpacity>

              {/* Extra padding for scrolling */}
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

            {["Cash", "Crypto", "Transfer"].map((method, i) => (
              <TouchableOpacity
                key={i}
                style={styles.modalOption}
                onPress={() => {
                  setPaymentModalVisible(false);
                  Alert.alert("Payment Method", `Selected: Pay with ${method}`);
                }}
              >
                <Text style={styles.modalOptionText}>{`Pay with ${method}`}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setPaymentModalVisible(false)}
            >
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

  // Modal styles
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