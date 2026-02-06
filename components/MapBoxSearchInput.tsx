import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const MAPBOX_ACCESS_TOKEN = Constants.expoConfig?.extra?.mapboxAccessToken;

interface SearchResult {
    id: string;
    place_name: string;
    center: [number, number]; // [lng, lat]
    text: string;
    place_type: string[];
}

interface MapboxSearchInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onSelectLocation: (result: SearchResult) => void;
    onUseCurrentLocation: () => void;
    isGettingLocation: boolean;
    placeholder?: string;
    countryCode?: string;
    proximity?: [number, number];
}

export default function MapboxSearchInput({
    value,
    onChangeText,
    onSelectLocation,
    onUseCurrentLocation,
    isGettingLocation,
    placeholder = "Search location",
    countryCode = "ng",
    proximity,
}: MapboxSearchInputProps) {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    console.log('mapbox token', MAPBOX_ACCESS_TOKEN)

    useEffect(() => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        if (value.length < 2) {
            setResults([]);
            setShowResults(false);
            return;
        }

        searchTimeout.current = setTimeout(() => {
            searchLocations(value);
        }, 300);

        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [value]);

    const searchLocations = async (query: string) => {
        if (!query || query.length < 2) return;

        setIsSearching(true);
        setShowResults(true);

        try {
            let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}`;

            if (countryCode) {
                url += `&country=${countryCode}`;
            }

            if (proximity) {
                url += `&proximity=${proximity[0]},${proximity[1]}`;
            }

            url += "&limit=5&types=place,address,poi,locality";

            const response = await fetch(url);
            const data = await response.json();

            if (data.features) {
                setResults(data.features);
            }
        } catch (error) {
            console.error("Mapbox search error:", error);
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectResult = (result: SearchResult) => {
        onSelectLocation(result);
        setShowResults(false);
        Keyboard.dismiss();
    };

    const handleClearInput = () => {
        onChangeText("");
        setResults([]);
        setShowResults(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <Ionicons name="search" size={20} color="white" style={styles.searchIcon} />

                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#aaa"
                    onFocus={() => value.length >= 2 && setShowResults(true)}
                />

                {value.length > 0 && (
                    <TouchableOpacity onPress={handleClearInput} style={styles.clearButton}>
                        <Ionicons name="close-circle" size={20} color="#666" />
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onPress={onUseCurrentLocation}
                    disabled={isGettingLocation}
                    style={styles.locateButton}
                >
                    <Ionicons
                        name="locate"
                        size={20}
                        color={isGettingLocation ? "#666" : "#f6a623"}
                    />
                </TouchableOpacity>
            </View>

            {showResults && (
                <View style={styles.resultsContainer}>
                    {isSearching ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#f6a623" />
                            <Text style={styles.loadingText}>Searching...</Text>
                        </View>
                    ) : results.length > 0 ? (
                        <FlatList
                            data={results}
                            keyExtractor={(item) => item.id}
                            keyboardShouldPersistTaps="always"
                            style={styles.resultsList}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.resultItem}
                                    onPress={() => handleSelectResult(item)}
                                >
                                    <Ionicons name="location" size={18} color="#f6a623" />
                                    <View style={styles.resultTextContainer}>
                                        <Text style={styles.resultMainText}>{item.text}</Text>
                                        <Text style={styles.resultSubText} numberOfLines={1}>
                                            {item.place_name}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                    ) : (
                        <View style={styles.noResultsContainer}>
                            <Text style={styles.noResultsText}>No locations found</Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        zIndex: 1,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2b2b2b",
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#444",
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        color: "white",
        paddingVertical: 12,
        fontSize: 15,
    },
    clearButton: {
        padding: 4,
        marginRight: 8,
    },
    locateButton: {
        padding: 4,
    },
    resultsContainer: {
        backgroundColor: "#1c1c1c",
        marginTop: 10,
        borderRadius: 12,
        maxHeight: 250,
        borderWidth: 1,
        borderColor: "#333",
    },
    resultsList: {
        maxHeight: 250,
    },
    resultItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        backgroundColor: "#2b2b2b",
    },
    resultTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    resultMainText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "500",
        marginBottom: 2,
    },
    resultSubText: {
        color: "#aaa",
        fontSize: 13,
    },
    separator: {
        height: 0.5,
        backgroundColor: "#444",
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    loadingText: {
        color: "#aaa",
        marginLeft: 10,
    },
    noResultsContainer: {
        padding: 20,
        alignItems: "center",
    },
    noResultsText: {
        color: "#aaa",
        fontSize: 14,
    },
});