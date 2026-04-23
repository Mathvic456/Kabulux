import { forwardGeocode } from "@/utils/googleGeocoding";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import useMapModal from "../hooks/useMapModal";
import { suggestedLocations } from "../lib/constants";
import SearchModal from "./SearchModal";
const { height } = Dimensions.get('window');


export default function PickDestination({ setModal }) {
    const {
        showSearchModal,
        setShowSearchModal,
        handleSelectDestination,
        pickupLocation,
        dropoffLocation,
        setPickupLocation,
    } = useMapModal();

    const [pickupText, setPickupText] = useState(pickupLocation?.address || pickupLocation?.name || '');
    const [dropoffText, setDropoffText] = useState(dropoffLocation?.address || '');
    const [isGeocodingPickup, setIsGeocodingPickup] = useState(false);
    const [isGeocodingDropoff, setIsGeocodingDropoff] = useState(false);
    const pickupTimerRef = useRef<NodeJS.Timeout | null>(null);
    const dropoffTimerRef = useRef<NodeJS.Timeout | null>(null);

    const handlePickupTextChange = useCallback((text: string) => {
        setPickupText(text);
        if (pickupTimerRef.current) clearTimeout(pickupTimerRef.current);
        if (text.trim().length < 5) return;

        pickupTimerRef.current = setTimeout(async () => {
            setIsGeocodingPickup(true);
            try {
                const result = await forwardGeocode(text.trim());
                if (result) {
                    setPickupLocation({
                        latitude: result.latitude,
                        longitude: result.longitude,
                        address: text.trim(),
                        name: text.trim(),
                    });
                }
            } catch (e) {
                console.error('[PickDestination] Pickup geocode error:', e);
            } finally {
                setIsGeocodingPickup(false);
            }
        }, 800);
    }, [setPickupLocation]);

    // const handleDropoffTextChange = useCallback((text: string) => {
    //     setDropoffText(text);
    //     if (dropoffTimerRef.current) clearTimeout(dropoffTimerRef.current);
    //     if (text.trim().length < 5) return;

    //     dropoffTimerRef.current = setTimeout(async () => {
    //         setIsGeocodingDropoff(true);
    //         try {
    //             const result = await forwardGeocode(text.trim());
    //             if (result) {
    //                 handleSelectDestination({
    //                     latitude: result.latitude,
    //                     longitude: result.longitude,
    //                     address: text.trim(),
    //                     name: text.trim(),
    //                 });
    //             }
    //         } catch (e) {
    //             console.error('[PickDestination] Dropoff geocode error:', e);
    //         } finally {
    //             setIsGeocodingDropoff(false);
    //         }
    //     }, 800);
    // }, [handleSelectDestination]);

    const shortenAddress = (address: string, maxLength: number = 35) => {
        if (address && address.length <= maxLength) return address;
        return address.substring(0, maxLength) + '...';
    };

    const handleSuggestionSelect = (loc) => {
        handleSelectDestination({
            latitude: loc?.latitude,
            longitude: loc?.longitude,
            address: loc?.address,
            name: loc?.name,
        });
        setDropoffText(loc?.address || loc?.name || '');
        setModal('chooseRide');
    };

    return (
        <View style={{ flex: 1, flexDirection: "column", gap: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <TouchableOpacity style={styles.headerIconContainer} onPress={() => setModal("pickupLocation")}>
                    <Ionicons name="arrow-back" size={20} color="#111" />
                </TouchableOpacity>
                <Text style={styles.title}>Plan your ride</Text>
                <TouchableOpacity style={{ ...styles.headerIconContainer, width: 30, height: 30 }} onPress={() => setModal("pickupLocation")}>
                    <Ionicons name="close" size={24} color="#111" />
                </TouchableOpacity>
            </View>
            <View>
                <View style={styles.locationInputCard}>
                    <View style={styles.inputRow}>
                        <View style={styles.locationPinLine}>
                            <View style={styles.startPin} >
                                <Ionicons name="navigate" size={12} color="#fff" />
                            </View>
                            <View style={styles.line} />
                            <View style={styles.startPin}>
                                <Ionicons name="location-sharp" size={12} color="#fff" />
                            </View>
                        </View>
                        <View style={styles.inputContainer}>
                            <View style={styles.inputBox}>
                                <Text style={styles.inputLabel}>Pick up Location {isGeocodingPickup ? '(locating...)' : ''}</Text>
                                <TextInput
                                    style={[styles.inputValue, styles.currentLocationText, styles.editableInput]}
                                    value={pickupText}
                                    onChangeText={handlePickupTextChange}
                                    placeholder="Enter pickup address"
                                    placeholderTextColor="#666"
                                />
                                {pickupLocation?.address && pickupText !== pickupLocation.address && (
                                    <Text style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
                                        {shortenAddress(pickupLocation.address, 50)}
                                    </Text>
                                )}
                            </View>

                            <View style={styles.inputBox}>
                                <Text style={styles.inputLabel}>
                                    Where to? {isGeocodingDropoff ? '(locating...)' : ''}
                                </Text>
                                <TouchableOpacity onPress={() => setShowSearchModal(true)}>
                                    <Text style={[
                                        styles.inputValue,
                                        dropoffLocation ? styles.selectedDestination : styles.placeholderText
                                    ]}>
                                        {dropoffText || 'Enter destination'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                </View>

                {/* <View>
                    {suggestedLocations.map((loc) => (
                        <TouchableOpacity
                            style={styles.suggestionItem}
                            onPress={() => handleSuggestionSelect(loc)}
                            key={loc?.id}
                        >
                            <Ionicons name="location-sharp" size={16} color="#fff" style={{ marginRight: 8 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.suggestionText} numberOfLines={1}>
                                    {loc?.name}
                                </Text>
                                <Text style={[styles.suggestionText, { fontSize: 12, color: "#aaa" }]} numberOfLines={1}>
                                    {loc?.address}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View> */}
            </View>

            <SearchModal
                setModal={setModal}
                handleSelectDestination={handleSelectDestination}
                setShowSearchModal={setShowSearchModal}
                showSearchModal={showSearchModal}
                suggestedLocations={suggestedLocations}
            />
        </View>
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
    suggestionText: {
        fontSize: 14,
        color: "#fff",
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
    bottomPanel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.60,
        backgroundColor: '#1c1c1c',
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
        backgroundColor: "#333",
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
        backgroundColor: '#000',
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
        width: 20,
        height: 20,
        borderRadius: '50%',
        backgroundColor: '#181818',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#FFBC07',
        borderWidth: 1,
        // padding: 2,
    },
    line: {
        width: 1.5,
        height: 35,
        backgroundColor: '#D9D9D9',
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
    editableInput: {
        padding: 0,
        margin: 0,
        minHeight: 24,
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
});