import GooglePlacesSearch from "@/components/GooglePlacesSearch";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useMapModal from "../hooks/useMapModal";

export default function PickLocation({ setModal, handleSelectPlace }) {

    const { pickupLocation, modal, } = useMapModal();

    const handleManualConfirm = () => {
        console.log("Manual Confirm Clicked");
        console.log('selected', pickupLocation)
        setModal('setDestination');
        console.log(modal)
        if (pickupLocation) {
            console.log("Confirmed Location:", pickupLocation);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <Text style={styles.title}>Set your Pick-up Location</Text>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <GooglePlacesSearch
                    onSelectPlace={handleSelectPlace}
                    apiKey={process.env.EXPO_PUBLIC_GOOGLE_API_KEY || ''}
                />
            </View>

            {/* Loading State or Confirm Button */}
            <TouchableOpacity
                style={[
                    styles.confirmButton,
                    { backgroundColor: '#f6a623' },
                ]}
                // disabled={!pickupLocation}
                onPress={handleManualConfirm}
            >
                <Text style={styles.confirmText}>
                    {"Confirm Pick-up"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
const styles = StyleSheet.create({
    marker: {
        width: 30,
        height: 30,
        backgroundColor: "#fff",
        borderRadius: '50%',
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
        // padding: 10,
        backgroundColor: "#fff",
        borderRadius: "50%",
        // marginRight: 15,
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
        height: 50,
        width: 50,
        borderRadius: 10,
        backgroundColor: "#1f1f1fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
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