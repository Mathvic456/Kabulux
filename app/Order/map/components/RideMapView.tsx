import { getDirectionsGeometry } from "@/utils/googleDirections";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from "react-native-maps";

interface LocationData {
    latitude: number;
    longitude: number;
    address: string;
    name?: string;
}

interface RideMapViewProps {
    pickupLocation: LocationData | null;
    dropoffLocation?: LocationData | null;
    showRoute?: boolean;
    driver?: boolean;
}

export default function RideMapView({
    pickupLocation,
    dropoffLocation,
    showRoute = false,
    driver = false
}: RideMapViewProps) {
    const mapRef = useRef<MapView>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
    const [loadingRoute, setLoadingRoute] = useState(false);
    const [region, setRegion] = useState<Region>({
        latitude: 6.5244, // Default to Lagos
        longitude: 3.3792,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    // Fetch route from Google Directions API
    useEffect(() => {
        if (showRoute && pickupLocation && dropoffLocation) {
            setLoadingRoute(true);
            console.log('Fetching route from Google Directions API...');

            getDirectionsGeometry(
                pickupLocation.longitude,
                pickupLocation.latitude,
                dropoffLocation.longitude,
                dropoffLocation.latitude
            ).then(geometry => {
                if (geometry && geometry.coordinates) {
                    console.log('Route fetched, points:', geometry.coordinates.length);
                    // Convert from [lng, lat] to {latitude, longitude} format
                    const coords = geometry.coordinates.map(([lng, lat]) => ({
                        latitude: lat,
                        longitude: lng,
                    }));
                    setRouteCoordinates(coords);
                } else {
                    console.warn('No route geometry returned');
                    setRouteCoordinates([]);
                }
                setLoadingRoute(false);
            }).catch((error: any) => {
                console.error('Error fetching route:', error);
                setRouteCoordinates([]);
                setLoadingRoute(false);

                // Show user-friendly error message
                if (error.message?.includes('API key') || error.message?.includes('billing')) {
                    Alert.alert(
                        'Route Error',
                        'Unable to calculate route. Please check your Google Maps API configuration.',
                        [{ text: 'OK' }]
                    );
                } else if (error.message?.includes('No route found')) {
                    Alert.alert(
                        'No Route Found',
                        'Could not find a route between the selected locations. Please try different locations.',
                        [{ text: 'OK' }]
                    );
                } else {
                    Alert.alert(
                        'Route Error',
                        'Unable to calculate route. Please try again.',
                        [{ text: 'OK' }]
                    );
                }
            });
        } else {
            setRouteCoordinates([]);
        }
    }, [pickupLocation, dropoffLocation, showRoute]);

    // Calculate and update map region to fit both locations
    useEffect(() => {
        if (pickupLocation && dropoffLocation) {
            // Use route coordinates if available for better bounds
            let allLatitudes: number[] = [];
            let allLongitudes: number[] = [];

            if (routeCoordinates.length > 0) {
                allLatitudes = routeCoordinates.map(coord => coord.latitude);
                allLongitudes = routeCoordinates.map(coord => coord.longitude);
                console.log('Using route coordinates for bounds, points:', routeCoordinates.length);
            } else {
                allLatitudes = [pickupLocation.latitude, dropoffLocation.latitude];
                allLongitudes = [pickupLocation.longitude, dropoffLocation.longitude];
                console.log('Using pickup/dropoff for bounds');
            }

            const minLat = Math.min(...allLatitudes);
            const maxLat = Math.max(...allLatitudes);
            const minLng = Math.min(...allLongitudes);
            const maxLng = Math.max(...allLongitudes);

            // Calculate center
            const centerLat = (minLat + maxLat) / 2;
            const centerLng = (minLng + maxLng) / 2;

            // Calculate deltas with 20% padding
            const latDiff = maxLat - minLat;
            const lngDiff = maxLng - minLng;
            const latPadding = latDiff * 0.2 || 0.01;
            const lngPadding = lngDiff * 0.2 || 0.01;

            const newRegion: Region = {
                latitude: centerLat,
                longitude: centerLng,
                latitudeDelta: Math.max(latDiff + (latPadding * 2), 0.01),
                longitudeDelta: Math.max(lngDiff + (lngPadding * 2), 0.01),
            };

            console.log("Calculated region:", newRegion);
            setRegion(newRegion);

            // Animate to region
            setTimeout(() => {
                try {
                    mapRef.current?.animateToRegion(newRegion, 1000);
                    console.log('Map animated to region');
                } catch (error) {
                    console.error("Error animating map:", error);
                }
            }, 600);
        } else if (pickupLocation) {
            // Only pickup exists
            console.log('Centering on pickup only');
            const newRegion: Region = {
                latitude: pickupLocation.latitude,
                longitude: pickupLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };
            setRegion(newRegion);
            setTimeout(() => {
                mapRef.current?.animateToRegion(newRegion, 1000);
            }, 600);
        }
    }, [pickupLocation, dropoffLocation, routeCoordinates]);

    return (
        <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={region}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={false}
        >
            {/* Route Polyline */}
            {showRoute && routeCoordinates.length > 0 && (
                <>
                    {/* Route outline/shadow */}
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeColor="#000"
                        strokeWidth={6}
                        lineCap="round"
                        lineJoin="round"
                        zIndex={1}
                    />
                    {/* Main route line */}
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeColor="#f6a623"
                        strokeWidth={4}
                        lineCap="round"
                        lineJoin="round"
                        zIndex={2}
                    />
                </>
            )}

            {/* Pickup Location Marker */}
            {pickupLocation && (
                <Marker
                    coordinate={{
                        latitude: pickupLocation.latitude,
                        longitude: pickupLocation.longitude,
                    }}
                    title="Pickup Location"
                    description={pickupLocation.address}
                >
                    <View style={styles.pickupMarker}>
                        <Ionicons name="navigate" size={20} color="#f6a623" />
                    </View>
                </Marker>
            )}

            {/* Dropoff Location Marker */}
            {dropoffLocation && (
                <Marker
                    coordinate={{
                        latitude: dropoffLocation.latitude,
                        longitude: dropoffLocation.longitude,
                    }}
                    title="Dropoff Location"
                    description={dropoffLocation.address}
                >
                    {driver ? (
                        <View style={styles.dropoffMarker}>
                            <Ionicons name="car" size={24} color="#f6a623" />
                        </View>
                    ) : (
                        <View style={styles.dropoffMarker}>
                            <Ionicons name="location-sharp" size={24} color="#f6a623" />
                        </View>
                    )}
                </Marker>
            )}

            {/* Loading indicator for route */}
            {loadingRoute && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="small" color="#f6a623" />
                </View>
            )}
        </MapView>
    );
}

const styles = StyleSheet.create({
    map: {
        flex: 1,
    },
    pickupMarker: {
        width: 30,
        height: 30,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#4CAF50',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    dropoffMarker: {
        width: 30,
        height: 30,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#f6a623',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 8,
        borderRadius: 20,
    },
});
