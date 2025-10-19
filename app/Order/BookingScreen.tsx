import { getRideEstimate } from "@/services/apiservice";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
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
import Car from "../../assets/images/car.png";

const { height } = Dimensions.get("window");

export default function BookingScreen({ 
  setScreen, 
  goBack,
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng
}: { 
  setScreen: (screen: string) => void; 
  goBack: () => void;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
}){
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


  const slideAnim = useRef(new Animated.Value(0)).current;
  const [selectedRide, setSelectedRide] = useState<string | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [rideOptions, setRideOptions] = useState<RideOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  console.log("BookingScreen props:", pickupLat, pickupLat, dropoffLat, dropoffLng);
}, [pickupLat, pickupLng, dropoffLat, dropoffLng]);


 useEffect(() => {
  const fetchRideEstimates = async () => {
    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) return;

    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      // Build ride data
      const rideData = {
        pickup_lat: pickupLat,
        pickup_lng: pickupLng,
        dropoff_lat: dropoffLat,
        dropoff_lng: dropoffLng,
      };

      // Call the reusable hook
      const data = await getRideEstimate(rideData);
      console.log("Ride estimates API response:", data);
      console.log(data.data.rides[0])

      if (data.status === "success" && data.data?.rides) {
        const formattedRides = data.data.rides.map((ride) => ({
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
        const ride_request_id = data.data.ride_request_id
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
}, [pickupLat, pickupLng, dropoffLat, dropoffLng]);

  // Handle confirm ride navigation
  const handleConfirmRide = () => {
  const selectedOption = rideOptions.find((option) => option.name === selectedRide);
  console.log(selectedOption);
    console.log(selectedRide)
  if (selectedRide?.includes("Standard")) {
    setScreen("standardScreen")
  } else {
    Alert.alert(
      "Unavailable",
      "This ride option is not available at the moment. Please choose Standard.",
      [{ text: "OK" }]
    );
  }
};

  return (
    <View style={styles.container}>
      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>[ Map Placeholder ]</Text>
      </View>

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
                onPress={() => setRideOptions([])}
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
                  alert(`Selected: Pay with ${method}`);
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
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  mapText: { fontSize: 18, fontWeight: "bold", color: "#aaa" },
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