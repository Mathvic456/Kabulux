import { Ionicons } from '@expo/vector-icons';
import { debounce } from 'lodash';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Suggestion {
    id: string;
    place_name: string;
    center: [number, number]; // [longitude, latitude]
    text: string;
    place_type?: string[];
    mapbox_id?: string;
    poi_category?: string;
    suggestionData?: any;
}

interface MapboxSearchProps {
    onSelectPlace: (place: Suggestion) => void;
    accessToken: string;
}

export default function MapboxSearch({ onSelectPlace, accessToken }: MapboxSearchProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [sessionToken] = useState(Date.now().toString());
    const searchPlaces = async (searchText: string) => {
        if (!searchText || searchText.length < 2) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            // Remove types restriction to get ALL results
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    searchText
                )}.json?` +
                `access_token=${accessToken}` +
                `&autocomplete=true` +
                `&limit=10` +
                // Remove types parameter to get everything
                `&country=ng` +
                `&language=en`
            );

            const data = await response.json();
            console.log('All results:', data);

            // Filter to prioritize POIs but keep addresses too
            const features = data.features?.map((feature: any) => ({
                id: feature?.id,
                place_name: feature?.place_name,
                center: feature?.center as [number, number],
                text: feature?.text,
                place_type: feature?.place_type,
                poi_category: feature?.properties?.category,
            })) || [];

            // Sort: POIs first, then addresses
            const sorted = features.sort((a: Suggestion, b: Suggestion) => {
                const aIsPOI = a.place_type?.includes('poi') ? 0 : 1;
                const bIsPOI = b.place_type?.includes('poi') ? 0 : 1;
                return aIsPOI - bIsPOI;
            });

            console.log('Sorted results:', sorted);
            setSuggestions(sorted);
        } catch (error) {
            console.error('Search error:', error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlace = async (suggestion: Suggestion) => {
        setQuery(suggestion?.place_name);
        setSuggestions([]);

        // Retrieve full details including coordinates
        if (suggestion.mapbox_id) {
            try {
                const response = await fetch(
                    `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}?` +
                    `access_token=${accessToken}` +
                    `&session_token=${sessionToken}`
                );

                const data = await response.json();
                const feature = data?.features?.[0];

                if (feature) {
                    const place: Suggestion = {
                        id: feature?.properties?.mapbox_id,
                        place_name: feature?.properties?.name + (feature.properties.place_formatted ? `, ${feature.properties.place_formatted}` : ''),
                        center: feature?.geometry?.coordinates as [number, number],
                        text: feature?.properties?.name,
                        place_type: [feature?.properties?.feature_type || 'poi'],
                        poi_category: feature?.properties?.poi_category,
                    };

                    onSelectPlace(place);
                }
            } catch (error) {
                console.error('Retrieve error:', error);
                // Fallback: return suggestion without exact coordinates
                onSelectPlace(suggestion);
            }
        } else {
            // Fallback for suggestions without mapbox_id
            onSelectPlace(suggestion);
        }
    };

    const debouncedSearch = useCallback(
        debounce((text: string) => searchPlaces(text), 300),
        []
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