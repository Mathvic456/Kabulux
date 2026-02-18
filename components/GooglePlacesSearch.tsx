import { Ionicons } from '@expo/vector-icons';
import { debounce } from 'lodash';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getPlaceDetails, getPlaceDetailsClassic, PlaceSuggestion, searchPlaces, searchPlacesClassic } from '@/utils/googlePlaces';

interface Suggestion {
    id: string;
    place_name: string;
    center: [number, number]; // [longitude, latitude] - maintaining compatibility with Mapbox format
    text: string;
    place_type?: string[];
    poi_category?: string;
}

interface GooglePlacesSearchProps {
    onSelectPlace: (place: Suggestion) => void;
    apiKey: string;
}

export default function GooglePlacesSearch({ onSelectPlace, apiKey }: GooglePlacesSearchProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [sessionToken] = useState(Date.now().toString());
    const [useClassicAPI, setUseClassicAPI] = useState(false);

    const searchPlacesAPI = async (searchText: string) => {
        if (!searchText || searchText.length < 2) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            let results: PlaceSuggestion[] = [];

            // Try Places API (New) first, fallback to classic if it fails
            if (!useClassicAPI) {
                try {
                    results = await searchPlaces(searchText, sessionToken);
                    if (results.length === 0) {
                        // If no results, try classic API
                        results = await searchPlacesClassic(searchText);
                        if (results.length > 0) {
                            setUseClassicAPI(true); // Use classic for subsequent requests
                        }
                    }
                } catch (error: any) {
                    console.warn('Places API (New) failed, falling back to classic:', error.message);
                    // Fallback to classic API
                    results = await searchPlacesClassic(searchText);
                    if (results.length > 0) {
                        setUseClassicAPI(true);
                    }
                }
            } else {
                // Use classic API directly
                results = await searchPlacesClassic(searchText);
            }

            // Convert to Suggestion format (compatible with Mapbox format)
            const formattedSuggestions: Suggestion[] = results.map((result) => ({
                id: result.place_id,
                place_name: result.description,
                center: [0, 0] as [number, number], // Will be filled when place is selected
                text: result.main_text || result.description.split(',')[0],
                place_type: [],
            }));

            setSuggestions(formattedSuggestions);
        } catch (error: any) {
            console.error('Search error:', error);
            setSuggestions([]);

            // Show user-friendly error message
            if (error.message?.includes('API key') || error.message?.includes('billing')) {
                Alert.alert(
                    'API Error',
                    'Unable to search places. Please check your Google Maps API configuration.',
                    [{ text: 'OK' }]
                );
            } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
                Alert.alert(
                    'Service Limit',
                    'Place search service is temporarily unavailable. Please try again later.',
                    [{ text: 'OK' }]
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlace = async (suggestion: Suggestion) => {
        setQuery(suggestion.place_name);
        setSuggestions([]);

        try {
            let placeDetails;

            // Try Places API (New) first, fallback to classic
            if (!useClassicAPI) {
                try {
                    placeDetails = await getPlaceDetails(suggestion.id, sessionToken);
                } catch (error) {
                    console.warn('Places API (New) details failed, using classic:', error);
                    placeDetails = await getPlaceDetailsClassic(suggestion.id);
                }
            } else {
                placeDetails = await getPlaceDetailsClassic(suggestion.id);
            }

            if (placeDetails) {
                const place: Suggestion = {
                    id: placeDetails.place_id,
                    place_name: placeDetails.formatted_address || suggestion.place_name,
                    center: [placeDetails.location.lng, placeDetails.location.lat] as [number, number], // [lng, lat] format
                    text: placeDetails.name || suggestion.text,
                    place_type: placeDetails.types || [],
                    poi_category: placeDetails.types?.[0]?.replace(/_/g, ' '),
                };

                onSelectPlace(place);
            } else {
                // Fallback: use suggestion without coordinates (shouldn't happen, but handle gracefully)
                console.warn('Could not fetch place details, using suggestion data');
                Alert.alert(
                    'Location Error',
                    'Could not retrieve location details. Please try selecting the place again.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error: any) {
            console.error('Error retrieving place details:', error);
            Alert.alert(
                'Error',
                'Unable to retrieve place details. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    const debouncedSearch = useCallback(
        debounce((text: string) => searchPlacesAPI(text), 300),
        [sessionToken, useClassicAPI]
    );

    return (
        <View>
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginTop: 10,
                backgroundColor: "#000",
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 20
            }}>
                <Ionicons name="search" size={20} color="#fff" />

                <TextInput
                    style={styles.input}
                    placeholder="Search for a place..."
                    placeholderTextColor="#999"
                    value={query}
                    onChangeText={(text) => {
                        setQuery(text);
                        debouncedSearch(text);
                    }}
                />

                {loading ? (
                    <ActivityIndicator size="small" color="#f6a623" />
                ) : (
                    <Ionicons name="location-sharp" size={20} color="#f6a623" />
                )}
            </View>

            {suggestions.length > 0 && (
                <FlatList
                    data={suggestions}
                    keyExtractor={(item) => item.id}
                    style={styles.suggestionsList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.suggestionItem}
                            onPress={() => handleSelectPlace(item)}
                        >
                            <Ionicons name="location-sharp" size={16} color="#fff" style={{ marginRight: 8 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.suggestionText} numberOfLines={1}>
                                    {item.text}
                                </Text>
                                <Text style={[styles.suggestionText, { fontSize: 12, color: "#aaa" }]} numberOfLines={1}>
                                    {item.place_name.replace(item.text + ', ', '')}
                                </Text>
                            </View>
                            {item.poi_category && (
                                <Text style={styles.categoryBadge}>{item.poi_category}</Text>
                            )}
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        flex: 1,
        color: "#fff",
        fontSize: 16,
    },
    suggestionsList: {
        // Your existing styles
    },
    suggestionItem: {
        padding: 15,
        flexDirection: "row",
        alignItems: "center",
    },
    suggestionText: {
        fontSize: 14,
        color: "#fff",
    },
    categoryBadge: {
        fontSize: 11,
        color: '#f6a623',
        textTransform: 'capitalize',
        marginLeft: 8,
    },
});
