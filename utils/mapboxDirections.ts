// utils/mapboxDirections.ts
export const getDirections = async (
    pickupLng: number,
    pickupLat: number,
    dropoffLng: number,
    dropoffLat: number
) => {
    try {
        const accessToken = process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN;

        if (!accessToken) {
            console.error('Mapbox access token not found');
            return null;
        }

        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupLng},${pickupLat};${dropoffLng},${dropoffLat}?geometries=geojson&overview=full&access_token=${accessToken}`;

        console.log('Fetching directions from:', { pickupLng, pickupLat, dropoffLng, dropoffLat });

        const response = await fetch(url);

        if (!response.ok) {
            console.error('Directions API error:', response.status);
            return null;
        }

        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            console.log('✅ Route received:', {
                distance: `${(route.distance / 1000).toFixed(2)} km`,
                duration: `${Math.round(route.duration / 60)} min`,
                points: route.geometry.coordinates.length
            });
            return route.geometry;
        }

        console.warn('No routes found in response');
        return null;
    } catch (error) {
        console.error('Error fetching directions:', error);
        return null;
    }
};