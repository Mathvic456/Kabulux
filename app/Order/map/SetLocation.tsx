import { getCurrentLocation } from "@/hooks/useCurrLocation";
import { reverseGeocode } from "@/utils/googleGeocoding";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapModal from "./SwitchModal";
import RideMapView from "./components/RideMapView";
import useMapModal from "./hooks/useMapModal";

const { height } = Dimensions.get('window');

interface SetLocationProps {
    goBack: () => void;
    setScreen: (screen: string, data?: any) => void
}

export default function SetLocation({ goBack, setScreen }: SetLocationProps) {
    const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
    const [locationLoading, setLocationLoading] = useState(false);
    const [addressLoading, setAddressLoading] = useState(false);

    const { setSelectedLocation, setPickupLocation, pickupLocation, dropoffLocation, setDropoffLocation } = useMapModal();
    const [isPanelUp, setIsPanelUp] = useState(false);
    const [slideAnim] = useState(new Animated.Value(height));

    const handleSelectPlace = async (place) => {
        console.log('Selected place:', place);

        setAddressLoading(true);

        const pickupData = {
            longitude: place?.center[0],
            latitude: place?.center[1],
            address: place?.place_name,
            name: place?.text || place.place_name.split(',')[0],
        };

        console.log('pickuoDta', pickupData)

        // Update selected location for map
        setSelectedLocation(pickupData);
        setLocation({ longitude: place?.center[0], latitude: place?.center[1] });

        // Update pickup location in context
        setPickupLocation(pickupData);

        setAddressLoading(false);

        // Map will automatically update when pickupLocation changes in RideMapView
    };

    useEffect(() => {
        (async () => {
            setLocationLoading(true);
            setDropoffLocation(null)
            try {
                const currentLocation = await getCurrentLocation();
                console.log("Current Location:", currentLocation);
                setLocation(currentLocation);

                // Get address for current location
                setAddressLoading(true);
                const address = await reverseGeocode(
                    currentLocation?.latitude,
                    currentLocation?.longitude
                );
                setAddressLoading(false);

                console.log("Current location address:", address);

                // Set as pickup location in context
                setPickupLocation({
                    latitude: currentLocation?.latitude,
                    longitude: currentLocation?.longitude,
                    address: address ? address : '',
                    name: 'Current Location',
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

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1, height: height * 0.55 }}>
                <RideMapView
                    pickupLocation={pickupLocation}
                    dropoffLocation={dropoffLocation}
                    showRoute={true}
                />
            </View>


            {/* Loading overlay */}
            {locationLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#f6a623" />
                    <Text style={styles.loadingText}>Getting your location...</Text>
                </View>
            )}

            {/* Address loading indicator */}
            {addressLoading && (
                <View style={styles.addressLoadingBadge}>
                    <ActivityIndicator size="small" color="#f6a623" />
                    <Text style={styles.addressLoadingText}>Loading address...</Text>
                </View>
            )}

            <Animated.View style={[styles.bottomPanel, { transform: [{ translateY: slideAnim }] }]}>
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                    <MapModal handleSelectPlace={handleSelectPlace} setScreen={setScreen} />
                </ScrollView>
            </Animated.View>

            <TouchableOpacity style={styles.headerIconContainer} onPress={() => goBack()}>
                <Ionicons name="arrow-back" size={24} color="#111" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    marker: {
        width: 30,
        height: 30,
        backgroundColor: "#fff",
        borderRadius: 15,
        borderColor: "white",
        borderWidth: 3,
    },
    markerImage: {
        width: 20,
        height: 20,
        alignSelf: "center",
        marginTop: 5,
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
    bottomSheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#181818",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: "#181818",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 20,
    },
    bottomPanel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.45,
        backgroundColor: '#181818',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    topBar: {
        position: "absolute",
        top: 50,
        left: 20,
        right: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        zIndex: 10,
    },
    iconContainer: {
        padding: 10,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        borderRadius: 50,
    },
    mapPlaceholder: {
        flex: 1,
        backgroundColor: "#333",
        position: "relative",
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 100,
    },
    loadingContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    loadingText: {
        color: "#f6a623",
        fontSize: 16,
        marginTop: 10,
        textAlign: "center",
    },
    addressLoadingBadge: {
        position: "absolute",
        top: 100,
        alignSelf: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        zIndex: 50,
    },
    addressLoadingText: {
        color: "#f6a623",
        fontSize: 14,
        fontWeight: "600",
    },
    locationFoundBadge: {
        position: "absolute",
        top: 100,
        alignSelf: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    locationFoundBadgeText: {
        color: "#4CAF50",
        fontSize: 16,
        fontWeight: "bold",
    },
    addressPreview: {
        color: "#a10505",
        fontSize: 14,
        textAlign: "center",
        marginTop: 10,
    },
    mapText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#f6a623",
    },
    markerContainer: {
        height: 30,
        width: 30,
        borderRadius: '50%',
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        borderWidth: 1,
        borderColor: '#f6a623'
    },
    title: {
        color: "white",
        fontSize: 16,
        marginBottom: 15,
        fontWeight: "bold",
        alignSelf: "center",
    },
    searchContainer: {
        marginBottom: 15,
        zIndex: 1,
    },
    locationDetails: {
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderLeftWidth: 3,
        borderLeftColor: "#4CAF50",
    },
    confirmButton: {
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
    },
    confirmText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});