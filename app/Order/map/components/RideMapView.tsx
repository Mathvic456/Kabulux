import Mapbox from "@/utils/mapbox";
import { getDirections } from "@/utils/mapboxDirections";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

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
    const cameraRef = useRef<any>(null);
    const [routeGeometry, setRouteGeometry] = useState<any>(null);
    const [loadingRoute, setLoadingRoute] = useState(false);

    // Fetch actual route from Mapbox Directions API
    useEffect(() => {
        if (showRoute && pickupLocation && dropoffLocation) {
            setLoadingRoute(true);
            console.log('Fetching route...');

            getDirections(
                pickupLocation.longitude,
                pickupLocation.latitude,
                dropoffLocation.longitude,
                dropoffLocation.latitude
            ).then(geometry => {
                if (geometry) {
                    console.log('Route fetched, points:', geometry.coordinates?.length);
                    setRouteGeometry(geometry);
                } else {
                    console.warn('No route geometry returned');
                }
                setLoadingRoute(false);
            }).catch((error) => {
                console.error('Error fetching route:', error);
                setLoadingRoute(false);
            });
        } else {
            setRouteGeometry(null);
        }
    }, [pickupLocation, dropoffLocation, showRoute]);

    // Fit map to show both locations
    useEffect(() => {
        if (!cameraRef.current) return;

        if (pickupLocation && dropoffLocation) {
            // Use route coordinates if available for better bounds
            let allCoordinates: number[][] = [];

            if (routeGeometry?.coordinates && routeGeometry.coordinates.length > 0) {
                allCoordinates = routeGeometry.coordinates;
                console.log('Using route coordinates for bounds, points:', allCoordinates.length);
            } else {
                allCoordinates = [
                    [pickupLocation.longitude, pickupLocation.latitude],
                    [dropoffLocation.longitude, dropoffLocation.latitude],
                ];
                console.log('Using pickup/dropoff for bounds');
            }

            // Calculate bounds from all coordinates
            const lngs = allCoordinates.map(coord => coord[0]);
            const lats = allCoordinates.map(coord => coord[1]);

            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);

            // Calculate center
            const centerLng = (minLng + maxLng) / 2;
            const centerLat = (minLat + maxLat) / 2;

            // Add 20% padding to bounds
            const lngDiff = maxLng - minLng;
            const latDiff = maxLat - minLat;
            const lngPadding = lngDiff * 0.2 || 0.01; // Ensure minimum padding
            const latPadding = latDiff * 0.2 || 0.01;

            const paddedLngDiff = lngDiff + (lngPadding * 2);
            const paddedLatDiff = latDiff + (latPadding * 2);
            const maxDiff = Math.max(paddedLngDiff, paddedLatDiff);

            // Calculate zoom level based on distance
            let zoomLevel = 15;
            if (maxDiff > 0.5) zoomLevel = 9;
            else if (maxDiff > 0.3) zoomLevel = 10;
            else if (maxDiff > 0.2) zoomLevel = 11;
            else if (maxDiff > 0.1) zoomLevel = 12;
            else if (maxDiff > 0.05) zoomLevel = 13;
            else if (maxDiff > 0.02) zoomLevel = 14;
            else if (maxDiff > 0.01) zoomLevel = 14.5;

            console.log("Calculated view:", {
                center: [centerLng, centerLat],
                zoom: zoomLevel,
                distance: maxDiff.toFixed(4),
                bounds: { minLng, maxLng, minLat, maxLat }
            });

            // Delay to ensure map is ready
            setTimeout(() => {
                try {
                    cameraRef.current?.setCamera({
                        centerCoordinate: [centerLng, centerLat],
                        zoomLevel: zoomLevel,
                        animationDuration: 1000,
                    });
                    console.log('Camera set');
                } catch (error) {
                    console.error("Error setting camera:", error);
                }
            }, 600);
        } else if (pickupLocation) {
            // Only pickup exists
            console.log('Centering on pickup only');
            setTimeout(() => {
                cameraRef.current?.setCamera({
                    centerCoordinate: [pickupLocation.longitude, pickupLocation.latitude],
                    zoomLevel: 14,
                    animationDuration: 1000,
                });
            }, 600);
        }
    }, [pickupLocation, dropoffLocation, routeGeometry]);

    return (
        <Mapbox.MapView style={styles.map}>
            <Mapbox.Camera
                ref={cameraRef}
                zoomLevel={13}
                centerCoordinate={
                    pickupLocation
                        ? [pickupLocation.longitude, pickupLocation.latitude]
                        : [3.3792, 6.5244] // Default to Lagos
                }
            />

            {/* Actual Route from Mapbox Directions */}
            {routeGeometry && (
                <Mapbox.ShapeSource
                    id="routeSource"
                    shape={{
                        type: 'Feature',
                        properties: {},
                        geometry: routeGeometry,
                    }}
                >
                    {/* Route outline/shadow */}
                    <Mapbox.LineLayer
                        id="routeOutline"
                        style={{
                            lineColor: '#000',
                            lineWidth: 6,
                            lineCap: 'round',
                            lineJoin: 'round',
                            lineOpacity: 0.4,
                        }}
                    />
                    {/* Main route line */}
                    <Mapbox.LineLayer
                        id="routeLine"
                        style={{
                            lineColor: '#f6a623',
                            lineWidth: 4,
                            lineCap: 'round',
                            lineJoin: 'round',
                        }}
                    />
                </Mapbox.ShapeSource>
            )}

            {/* Pickup Location Marker */}
            {pickupLocation && (
                <Mapbox.PointAnnotation
                    id="pickupLocation"
                    coordinate={[pickupLocation.longitude, pickupLocation.latitude]}
                >
                    <View style={styles.pickupMarker}>
                        <Ionicons name="navigate" size={20} color="#f6a623" />
                    </View>
                </Mapbox.PointAnnotation>
            )}

            {/* Dropoff Location Marker */}
            {dropoffLocation && (
                <Mapbox.PointAnnotation
                    id="dropoffLocation"
                    coordinate={[dropoffLocation.longitude, dropoffLocation.latitude]}
                >
                    {driver ?
                        <View style={styles.dropoffMarker}>
                            <Ionicons name="car" size={24} color="#f6a623" />
                        </View> :
                        <View style={styles.dropoffMarker}>
                            <Ionicons name="location-sharp" size={24} color="#f6a623" />
                        </View>
                    }
                </Mapbox.PointAnnotation>
            )}

            {/* Loading indicator for route */}
            {loadingRoute && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="small" color="#f6a623" />
                </View>
            )}
        </Mapbox.MapView>
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