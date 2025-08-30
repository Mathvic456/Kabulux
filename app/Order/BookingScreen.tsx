import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Car from "../../assets/images/car.png";

const { height } = Dimensions.get("window");

const rideOptions = [
  {
    name: "Kablux Original",
    details: "6:23pm - 20 mins",
    price: "N6,700",
    originalPrice: "N9,450",
    carType: "Mid Size Car",
    passengers: 4,
    image: Car,
  },
  {
    name: "Kablux Premium",
    details: "6:23pm - 20 mins",
    price: "N10,000",
    carType: "Smart Size Car",
    passengers: 4,
    image: Car,
  },
  {
    name: "Kablux Business",
    details: "6:23pm - 20 mins",
    price: "N6,700",
    carType: "Jeep Size Car",
    passengers: 2,
    image: Car,
  },
];

export default function BookingScreen({ setScreen }) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [selectedRide, setSelectedRide] = useState(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

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

  // Handle confirm ride navigation
  const handleConfirmRide = () => {
    if (!selectedRide) return;

    if (selectedRide === "Kablux Original") {
      setScreen("originalPriceDetails");
    } else if (selectedRide === "Kablux Premium") {
      setScreen("premiumdetailsscreen");
    } else if (selectedRide === "Kablux Business") {
      setScreen("businessdetailsscreen");
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
        <View style={styles.panelHeader}>
          <TouchableOpacity style={styles.headerIconContainer}>
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose a Ride</Text>
        </View>

        {/* Ride Options */}
        {rideOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.rideOptionItem,
              selectedRide === option.name && { borderColor: "#f6a623", borderWidth: 2 },
            ]}
            onPress={() => setSelectedRide(option.name)}
          >
            <Image source={Car} style={styles.rideImage} />
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
                <Text style={styles.rideOriginalPrice}>{option.originalPrice}</Text>
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
  panelHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  headerIconContainer: { padding: 10, backgroundColor: "#333", borderRadius: 50 },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "white", marginLeft: 20 },
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
