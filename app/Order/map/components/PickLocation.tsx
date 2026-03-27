import GooglePlacesSearch from "@/components/GooglePlacesSearch";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={{ flex: 1 }}>
                <Text style={styles.title}>Set your Pick-up Location</Text>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <GooglePlacesSearch
                        onSelectPlace={handleSelectPlace}
                        apiKey={process.env.EXPO_PUBLIC_GOOGLE_API_KEY || ''}
                    />
                </View>

                {/* Confirm Button */}
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        { backgroundColor: '#f6a623' },
                    ]}
                    onPress={handleManualConfirm}
                >
                    <Text style={styles.confirmText}>
                        {pickupLocation ? "Use Current Location" : "Confirm Pick-up"}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    map: {
        ...StyleSheet.absoluteFillObject,
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