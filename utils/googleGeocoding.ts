import Constants from 'expo-constants';

/**
 * Reverse geocode coordinates to get address using Google Geocoding API
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Address string
 */
export const reverseGeocode = async (
    latitude: number,
    longitude: number
): Promise<string> => {
    try {
        const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey || process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

        if (!apiKey) {
            console.error('Google Maps API key not found');
            throw new Error('Google Maps API key is not configured');
        }

        const url = `https://maps.googleapis.com/maps/api/geocode/json?` +
            `latlng=${latitude},${longitude}` +
            `&language=en` +
            `&key=${apiKey}`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Geocoding API error: ${response.status}`, errorText);
            throw new Error(`Geocoding API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
            // Return the formatted address from the first result
            return data.results[0].formatted_address;
        } else if (data.status === 'ZERO_RESULTS') {
            console.warn('No address found for the given coordinates');
            return 'Unknown location';
        } else if (data.status === 'REQUEST_DENIED') {
            console.error('Geocoding API request denied:', data.error_message);
            throw new Error(`Geocoding API access denied: ${data.error_message || 'Check your API key and billing'}`);
        } else {
            console.error('Geocoding API error:', data.status, data.error_message);
            throw new Error(`Geocoding API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
        }
    } catch (error: any) {
        console.error('Reverse geocoding error:', error);
        // Return a user-friendly error message
        if (error.message) {
            throw error;
        }
        return 'Unknown location';
    }
};

/**
 * Forward geocode address to get coordinates using Google Geocoding API
 * @param address - Address string to geocode
 * @returns Object with latitude and longitude
 */
export const forwardGeocode = async (
    address: string
): Promise<{ latitude: number; longitude: number } | null> => {
    try {
        const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey || process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

        if (!apiKey) {
            console.error('Google Maps API key not found');
            throw new Error('Google Maps API key is not configured');
        }

        const encodedAddress = encodeURIComponent(address);
        const url = `https://maps.googleapis.com/maps/api/geocode/json?` +
            `address=${encodedAddress}` +
            `&language=en` +
            `&key=${apiKey}`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Geocoding API error: ${response.status}`, errorText);
            throw new Error(`Geocoding API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            return {
                latitude: location.lat,
                longitude: location.lng,
            };
        } else if (data.status === 'ZERO_RESULTS') {
            console.warn('No coordinates found for the given address');
            return null;
        } else if (data.status === 'REQUEST_DENIED') {
            console.error('Geocoding API request denied:', data.error_message);
            throw new Error(`Geocoding API access denied: ${data.error_message || 'Check your API key and billing'}`);
        } else {
            console.error('Geocoding API error:', data.status, data.error_message);
            throw new Error(`Geocoding API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
        }
    } catch (error: any) {
        console.error('Forward geocoding error:', error);
        if (error.message) {
            throw error;
        }
        return null;
    }
};
