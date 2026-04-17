import { getDirections } from "@/utils/googleDirections";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from "react-native-maps";

interface LocationData {
    latitude: number;
    longitude: number;
    address: string;
    name?: string;
}

interface RouteInfo {
    duration: number;
    distance: number;
}

interface RideMapViewProps {
    pickupLocation?: LocationData | null;
    dropoffLocation?: LocationData | null;
    driverLocation?: LocationData | null;
    showRoute?: boolean;
    routeFrom?: LocationData | null;
    routeTo?: LocationData | null;
    onRouteInfo?: (info: RouteInfo | null) => void;
    /** @deprecated kept for backward compat — use driverLocation instead */
    driver?: boolean;
}

const ROUTE_COLOR = "#FEB914";

const DEFAULT_REGION: Region = {
    latitude: 6.5244,
    longitude: 3.3792,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

export default function RideMapView({
    pickupLocation,
    dropoffLocation,
    driverLocation,
    showRoute = false,
    routeFrom,
    routeTo,
    onRouteInfo,
    driver = false,
}: RideMapViewProps) {
    const mapRef = useRef<MapView>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
    const [loadingRoute, setLoadingRoute] = useState(false);

    const effectiveRouteFrom = routeFrom ?? pickupLocation ?? null;
    const effectiveRouteTo = routeTo ?? dropoffLocation ?? null;

    useEffect(() => {
        if (!showRoute || !effectiveRouteFrom || !effectiveRouteTo) {
            setRouteCoordinates([]);
            onRouteInfo?.(null);
            return;
        }

        let cancelled = false;
        setLoadingRoute(true);

        getDirections(
            effectiveRouteFrom.longitude,
            effectiveRouteFrom.latitude,
            effectiveRouteTo.longitude,
            effectiveRouteTo.latitude,
        )
            .then((result) => {
                if (cancelled) return;
                if (result && result.coordinates.length > 0) {
                    const coords = result.coordinates.map(([lat, lng]) => ({
                        latitude: lat,
                        longitude: lng,
                    }));
                    setRouteCoordinates(coords);
                    onRouteInfo?.({ duration: result.duration, distance: result.distance });
                } else {
                    setRouteCoordinates([]);
                    onRouteInfo?.(null);
                }
            })
            .catch((error: any) => {
                if (cancelled) return;
                console.error("Error fetching route:", error);
                setRouteCoordinates([]);
                onRouteInfo?.(null);

                if (error.message?.includes("API key") || error.message?.includes("billing")) {
                    Alert.alert(
                        "Route Error",
                        "Unable to calculate route. Please check your Google Maps API configuration.",
                        [{ text: "OK" }],
                    );
                } else if (error.message?.includes("No route found")) {
                    Alert.alert(
                        "No Route Found",
                        "Could not find a route between the selected locations. Please try different locations.",
                        [{ text: "OK" }],
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setLoadingRoute(false);
            });

        return () => {
            cancelled = true;
        };
    }, [
        showRoute,
        effectiveRouteFrom?.latitude,
        effectiveRouteFrom?.longitude,
        effectiveRouteTo?.latitude,
        effectiveRouteTo?.longitude,
    ]);

    useEffect(() => {
        const markers = [pickupLocation, dropoffLocation, driverLocation].filter(
            (m): m is LocationData => !!m,
        );
        if (markers.length === 0) return;

        let latitudes: number[];
        let longitudes: number[];

        if (routeCoordinates.length > 0) {
            latitudes = routeCoordinates.map((c) => c.latitude);
            longitudes = routeCoordinates.map((c) => c.longitude);
        } else {
            latitudes = markers.map((m) => m.latitude);
            longitudes = markers.map((m) => m.longitude);
        }

        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);

        const latDiff = maxLat - minLat;
        const lngDiff = maxLng - minLng;
        const latPadding = latDiff * 0.3 || 0.01;
        const lngPadding = lngDiff * 0.3 || 0.01;

        const newRegion: Region = {
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: Math.max(latDiff + latPadding * 2, 0.01),
            longitudeDelta: Math.max(lngDiff + lngPadding * 2, 0.01),
        };

        const timer = setTimeout(() => {
            try {
                mapRef.current?.animateToRegion(newRegion, 1000);
            } catch (error) {
                console.error("Error animating map:", error);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [
        pickupLocation?.latitude,
        pickupLocation?.longitude,
        dropoffLocation?.latitude,
        dropoffLocation?.longitude,
        driverLocation?.latitude,
        driverLocation?.longitude,
        routeCoordinates,
    ]);

    const showDropoffAsCar = driver && !driverLocation;

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={DEFAULT_REGION}
                showsUserLocation={false}
                showsMyLocationButton={false}
                showsCompass={false}
            >
                {showRoute && routeCoordinates.length > 0 && (
                    <>
                        <Polyline
                            coordinates={routeCoordinates}
                            strokeColor="rgba(0,0,0,0.35)"
                            strokeWidth={7}
                            lineCap="round"
                            lineJoin="round"
                            zIndex={1}
                        />
                        <Polyline
                            coordinates={routeCoordinates}
                            strokeColor={ROUTE_COLOR}
                            strokeWidth={4}
                            lineCap="round"
                            lineJoin="round"
                            zIndex={2}
                        />
                    </>
                )}

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

                {dropoffLocation && (
                    <Marker
                        coordinate={{
                            latitude: dropoffLocation.latitude,
                            longitude: dropoffLocation.longitude,
                        }}
                        title="Dropoff Location"
                        description={dropoffLocation.address}
                    >
                        {showDropoffAsCar ? (
                            <View style={styles.driverMarker}>
                                <Ionicons name="car" size={22} color="#fff" />
                            </View>
                        ) : (
                            <View style={styles.flagMarkerWrapper}>
                                <View style={styles.flagMarker}>
                                    <Ionicons name="flag" size={18} color="#fff" />
                                </View>
                                {dropoffLocation.address ? (
                                    <View style={styles.flagLabel}>
                                        <Text style={styles.flagLabelText} numberOfLines={1}>
                                            {dropoffLocation.name || dropoffLocation.address}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        )}
                    </Marker>
                )}

                {driverLocation && (
                    <Marker
                        coordinate={{
                            latitude: driverLocation.latitude,
                            longitude: driverLocation.longitude,
                        }}
                        title="Driver"
                        description={driverLocation.address}
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <View style={styles.driverMarker}>
                            <Ionicons name="car" size={22} color="#fff" />
                        </View>
                    </Marker>
                )}
            </MapView>

            {loadingRoute && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="small" color={ROUTE_COLOR} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    pickupMarker: {
        width: 30,
        height: 30,
        borderRadius: 20,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#4CAF50",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    flagMarkerWrapper: {
        alignItems: "center",
    },
    flagMarker: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: ROUTE_COLOR,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    flagLabel: {
        marginTop: 4,
        backgroundColor: "rgba(0,0,0,0.75)",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        maxWidth: 180,
    },
    flagLabelText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "600",
    },
    driverMarker: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "#111",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: ROUTE_COLOR,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 6,
    },
    loadingOverlay: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: 8,
        borderRadius: 20,
    },
});
