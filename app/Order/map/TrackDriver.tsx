import CustomButton from "@/components/ui/CustomButton";
import { useRide } from "@/context/RideContext";
import { useRideId } from "@/context/RideIdContext";
import { SocketContext } from "@/context/WebSocketProvider";
import { getCurrentLocation } from "@/hooks/useCurrLocation";
import { useCancelRideEndPoint } from "@/services/cancelRide.service";
import { useRideDetails } from "@/services/rideDetails.service";
import { calculateDistance } from "@/utils/geocoding";
import { reverseGeocode } from "@/utils/googleGeocoding";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import RideMapView from "./components/RideMapView";
import useMapModal from "./hooks/useMapModal";

const { height } = Dimensions.get("window");

interface SetLocationProps {
    goBack: () => void;
    setScreen: (screen: string, data?: any) => void;
}

export default function TrackDriver({ goBack, setScreen }: SetLocationProps) {
    const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
    const [locationLoading, setLocationLoading] = useState(false);
    const [addressLoading, setAddressLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [messageText, setMessageText] = useState("");
    const chatScrollRef = useRef<ScrollView>(null);

    const { setSelectedLocation, setPickupLocation, pickupLocation, dropoffLocation, setDropoffLocation } = useMapModal();
    const { driverLocation, rideState, resetRide } = useRide();
    const { rideId } = useRideId();
    const { data: rideDetails } = useRideDetails(rideId);
    const { mutate: cancelRide, isPending: isCanceling } = useCancelRideEndPoint();
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [selectedCancelReason, setSelectedCancelReason] = useState<string | null>(null);
    const cancelReasons = [
        "Driver took too long",
        "Changed my mind",
        "Wrong pickup location",
        "Emergency",
        "Other",
    ];

    const [routeInfo, setRouteInfo] = useState<{ duration: number; distance: number } | null>(null);

    const driverLocData = useMemo(
        () =>
            driverLocation
                ? {
                    latitude: driverLocation.lat,
                    longitude: driverLocation.lng,
                    address: "Driver",
                }
                : null,
        [driverLocation?.lat, driverLocation?.lng],
    );

    const dropoffLocData = useMemo(() => {
        const lat = parseFloat(rideDetails?.dropoff_lat);
        const lng = parseFloat(rideDetails?.dropoff_lng);
        if (!lat || !lng) return null;
        return {
            latitude: lat,
            longitude: lng,
            address: rideDetails?.dropoff_address || "Dropoff",
            name: rideDetails?.dropoff_name || rideDetails?.dropoff_address,
        };
    }, [rideDetails?.dropoff_lat, rideDetails?.dropoff_lng, rideDetails?.dropoff_address, rideDetails?.dropoff_name]);

    const isEnRoute = rideState === "driver_on_way" || rideState === "driver_arrived";
    const isInProgress = rideState === "in_progress";

    const mapPickup = isEnRoute ? pickupLocation : null;
    const mapDropoff = isInProgress ? dropoffLocData : null;
    const routeFrom = isInProgress ? driverLocData : mapPickup;
    const routeTo = isInProgress ? mapDropoff : driverLocData;
    const showRoute = !!(routeFrom && routeTo);

    const etaText = useMemo(() => {
        if (!routeInfo) return null;
        const minutes = Math.max(1, Math.round(routeInfo.duration / 60));
        return `~${minutes} min`;
    }, [routeInfo]);

    const distanceInfo = useMemo(() => {
        const label = isInProgress ? "Trip distance" : "Driver distance";

        if (routeInfo?.distance) {
            const km = (routeInfo.distance / 1000).toFixed(2);
            return { label, value: `${km} km` };
        }

        if (isEnRoute) {
            if (!driverLocation || !location.latitude || !location.longitude) return null;
            const km = calculateDistance(
                location.latitude,
                location.longitude,
                driverLocation.lat,
                driverLocation.lng,
            );
            return { label, value: `${km} km` };
        }
        if (isInProgress) {
            if (!driverLocation || !dropoffLocData) return null;
            const km = calculateDistance(
                driverLocation.lat,
                driverLocation.lng,
                dropoffLocData.latitude,
                dropoffLocData.longitude,
            );
            return { label, value: `${km} km` };
        }
        return null;
    }, [isEnRoute, isInProgress, driverLocation, location, dropoffLocData, routeInfo]);

    const handleConfirmCancel = () => {
        if (!selectedCancelReason || !rideId) return;
        cancelRide(
            { rideId, reason: selectedCancelReason },
            {
                onSuccess: async () => {
                    setCancelModalVisible(false);
                    setSelectedCancelReason(null);
                    await resetRide();
                    goBack();
                },
                onError: (error: any) => {
                    console.error("Cancellation failed:", error);
                    Alert.alert(
                        "Cancellation Failed",
                        error?.response?.data?.detail || "Failed to cancel the ride.",
                    );
                },
            },
        );
    };
    const { chatMessages, sendChatMessage } = useContext(SocketContext);
    const driver = rideDetails?.driver;
    const currentMessages = rideId ? chatMessages[rideId] || [] : [];
    const riderPhone = rideDetails?.driver?.phone_number;
    console.log('ride detsssssssssssssssssss', rideDetails)

    useEffect(() => {
        if (rideDetails?.status === "cancelled") {
            console.log("[TRACK_DRIVER] Ride cancelled by backend; clearing active ride and going back.");
            resetRide();
            goBack();
        }
    }, [rideDetails?.status, resetRide, goBack]);

    const [isPanelUp, setIsPanelUp] = useState(false);
    const [isPanelVisible, setIsPanelVisible] = useState(true);
    const [slideAnim] = useState(new Animated.Value(height));
    const panelOpacity = useRef(new Animated.Value(1)).current;
    const panelTranslateY = useRef(new Animated.Value(0)).current;

    const rideStatusInfo = (() => {
        switch (rideState) {
            case "driver_on_way":
                return { label: "Driver on the way", color: "#FEB914" };
            case "driver_arrived":
                return { label: "Driver arrived", color: "#4CAF50" };
            case "in_progress":
                return { label: "Ride in progress", color: "#2196F3" };
            default:
                return { label: "Your ride is on the way", color: "#FEB914" };
        }
    })();

    const handleSelectPlace = async (place: any) => {
        setAddressLoading(true);
        const pickupData = {
            longitude: place?.center[0],
            latitude: place?.center[1],
            address: place?.place_name,
            name: place?.text || place.place_name.split(",")[0],
        };
        setSelectedLocation(pickupData as any);
        setLocation({ longitude: place?.center[0], latitude: place?.center[1] });
        setPickupLocation(pickupData);
        setAddressLoading(false);
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() || !rideId) return;
        const textToSend = messageText.trim();
        setMessageText("");
        try {
            await sendChatMessage(rideId, textToSend);
        } catch (err) {
            console.error("Failed to send chat:", err);
        }
    };

    const formatTime = (date: any) => {
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const togglePanel = () => {
        if (isPanelVisible) {
            Animated.parallel([
                Animated.timing(panelOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(panelTranslateY, {
                    toValue: height * 0.5,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => setIsPanelVisible(false));
        } else {
            setIsPanelVisible(true);
            Animated.parallel([
                Animated.timing(panelOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(panelTranslateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    };

    const handleMapPress = () => {
        if (showChat) {
            setShowChat(false);
            return;
        }
        togglePanel();
    };

    const handleCall = () => {
        if (riderPhone) {
            Linking.openURL(`tel:${riderPhone}`);
        }
    };

    useEffect(() => {
        (async () => {
            setLocationLoading(true);
            setDropoffLocation(null);
            try {
                const currentLocation = await getCurrentLocation();
                setLocation(currentLocation);
                setAddressLoading(true);
                const address = await reverseGeocode(
                    currentLocation?.latitude,
                    currentLocation?.longitude
                );
                setAddressLoading(false);
                setPickupLocation({
                    latitude: currentLocation?.latitude,
                    longitude: currentLocation?.longitude,
                    address: address ? address : "",
                    name: "Current Location",
                });
            } catch (error) {
                console.error("Error getting current location:", error);
                setAddressLoading(false);
            } finally {
                setLocationLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!locationLoading) {
            const timer = setTimeout(() => {
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }).start(() => setIsPanelUp(true));
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [locationLoading, slideAnim]);

    // Chat view
    if (showChat) {
        return (
            <View style={{ flex: 1, backgroundColor: "#000" }}>
                <StatusBar barStyle="light-content" backgroundColor="#000" />
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
                >
                    {/* Chat Header */}
                    <View style={styles.chatHeader}>
                        <TouchableOpacity onPress={() => setShowChat(false)} style={{ padding: 4, marginRight: 8 }}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>
                                {driver?.name || "Driver"}
                            </Text>
                            <Text style={{ color: "#FEB914", fontSize: 12, fontWeight: "500", marginTop: 2 }}>
                                {driver?.vehicle || "Active Ride"}
                            </Text>
                        </View>
                    </View>

                    {/* Messages */}
                    <ScrollView
                        ref={chatScrollRef}
                        style={{ flex: 1 }}
                        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                        onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
                        keyboardDismissMode="on-drag"
                    >
                        {currentMessages.map((msg: any) => (
                            <View
                                key={msg.id}
                                style={[
                                    styles.bubbleContainer,
                                    msg.sender === "user" ? styles.userContainer : styles.driverContainer,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.bubble,
                                        msg.sender === "user" ? styles.userBubble : styles.driverBubble,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.msgText,
                                            msg.sender === "user" ? { color: "#000" } : { color: "#fff" },
                                        ]}
                                    >
                                        {msg.text}
                                    </Text>
                                    <Text style={styles.timeText}>{formatTime(msg.timestamp)}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Input */}
                    <View style={styles.chatInputWrapper}>
                        <View style={styles.chatInputRow}>
                            <TextInput
                                style={styles.chatInput}
                                placeholder="Message your driver..."
                                placeholderTextColor="#666"
                                value={messageText}
                                onChangeText={setMessageText}
                                multiline
                                maxLength={500}
                            />
                            <TouchableOpacity
                                style={[styles.sendCircle, !messageText.trim() && styles.sendDisabled]}
                                onPress={handleSendMessage}
                                disabled={!messageText.trim()}
                            >
                                <Ionicons name="send" size={20} color={messageText.trim() ? "#000" : "#444"} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        );
    }

    // Main map + panel view
    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <TouchableWithoutFeedback onPress={handleMapPress}>
                <View style={{ flex: 1 }}>
                    <RideMapView
                        pickupLocation={mapPickup}
                        dropoffLocation={mapDropoff}
                        driverLocation={driverLocData}
                        routeFrom={routeFrom}
                        routeTo={routeTo}
                        showRoute={showRoute}
                        onRouteInfo={setRouteInfo}
                    />
                </View>
            </TouchableWithoutFeedback>

            {/* Bottom Panel */}
            <Animated.View
                style={[
                    styles.bottomPanel,
                    {
                        transform: [
                            { translateY: Animated.add(slideAnim, panelTranslateY) },
                        ],
                        opacity: panelOpacity,
                    },
                ]}
                pointerEvents={isPanelVisible ? "auto" : "none"}
            >
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                    <View style={{ flex: 1, gap: 15 }}>
                        {/* Drag handle */}
                        <View style={{ alignItems: "center", marginBottom: 5 }}>
                            <View style={{ width: 40, height: 4, backgroundColor: "#444", borderRadius: 2 }} />
                        </View>

                        {/* Status badge */}
                        <View style={styles.statusBadge}>
                            <View style={[styles.statusDot, { backgroundColor: rideStatusInfo.color }]} />
                            <Text style={[styles.statusLabel, { color: rideStatusInfo.color }]}>
                                {rideStatusInfo.label}
                            </Text>
                        </View>

                        {/* Driver info row */}
                        <View style={styles.driverInfoRow}>
                            <View style={styles.driverAvatarContainer}>
                                <Image
                                    source={(() => {
                                        if (!driver?.profile_image) return require("../../../assets/images/Ava.png");

                                        const uri =
                                            typeof driver.profile_image === "object" && driver.profile_image?.file
                                                ? driver.profile_image.file
                                                : typeof driver.profile_image === "string"
                                                    ? driver.profile_image
                                                    : null;

                                        return uri ? { uri } : require("../../../assets/images/Ava.png");
                                    })()}
                                    style={styles.driverAvatar}
                                    resizeMode="cover"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.driverName}>{driver?.name || "Your Driver"}</Text>
                                <Text style={styles.vehicleText}>
                                    {driver?.vehicle || rideDetails?.vehicle_type || "Vehicle"}
                                </Text>
                            </View>
                            {driver?.rating && (
                                <View style={styles.ratingContainer}>
                                    <Ionicons name="star" size={14} color="#f6a623" />
                                    <Text style={styles.ratingValue}>
                                        {parseFloat(driver.rating).toFixed(1)}
                                    </Text>
                                    <Text style={styles.ratingLabel}>rating</Text>
                                </View>
                            )}
                        </View>

                        {(etaText || distanceInfo) && (
                            <View style={styles.infoRow}>
                                {etaText ? (
                                    <View style={styles.infoCard}>
                                        <Ionicons name="time-outline" size={18} color="#FEB914" />
                                        <Text style={styles.infoLabel}>
                                            {isInProgress ? "Arrival ETA" : "Driver ETA"}
                                        </Text>
                                        <Text style={styles.infoValue}>{etaText}</Text>
                                    </View>
                                ) : showRoute ? (
                                    <View style={styles.infoCard}>
                                        <ActivityIndicator size="small" color="#FEB914" />
                                        <Text style={styles.infoLabel}>Calculating ETA…</Text>
                                    </View>
                                ) : null}
                                {distanceInfo && (
                                    <View style={styles.infoCard}>
                                        <Ionicons name="navigate-outline" size={18} color="#FEB914" />
                                        <Text style={styles.infoLabel}>{distanceInfo.label}</Text>
                                        <Text style={styles.infoValue}>{distanceInfo.value}</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Action buttons */}
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => { console.log("Calling driver..."); handleCall(); }}>
                                <View style={styles.actionCircle}>
                                    <Ionicons name="call" size={22} color="#f6a623" />
                                </View>
                                <Text style={styles.actionLabel}>Call</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowChat(true)}>
                                <View style={styles.actionCircle}>
                                    <Ionicons name="chatbubble" size={22} color="#f6a623" />
                                </View>
                                <Text style={styles.actionLabel}>Chat</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionBtn} onPress={() => console.log("Sharing ride...")}>
                                <View style={styles.actionCircle}>
                                    <Ionicons name="share-social" size={22} color="#f6a623" />
                                </View>
                                <Text style={styles.actionLabel}>Share</Text>
                            </TouchableOpacity>
                        </View>

                        <CustomButton
                            title="SOS"
                            onPress={() => console.log("SOS pressed")}
                            style={{ backgroundColor: "#e74c3c", marginBottom: 15 }}
                        />

                        {(rideState === "driver_on_way" || rideState === "driver_arrived") && (
                            <CustomButton
                                title={isCanceling ? "Cancelling..." : "Cancel Ride"}
                                onPress={() => setCancelModalVisible(true)}
                                disabled={isCanceling}
                                style={{ backgroundColor: "#e74c3c", marginBottom: 15 }}
                            />
                        )}
                    </View>
                </ScrollView>
            </Animated.View>

            <Modal
                visible={cancelModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCancelModalVisible(false)}
            >
                <Pressable
                    style={styles.modalBackdrop}
                    onPress={() => !isCanceling && setCancelModalVisible(false)}
                >
                    <Pressable style={styles.modalCard} onPress={() => { }}>
                        <Text style={styles.modalTitle}>Cancel Ride</Text>
                        <Text style={styles.modalSubtitle}>Select a reason</Text>
                        {cancelReasons.map((reason) => {
                            const selected = selectedCancelReason === reason;
                            return (
                                <TouchableOpacity
                                    key={reason}
                                    style={[styles.reasonRow, selected && styles.reasonRowSelected]}
                                    onPress={() => setSelectedCancelReason(reason)}
                                    disabled={isCanceling}
                                >
                                    <Text style={[styles.reasonText, selected && styles.reasonTextSelected]}>
                                        {reason}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: "#333" }]}
                                onPress={() => setCancelModalVisible(false)}
                                disabled={isCanceling}
                            >
                                <Text style={styles.modalBtnText}>Close</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalBtn,
                                    {
                                        backgroundColor: "#e74c3c",
                                        opacity: !selectedCancelReason || isCanceling ? 0.6 : 1,
                                    },
                                ]}
                                onPress={handleConfirmCancel}
                                disabled={!selectedCancelReason || isCanceling}
                            >
                                {isCanceling ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.modalBtnText}>Confirm</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Show panel button when hidden */}
            {!isPanelVisible && isPanelUp && (
                <TouchableOpacity style={styles.showPanelBtn} onPress={togglePanel}>
                    <Ionicons name="chevron-up" size={24} color="#FEB914" />
                </TouchableOpacity>
            )}

            {/* Back button */}
            <TouchableOpacity style={styles.headerIconContainer} onPress={() => goBack()}>
                <Ionicons name="arrow-back" size={24} color="#111" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    // Bottom panel
    bottomPanel: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.42,
        backgroundColor: "#181818",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 20,
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    headerIconContainer: {
        backgroundColor: "#fff",
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 45,
        left: 20,
    },

    // Status badge
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusLabel: {
        fontSize: 14,
        fontWeight: "600",
    },

    // Driver info
    driverInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 5,
    },
    driverAvatarContainer: {
        width: 52,
        height: 52,
        borderRadius: 26,
        borderWidth: 2,
        borderColor: "#f6a623",
        overflow: "hidden",
    },
    driverAvatar: {
        width: "100%",
        height: "100%",
    },
    driverName: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#fff",
    },
    vehicleText: {
        fontSize: 13,
        color: "#aaa",
        marginTop: 2,
    },
    distanceContainer: {
        alignItems: "center",
        backgroundColor: "rgba(254,185,20,0.12)",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
    },
    distanceLabel: {
        fontSize: 12,
        color: "#aaa",
        fontWeight: "600",
    },
    distanceValue: {
        fontSize: 18,
        color: "#FEB914",
        fontWeight: "bold",
        marginTop: 2,
    },
    infoRow: {
        flexDirection: "row",
        gap: 10,
    },
    infoCard: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "rgba(254,185,20,0.12)",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 2,
    },
    infoLabel: {
        fontSize: 11,
        color: "#aaa",
        fontWeight: "600",
    },
    infoValue: {
        fontSize: 16,
        color: "#FEB914",
        fontWeight: "bold",
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    modalCard: {
        backgroundColor: "#181818",
        borderRadius: 16,
        padding: 20,
    },
    modalTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    modalSubtitle: {
        color: "#aaa",
        fontSize: 13,
        marginTop: 4,
        marginBottom: 14,
    },
    reasonRow: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: "#222",
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#222",
    },
    reasonRowSelected: {
        backgroundColor: "rgba(231,76,60,0.15)",
        borderColor: "#e74c3c",
    },
    reasonText: {
        color: "#ddd",
        fontSize: 14,
    },
    reasonTextSelected: {
        color: "#fff",
        fontWeight: "600",
    },
    modalActions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 12,
    },
    modalBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    modalBtnText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    etaContainer: {
        alignItems: "center",
        backgroundColor: "rgba(254,185,20,0.12)",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
    },
    etaLabel: {
        fontSize: 11,
        color: "#aaa",
        fontWeight: "600",
    },
    etaValue: {
        fontSize: 16,
        color: "#FEB914",
        fontWeight: "bold",
    },

    // Rating
    ratingContainer: {
        alignItems: "center",
        backgroundColor: "rgba(246,166,35,0.1)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 3,
        flexDirection: "row",
    },
    ratingValue: {
        fontSize: 15,
        color: "#f6a623",
        fontWeight: "500",
    },
    ratingLabel: {
        fontSize: 11,
        color: "#888",
    },

    // Action buttons
    actionRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 10,
    },
    actionBtn: {
        alignItems: "center",
        gap: 6,
    },
    actionCircle: {
        height: 48,
        width: 48,
        borderRadius: 24,
        backgroundColor: "#1F212A",
        borderWidth: 1,
        borderColor: "#f6a623",
        alignItems: "center",
        justifyContent: "center",
    },
    actionLabel: {
        color: "#fff",
        fontSize: 13,
    },

    // Show panel button
    showPanelBtn: {
        position: "absolute",
        bottom: 20,
        alignSelf: "center",
        backgroundColor: "#181818",
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#333",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },

    // Chat styles
    chatHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: "#1a1a1a",
        backgroundColor: "#000",
    },
    bubbleContainer: {
        width: "100%",
        marginVertical: 4,
        flexDirection: "row",
    },
    userContainer: {
        justifyContent: "flex-end",
    },
    driverContainer: {
        justifyContent: "flex-start",
    },
    bubble: {
        maxWidth: "80%",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
    },
    userBubble: {
        backgroundColor: "#FEB914",
        borderBottomRightRadius: 4,
    },
    driverBubble: {
        backgroundColor: "#1a1a1a",
        borderBottomLeftRadius: 4,
    },
    msgText: {
        fontSize: 15,
        lineHeight: 20,
    },
    timeText: {
        fontSize: 10,
        color: "rgba(0,0,0,0.5)",
        alignSelf: "flex-end",
        marginTop: 4,
    },
    chatInputWrapper: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 30,
        backgroundColor: "#000",
        borderTopWidth: 1,
        borderTopColor: "#1a1a1a",
    },
    chatInputRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        backgroundColor: "#111",
        borderRadius: 24,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "#222",
    },
    chatInput: {
        flex: 1,
        color: "#fff",
        fontSize: 15,
        maxHeight: 100,
        paddingTop: 8,
        paddingBottom: 8,
        paddingHorizontal: 8,
    },
    sendCircle: {
        backgroundColor: "#FEB914",
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
        marginBottom: 2,
    },
    sendDisabled: {
        backgroundColor: "#222",
    },
});