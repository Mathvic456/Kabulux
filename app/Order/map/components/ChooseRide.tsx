import { SocketContext } from "@/context/WebSocketProvider";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useContext, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useMapModal from "../hooks/useMapModal";
import useRideEstimates from "../hooks/useRideEstimates";
import PaymentModal from "./PaymentModal";

interface ChooseRideProps {
    setModal: (modal: string) => void;
    setScreen?: (screen: string, data?: any) => void; // Add setScreen prop
}

export default function ChooseRide({ setModal, setScreen }: ChooseRideProps) {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [selectedRide, setSelectedRide] = useState<string | null>(null);
    const round6 = (n: number) => Number(n.toFixed(6));


    const { socket, isConnected } = useContext(SocketContext);
    const { pickupLocation, dropoffLocation } = useMapModal();

    // Prepare ride data for API
    const rideData = useMemo(() => {
        if (!pickupLocation || !dropoffLocation) return null;

        return {
            pickup_lat: round6(pickupLocation?.latitude),
            pickup_lng: round6(pickupLocation?.longitude),
            dropoff_lat: round6(dropoffLocation?.latitude),
            dropoff_lng: round6(dropoffLocation?.longitude),
            dropoff_address: dropoffLocation?.address,
            pickup_address: pickupLocation?.address

        };
    }, [pickupLocation, dropoffLocation]);

    // Fetch ride estimates with the prepared data
    const { rideOptions: fetchedRideOptions, rideId, rideDetails, loading, error } = useRideEstimates({ rideData });

    const handleConfirmRide = async () => {
        const selectedOption = fetchedRideOptions.find((option) => option.name === selectedRide);

        if (!selectedOption) {
            Alert.alert("Error", "Please select a ride option");
            return;
        }

        if (!selectedPaymentMethod) {
            Alert.alert("Error", "Please select a payment method");
            return;
        }

        if (!pickupLocation || !dropoffLocation) {
            Alert.alert("Error", "Pickup or dropoff location missing");
            return;
        }

        console.log("Selected ride option:", selectedOption);
        console.log("Selected payment method:", selectedPaymentMethod);

        const finalRideData = {
            ...selectedOption,
            rideDetails: {
                pickup: {
                    pickupLat: pickupLocation?.latitude,
                    pickupLong: pickupLocation?.longitude,
                    // pickupAddress: pickupLocation.address,
                    // pickupName: pickupLocation.name,
                },
                destination: {
                    dropoffLat: dropoffLocation?.latitude,
                    dropoffLong: dropoffLocation?.longitude,
                    // dropoffAddress: dropoffLocation.address,
                    // dropoffName: dropoffLocation.name,
                },
                estimated_distance: rideDetails?.estimated_distance,
                estimated_duration: rideDetails?.estimated_duration,
                car_type: selectedOption?.carType,
                estimated_fare: selectedOption?.rawPrice,
            },
            ride_request_id: rideId,
            paymentMethod: selectedPaymentMethod,
        };

        console.log("Final ride data being sent:", JSON.stringify(finalRideData, null, 2));

        // Send subscription to socket
        sendSubscription(socket, rideId, finalRideData);

        // Navigate to appropriate screen if setScreen is provided
        console.log('setScreen', setScreen)
        if (setScreen) {
            if (selectedRide?.includes("Standard")) {
                console.log('standard')
                setScreen("standardScreen", finalRideData);
            } else if (selectedRide?.includes("Premium")) {
                setScreen("premiumScreen", finalRideData);
            } else if (selectedRide?.includes("Luxury")) {
                setScreen("luxuryScreen", finalRideData);
            }
        }
    };

    function sendSubscription(socket: WebSocket | null, rideId: string, data: any, attempt = 0) {
        console.log(`🔍 [RIDER] sendSubscription called - attempt ${attempt + 1}`);
        console.log(`📍 Pickup: ${data.rideDetails.pickup.pickupAddress}`);
        console.log(`📍 Dropoff: ${data.rideDetails.destination.dropoffAddress}`);

        if (socket && socket.readyState === WebSocket.OPEN) {
            const message = {
                type: "subscribe_driver_offer_view",
                data: {
                    ride_request_id: rideId,
                    pickup_location: {
                        latitude: data?.rideDetails?.pickup?.pickupLat,
                        longitude: data?.rideDetails?.pickup?.pickupLong,
                        address: data?.rideDetails?.pickup?.pickupAddress,
                        // name: data.rideDetails.pickup.pickupName,
                    },
                    dropoff_location: {
                        latitude: data?.rideDetails?.destination?.dropoffLat,
                        longitude: data?.rideDetails?.destination?.dropoffLong,
                        address: data?.rideDetails?.destination?.dropoffAddress,
                        // name: data.rideDetails.destination.dropoffName,
                    },
                    ride_details: {
                        car_type: data?.rideDetails?.car_type,
                        estimated_fare: data?.rideDetails?.estimated_fare,
                        estimated_distance: data?.rideDetails?.estimated_distance,
                        estimated_duration: data?.rideDetails?.estimated_duration,
                    },
                    payment_method: data?.paymentMethod,
                },
            };

            console.log("📤 Sending socket message:", JSON.stringify(message, null, 2));
            socket.send(JSON.stringify(message));
        } else {
            console.error("❌ Socket is not open. ReadyState:", socket?.readyState);
            Alert.alert("Connection Error", "Unable to connect to server. Please try again.");
        }
    }

    // Show error if locations are missing
    if (!pickupLocation || !dropoffLocation) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Ionicons name="location-outline" size={48} color="#666" />
                <Text style={{ color: 'white', fontSize: 16, marginTop: 15, textAlign: 'center' }}>
                    Please select pickup and dropoff locations
                </Text>
                <TouchableOpacity
                    style={[styles.confirmButton, { marginTop: 20, backgroundColor: '#333' }]}
                    onPress={() => setModal('setDestination')}
                >
                    <Text style={styles.confirmText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Show error state
    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Ionicons name="alert-circle-outline" size={48} color="#f44336" />
                <Text style={{ color: '#f44336', fontSize: 16, marginTop: 15, textAlign: 'center' }}>
                    {error}
                </Text>
                <TouchableOpacity
                    style={[styles.confirmButton, { marginTop: 20, backgroundColor: '#333' }]}
                    onPress={() => setModal('setDestination')}
                >
                    <Text style={styles.confirmText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, flexDirection: "column", gap: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <TouchableOpacity style={styles.headerIconContainer} onPress={() => setModal("setDestination")}>
                    <Ionicons name="arrow-back" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Choose your ride</Text>
                <TouchableOpacity style={{ ...styles.headerIconContainer, width: 30, height: 30 }} onPress={() => setModal("pickupLocation")}>
                    <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Show location summary */}
            {/* <View style={styles.locationSummary}>
                <View style={styles.locationRow}>
                    <Ionicons name="navigate" size={16} color="#4CAF50" />
                    <Text style={styles.locationText} numberOfLines={1}>
                        {pickupLocation.name || 'Pickup'}
                    </Text>
                </View>
                <View style={styles.locationRow}>
                    <Ionicons name="location-sharp" size={16} color="#f6a623" />
                    <Text style={styles.locationText} numberOfLines={1}>
                        {dropoffLocation.name || dropoffLocation.address}
                    </Text>
                </View>
            </View> */}

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#f6a623" />
                    <Text style={{ color: 'white', marginTop: 15 }}>Loading ride options...</Text>
                </View>
            ) : (
                <>
                    <View>
                        {fetchedRideOptions.map((option, index) => (
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
                                    <Text style={styles.rideName}>{option?.name}</Text>
                                    <Text style={styles.rideTiming}>{option?.details}</Text>
                                    <Text style={styles.rideInfo}>
                                        {`${option.carType} `}
                                        <Feather name="user" size={12} color="#aaa" />
                                        {` ${option.passengers}`}
                                    </Text>
                                </View>

                                <View style={styles.ridePriceContainer}>
                                    <Text style={styles.ridePrice}>{option?.price}</Text>
                                    {option.originalPrice && <Text style={styles.rideOriginalPrice}>{option?.originalPrice}</Text>}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Payment Section */}
                    <TouchableOpacity style={styles.paymentSection} onPress={() => setPaymentModalVisible(true)}>
                        <Ionicons name="wallet" size={20} color="#388e3c" />
                        <Text style={styles.paymentText}>
                            {selectedPaymentMethod
                                ? `Pay with ${selectedPaymentMethod.charAt(0).toUpperCase() + selectedPaymentMethod.slice(1)}`
                                : "Select payment method"}
                        </Text>
                        <Feather name="chevron-right" size={20} color="#aaa" style={{ marginLeft: "auto" }} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.confirmButton,
                            {
                                backgroundColor: (!selectedRide || !selectedPaymentMethod) ? '#555' : '#f6a623',
                                opacity: (!selectedRide || !selectedPaymentMethod) ? 0.5 : 1,
                            },
                        ]}
                        disabled={!selectedRide || !selectedPaymentMethod}
                        onPress={handleConfirmRide}
                    >
                        <Text style={styles.confirmText}>
                            {selectedRide && selectedPaymentMethod ? "Confirm Ride" : "Select ride and payment"}
                        </Text>
                    </TouchableOpacity>
                </>
            )}

            <PaymentModal
                paymentModalVisible={paymentModalVisible}
                setPaymentModalVisible={setPaymentModalVisible}
                setSelectedPaymentMethod={setSelectedPaymentMethod}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    locationSummary: {
        backgroundColor: '#2b2b2b',
        borderRadius: 12,
        padding: 12,
        gap: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    locationText: {
        color: '#fff',
        fontSize: 14,
        flex: 1,
    },
    paymentSection: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2b2b2b",
        borderRadius: 15,
        padding: 15,
        width: "100%",
    },
    paymentText: { fontSize: 16, color: "white", marginLeft: 15 },
    confirmButton: {
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
        marginTop: 20,
        marginBottom: 10
    },
    headerIconContainer: {
        backgroundColor: "#333",
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    confirmText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
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
    rideOptionItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2b2b2b",
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
    },
});