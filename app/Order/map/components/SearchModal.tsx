import MapboxSearch from "@/components/MapboxSearch";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SearchModalProps {
    setModal: (modal: string) => void;
    handleSelectDestination: (location: any) => void;
    setShowSearchModal: (show: boolean) => void;
    showSearchModal: boolean;
    suggestedLocations: {
        id: number;
        name: string;
        address: string;
        latitude: number;
        longitude: number;
    }[];
}

export default function SearchModal({
    setModal,
    handleSelectDestination,
    setShowSearchModal,
    showSearchModal,
    suggestedLocations
}: SearchModalProps) {

    // Handle MapboxSearch selection
    const handleMapboxSelect = (place: any) => {
        console.log("📍 MapboxSearch selected:", place);

        const destinationData = {
            latitude: place?.center[1],
            longitude: place?.center[0],
            address: place?.place_name,
            name: place?.text || place?.place_name.split(',')[0],
        };

        handleSelectDestination(destinationData);
        setShowSearchModal(false);
        setModal('chooseRide');
    };

    // Handle suggested location selection
    const handleSuggestionSelect = (loc: any) => {
        console.log("📍 Suggestion selected:", loc);

        const destinationData = {
            latitude: loc?.latitude,
            longitude: loc?.longitude,
            address: loc?.address,
            name: loc?.name,
        };

        handleSelectDestination(destinationData);
        setShowSearchModal(false);
        setModal('chooseRide');
    };

    return (
        <Modal
            visible={showSearchModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={() => setShowSearchModal(false)}
                    >
                        <Feather name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Search Destination</Text>
                </View>

                <View style={styles.searchContainerWrapper}>
                    <MapboxSearch
                        onSelectPlace={handleMapboxSelect}
                        accessToken={process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN || ''}

                    />
                </View>

                <View style={styles.suggestedSection}>
                    <Text style={styles.suggestedTitle}>Popular Destinations</Text>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {suggestedLocations.map((loc) => (
                            <TouchableOpacity
                                key={loc.id}
                                style={styles.modalSuggestionItem}
                                onPress={() => handleSuggestionSelect(loc)}
                            >
                                <FontAwesome5 name="map-marker-alt" size={18} color="#f0d46d" />
                                <View style={styles.modalSuggestionText}>
                                    <Text style={styles.modalSuggestionName}>{loc.name}</Text>
                                    <Text style={styles.modalSuggestionAddress}>{loc.address}</Text>
                                </View>
                                <Feather name="chevron-right" size={20} color="#666" />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    mapContainer: {
        flex: 1,
        backgroundColor: '#333',
        position: 'relative',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mapPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapText: {
        fontSize: 16,
        color: '#f0d46d',
        marginTop: 10,
    },
    mapInfoBadge: {
        position: 'absolute',
        top: 100,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    mapInfoText: {
        color: '#f0d46d',
        fontSize: 14,
        fontWeight: '600',
    },
    markerContainer: {
        alignItems: 'center',
        backgroundColor: "#ffbc07",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center'
    },
    title: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",

    },

    pickupMarkerContainer: {
        height: 40,
        width: 40,
        borderRadius: 10,
        backgroundColor: "#1f1f1fff",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },

    mapContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapSubtext: {
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 5,
    },
    topBar: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    iconContainer: {
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 50,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    panelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
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
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'semibold',
        color: 'white',
        // flex: 1,
        textAlign: 'center',
    },
    locationIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    locationIndicatorText: {
        fontSize: 12,
        color: '#4CAF50',
        marginLeft: 4,
        fontWeight: '600',
    },
    locationInputCard: {
        backgroundColor: '#2b2b2b',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    inputContainer: {
        flex: 1,
    },
    locationPinLine: {
        alignItems: 'center',
        marginRight: 15,
        marginTop: 5,
    },
    startPin: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
    },
    line: {
        width: 1.5,
        height: 40,
        backgroundColor: '#555',
        marginVertical: 4,
    },
    endPin: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#f0d46d',
    },
    inputBox: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 12,
        color: '#aaa',
        marginBottom: 4,
    },
    inputValue: {
        fontSize: 16,
        color: 'white',
        fontWeight: '500',
    },
    currentLocationText: {
        color: '#4CAF50',
        fontWeight: '600',
    },
    placeholderText: {
        color: '#666',
        fontStyle: 'italic',
    },
    selectedDestination: {
        color: '#f0d46d',
        fontWeight: '600',
    },
    locationAccuracy: {
        fontSize: 12,
        color: '#4CAF50',
        marginTop: 4,
        fontStyle: 'italic',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#333',
    },
    selectedSuggestion: {
        backgroundColor: 'rgba(240, 212, 109, 0.1)',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginHorizontal: -10,
    },
    suggestionTextContainer: {
        marginLeft: 15,
        flex: 1,
    },
    suggestionName: {
        fontSize: 16,
        color: 'white',
        fontWeight: '500',
        marginBottom: 4,
    },
    selectedSuggestionText: {
        color: '#f0d46d',
        fontWeight: '600',
    },
    suggestionAddress: {
        fontSize: 12,
        color: '#aaa',
        lineHeight: 16,
    },
    coordinatesText: {
        fontSize: 10,
        color: '#666',
        marginTop: 2,
    },
    searchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2b2b2b',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    searchButtonText: {
        color: '#f0d46d',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
    confirmButton: {
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginBottom: 10,
        justifyContent: 'center',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomSpacing: {
        height: 20,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        paddingTop: 60,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    modalCloseButton: {
        padding: 8,
        backgroundColor: '#333',
        borderRadius: 50,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 15,
    },
    searchContainerWrapper: {
        padding: 20,
        zIndex: 10,
    },
    suggestedSection: {
        flex: 1,
        paddingHorizontal: 20,
    },
    suggestedTitle: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    modalSuggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#2b2b2b',
        borderRadius: 10,
        marginBottom: 10,
    },
    modalSuggestionText: {
        flex: 1,
        marginLeft: 15,
    },
    modalSuggestionName: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    modalSuggestionAddress: {
        color: '#aaa',
        fontSize: 12,
    },
})