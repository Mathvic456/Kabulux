/**
 * Calculate distance between two coordinates using the Haversine formula
 * @returns Distance in kilometers, rounded to 1 decimal place
 */
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    if (
        !Number.isFinite(lat1) ||
        !Number.isFinite(lon1) ||
        !Number.isFinite(lat2) ||
        !Number.isFinite(lon2)
    ) {
        return 0;
    }
    const R = 6371; // Earth radius in km
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
};

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