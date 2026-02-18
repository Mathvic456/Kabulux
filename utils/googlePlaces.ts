import Constants from 'expo-constants';

/**
 * Place suggestion from Google Places Autocomplete
 */
export interface PlaceSuggestion {
    place_id: string;
    description: string;
    main_text?: string;
    secondary_text?: string;
}

/**
 * Place details from Google Places API
 */
export interface PlaceDetails {
    place_id: string;
    name: string;
    formatted_address: string;
    location: {
        lat: number;
        lng: number;
    };
    address_components?: any[];
    types?: string[];
}

/**
 * Search for places using Google Places API (New) Autocomplete
 * @param query - Search query string
 * @param sessionToken - Session token for billing (optional)
 * @returns Array of place suggestions
 */
export const searchPlaces = async (
    query: string,
    sessionToken?: string
): Promise<PlaceSuggestion[]> => {
    try {
        const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey || process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

        if (!apiKey) {
            console.error('Google Maps API key not found');
            throw new Error('Google Maps API key is not configured');
        }

        if (!query || query.length < 2) {
            return [];
        }

        // Using Places API (New) - Autocomplete
        const url = `https://places.googleapis.com/v1/places:autocomplete` +
            `?key=${apiKey}`;

        const requestBody: any = {
            input: query,
            languageCode: 'en',
            regionCode: 'NG', // Nigeria
            includedRegionCodes: ['NG'],
        };

        if (sessionToken) {
            requestBody.sessionToken = sessionToken;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Places Autocomplete API error:', response.status, errorText);
            throw new Error(`Places API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.suggestions && data.suggestions.length > 0) {
            return data.suggestions.map((suggestion: any) => {
                const prediction = suggestion.placePrediction;
                return {
                    place_id: prediction.placeId,
                    description: prediction.text.text,
                    main_text: prediction.text.text.split(',')[0],
                    secondary_text: prediction.text.text.split(',').slice(1).join(',').trim(),
                };
            });
        }

        return [];
    } catch (error: any) {
        console.error('Error searching places:', error);
        if (error.message) {
            throw error;
        }
        return [];
    }
};

/**
 * Get place details using Google Places API (New)
 * @param placeId - Place ID from autocomplete
 * @param sessionToken - Session token for billing (optional)
 * @returns Place details with coordinates
 */
export const getPlaceDetails = async (
    placeId: string,
    sessionToken?: string
): Promise<PlaceDetails | null> => {
    try {
        const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey || process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

        if (!apiKey) {
            console.error('Google Maps API key not found');
            throw new Error('Google Maps API key is not configured');
        }

        // Using Places API (New) - Place Details
        const url = `https://places.googleapis.com/v1/places/${placeId}` +
            `?key=${apiKey}` +
            `&languageCode=en` +
            `&regionCode=NG`;

        const headers: any = {
            'Content-Type': 'application/json',
            'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,addressComponents,types',
        };

        if (sessionToken) {
            headers['X-Goog-Session-Token'] = sessionToken;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Places Details API error:', response.status, errorText);
            throw new Error(`Places API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.location) {
            return {
                place_id: data.id || placeId,
                name: data.displayName?.text || '',
                formatted_address: data.formattedAddress || '',
                location: {
                    lat: data.location.latitude,
                    lng: data.location.longitude,
                },
                address_components: data.addressComponents,
                types: data.types,
            };
        }

        return null;
    } catch (error: any) {
        console.error('Error getting place details:', error);
        if (error.message) {
            throw error;
        }
        return null;
    }
};

/**
 * Fallback: Use classic Places Autocomplete API if New API fails
 * @param query - Search query string
 * @returns Array of place suggestions
 */
export const searchPlacesClassic = async (
    query: string
): Promise<PlaceSuggestion[]> => {
    try {
        const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey || process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

        if (!apiKey) {
            throw new Error('Google Maps API key is not configured');
        }

        if (!query || query.length < 2) {
            return [];
        }

        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
            `input=${encodeURIComponent(query)}` +
            `&language=en` +
            `&components=country:ng` +
            `&key=${apiKey}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Places API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'OK' && data.predictions) {
            return data.predictions.map((prediction: any) => ({
                place_id: prediction.place_id,
                description: prediction.description,
                main_text: prediction.structured_formatting?.main_text || prediction.description.split(',')[0],
                secondary_text: prediction.structured_formatting?.secondary_text || prediction.description.split(',').slice(1).join(',').trim(),
            }));
        }

        return [];
    } catch (error: any) {
        console.error('Error searching places (classic):', error);
        return [];
    }
};

/**
 * Fallback: Get place details using classic Places API
 * @param placeId - Place ID
 * @returns Place details
 */
export const getPlaceDetailsClassic = async (
    placeId: string
): Promise<PlaceDetails | null> => {
    try {
        const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey || process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

        if (!apiKey) {
            throw new Error('Google Maps API key is not configured');
        }

        const url = `https://maps.googleapis.com/maps/api/place/details/json?` +
            `place_id=${placeId}` +
            `&language=en` +
            `&fields=place_id,name,formatted_address,geometry,address_components,types` +
            `&key=${apiKey}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Places API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'OK' && data.result) {
            const result = data.result;
            return {
                place_id: result.place_id,
                name: result.name,
                formatted_address: result.formatted_address,
                location: {
                    lat: result.geometry.location.lat,
                    lng: result.geometry.location.lng,
                },
                address_components: result.address_components,
                types: result.types,
            };
        }

        return null;
    } catch (error: any) {
        console.error('Error getting place details (classic):', error);
        return null;
    }
};
