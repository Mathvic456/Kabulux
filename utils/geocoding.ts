/**
 * Reverse geocode coordinates to get address using Mapbox
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Address string
 */
export const reverseGeocode = async (
    latitude: number,
    longitude: number
): Promise<string> => {
    try {
        const accessToken = process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN;

        if (!accessToken) {
            console.error('Mapbox access token not found');
            return 'Unknown location';
        }

        const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}&types=address,poi,place`
        );

        if (!response.ok) {
            console.error(`Geocoding API error: ${response.status}`)
            // throw new Error(`Geocoding API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.features && data.features.length > 0) {
            return data?.features[0]?.place_name;
        }

        return 'Unknown location';
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return 'Unknown location';
    }
};

/**
 * Forward geocode address to get coordinates using Mapbox
 * @param address - Address string to geocode
 * @returns Object with latitude and longitude
 */
export const forwardGeocode = async (
    address: string
): Promise<{ latitude: number; longitude: number } | null> => {
    try {
        const accessToken = process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN;

        if (!accessToken) {
            console.error('Mapbox access token not found');
            return null;
        }

        const encodedAddress = encodeURIComponent(address);
        const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${accessToken}`
        );

        if (!response.ok) {
            console.error(`Geocoding API error: ${response.status}`);
            // throw new Error(`Geocoding API error: ${response.status}`);
        }

        const data = await response.json();

        if (data?.features && data?.features.length > 0) {
            const [longitude, latitude] = data?.features[0]?.center;
            return { latitude, longitude };
        }

        return null;
    } catch (error) {
        console.error('Forward geocoding error:', error);
        return null;
    }
};