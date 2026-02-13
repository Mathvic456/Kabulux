import { useRideId } from "@/context/RideIdContext";
import { useRideDetails } from "@/services/rideDetails.service";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { useRide } from "../../context/RideContext";
import { darkMapStyle } from "../../styles/darkMapStyle";

if (!Constants.expoConfig?.extra?.googleMapsApiKey) {
  throw new Error("Google Maps API key is missing");
}

const GOOGLE_API_KEY = Constants.expoConfig.extra.googleMapsApiKey;

interface PickupLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export default function RideTrackingScreen({ goBack }: { goBack: () => void }) {
  const { driverLocation, rideState } = useRide();
  const { rideId } = useRideId();

  const { data: rideDetails, isLoading: loadingRideDetails } = useRideDetails(rideId);

  const mapRef = useRef<MapView>(null);
  const [pickupLocation, setPickupLocation] = useState<PickupLocation | null>(
    null,
  );
  const [destinationLocation, setDestinationLocation] =
    useState<PickupLocation | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(null);

  // Extract pickup location from ride details
  useEffect(() => {
    if (rideDetails && rideDetails.pickup_lat && rideDetails.pickup_lng) {
      const pickup = {
        latitude: parseFloat(rideDetails.pickup_lat),
        longitude: parseFloat(rideDetails.pickup_lng),
        address: rideDetails.pickup_address || "Pickup Location",
      };
      setPickupLocation(pickup);
      console.log("📍 [TRACKING] Pickup location from ride details:", pickup);
    }
  }, [rideDetails]);

  // Extract destination location from ride details
  useEffect(() => {
    if (rideDetails && rideDetails.dropoff_lat && rideDetails.dropoff_lng) {
      const destination = {
        latitude: parseFloat(rideDetails.dropoff_lat),
        longitude: parseFloat(rideDetails.dropoff_lng),
        address: rideDetails.dropoff_address || "Destination",
      };
      setDestinationLocation(destination);
      console.log(
        "🎯 [TRACKING] Destination location from ride details:",
        destination,
      );
    }
  }, [rideDetails]);

  // Fit map to show relevant locations based on ride state
  useEffect(() => {
    if (!mapRef.current) return;

    let coordinates = [];

    // In progress: show driver and destination
    if (rideState === "in_progress" && driverLocation && destinationLocation) {
      coordinates = [
        { latitude: driverLocation.lat, longitude: driverLocation.lng },
        {
          latitude: destinationLocation.latitude,
          longitude: destinationLocation.longitude,
        },
      ];
    }
    // Driver on way: show driver and pickup
    else if (
      rideState === "driver_on_way" &&
      driverLocation &&
      pickupLocation
    ) {
      coordinates = [
        { latitude: driverLocation.lat, longitude: driverLocation.lng },
        {
          latitude: pickupLocation.latitude,
          longitude: pickupLocation.longitude,
        },
      ];
    }
    // Fallback: center on available location
    else if (driverLocation) {
      mapRef.current.animateToRegion(
        {
          latitude: driverLocation.lat,
          longitude: driverLocation.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000,
      );
      return;
    } else if (pickupLocation) {
      mapRef.current.animateToRegion(
        {
          latitude: pickupLocation.latitude,
          longitude: pickupLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000,
      );
      return;
    }

    if (coordinates.length > 0) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 150, right: 50, bottom: 400, left: 50 },
        animated: true,
      });
    }
  }, [driverLocation, pickupLocation, destinationLocation, rideState]);

  const driver = rideDetails?.driver;

  if (loadingRideDetails) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FEB914" />
        <Text style={styles.loadingText}>Loading ride details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconContainer} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.topBarTitle}>
            {driver?.name ? `Tracking ${driver.name}` : "Tracking Driver"}
          </Text>
          {rideState && (
            <Text style={styles.topBarSubtitle}>
              {rideState.replace("_", " ").toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.iconContainer} />
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: pickupLocation?.latitude || driverLocation?.lat || 6.5244,
            longitude:
              pickupLocation?.longitude || driverLocation?.lng || 3.3792,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          customMapStyle={darkMapStyle}
        >
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
              <View style={styles.pickupMarkerContainer}>
                <View style={styles.pickupMarkerInner}>
                  <Ionicons name="person" size={20} color="#fff" />
                </View>
              </View>
            </Marker>
          )}

          {/* Driver Location Marker */}
          {driverLocation && (
            <Marker
              coordinate={{
                latitude: driverLocation.lat,
                longitude: driverLocation.lng,
              }}
              title={driver?.name || "Driver Location"}
              description={driver?.vehicle || "Your driver is here"}
            >
              <View style={styles.driverMarkerContainer}>
                <FontAwesome5 name="car" size={24} color="#FEB914" />
              </View>
            </Marker>
          )}

          {/* Destination Location Marker - Show during in_progress */}
          {rideState === "in_progress" && destinationLocation && (
            <Marker
              coordinate={{
                latitude: destinationLocation.latitude,
                longitude: destinationLocation.longitude,
              }}
              title="Destination"
              description={destinationLocation.address}
            >
              <View style={styles.destinationMarkerContainer}>
                <View style={styles.destinationMarkerInner}>
                  <Ionicons name="flag" size={20} color="#fff" />
                </View>
              </View>
            </Marker>
          )}

          {/* Route Line - From Driver to Pickup Location (when driver_on_way) */}
          {rideState === "driver_on_way" &&
            driverLocation &&
            pickupLocation && (
              <MapViewDirections
                origin={{
                  latitude: driverLocation.lat,
                  longitude: driverLocation.lng,
                }}
                destination={{
                  latitude: pickupLocation.latitude,
                  longitude: pickupLocation.longitude,
                }}
                apikey={GOOGLE_API_KEY}
                strokeWidth={4}
                strokeColor="#FEB914"
                optimizeWaypoints={true}
                onReady={(result) => {
                  console.log(
                    `🚗 Route to pickup: ${result.distance.toFixed(2)} km, ${result.duration.toFixed(0)} min`,
                  );
                  setRouteInfo({
                    distance: result.distance,
                    duration: result.duration,
                  });
                }}
                onError={(errorMessage) => {
                  console.error(" Directions error:", errorMessage);
                }}
              />
            )}

          {/* Route Line - From Driver to Destination (when in_progress) */}
          {rideState === "in_progress" &&
            driverLocation &&
            destinationLocation && (
              <MapViewDirections
                origin={{
                  latitude: driverLocation.lat,
                  longitude: driverLocation.lng,
                }}
                destination={{
                  latitude: destinationLocation.latitude,
                  longitude: destinationLocation.longitude,
                }}
                apikey={GOOGLE_API_KEY}
                strokeWidth={4}
                strokeColor="#4CAF50"
                optimizeWaypoints={true}
                onReady={(result) => {
                  console.log(
                    `🎯 Route to destination: ${result.distance.toFixed(2)} km, ${result.duration.toFixed(0)} min`,
                  );
                  setRouteInfo({
                    distance: result.distance,
                    duration: result.duration,
                  });
                }}
                onError={(errorMessage) => {
                  console.error("Directions error:", errorMessage);
                }}
              />
            )}
        </MapView>

        {/* Route Info Badge */}
        {routeInfo &&
          (rideState === "driver_on_way" || rideState === "in_progress") && (
            <View style={styles.routeInfoBadge}>
              <FontAwesome5
                name="route"
                size={16}
                color={rideState === "in_progress" ? "#4CAF50" : "#FEB914"}
              />
              <Text style={styles.routeInfoText}>
                {routeInfo.distance.toFixed(1)} km •{" "}
                {Math.ceil(routeInfo.duration)} min{" "}
                {rideState === "in_progress" ? "to destination" : "away"}
              </Text>
            </View>
          )}
      </View>

      {/* Bottom Info Card */}
      <View style={styles.bottomCard}>
        {/* Driver Info Header */}
        {driver && (
          <View style={styles.driverInfoSection}>
            <View style={styles.driverAvatarContainer}>
              <Image
                source={
                  driver.profile_image
                    ? { uri: driver.profile_image }
                    : require("../../assets/images/Ava.png")
                }
                style={styles.driverAvatar}
                resizeMode="cover"
              />
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>
                {driver.name || "Your Driver"}
              </Text>
              <View style={styles.driverMetaRow}>
                {driver.rating && (
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FEB914" />
                    <Text style={styles.ratingText}>{driver.rating}</Text>
                  </View>
                )}
                {driver.vehicle && (
                  <Text style={styles.vehicleText}>• {driver.vehicle}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Status */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  rideState === "driver_on_way" ? "#4CAF50" : "#FEB914",
              },
            ]}
          />
          <Text style={styles.statusText}>
            {rideState === "driver_on_way"
              ? "Driver is on the way"
              : rideState === "driver_arrived"
                ? "Driver has arrived"
                : rideState === "in_progress"
                  ? "Ride in progress"
                  : "Tracking driver"}
          </Text>
        </View>

        {/* Location Details */}
        {(driverLocation || pickupLocation || destinationLocation) && (
          <View style={styles.locationsContainer}>
            {pickupLocation && rideState !== "in_progress" && (
              <View style={styles.locationSection}>
                <View style={styles.locationHeader}>
                  <Ionicons name="location" size={20} color="#4CAF50" />
                  <Text style={styles.locationTitle}>Pickup Location</Text>
                </View>
                <Text style={styles.addressText} numberOfLines={2}>
                  {pickupLocation.address}
                </Text>
                <View style={styles.coordsContainer}>
                  <View style={styles.coordRow}>
                    <Text style={styles.coordLabel}>Lat:</Text>
                    <Text style={styles.coordValue}>
                      {pickupLocation.latitude.toFixed(6)}
                    </Text>
                  </View>
                  <View style={styles.coordRow}>
                    <Text style={styles.coordLabel}>Lng:</Text>
                    <Text style={styles.coordValue}>
                      {pickupLocation.longitude.toFixed(6)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {destinationLocation && rideState === "in_progress" && (
              <View style={styles.locationSection}>
                <View style={styles.locationHeader}>
                  <Ionicons name="flag" size={20} color="#f44336" />
                  <Text style={styles.locationTitle}>Destination</Text>
                </View>
                <Text style={styles.addressText} numberOfLines={2}>
                  {destinationLocation.address}
                </Text>
                <View style={styles.coordsContainer}>
                  <View style={styles.coordRow}>
                    <Text style={styles.coordLabel}>Lat:</Text>
                    <Text style={styles.coordValue}>
                      {destinationLocation.latitude.toFixed(6)}
                    </Text>
                  </View>
                  <View style={styles.coordRow}>
                    <Text style={styles.coordLabel}>Lng:</Text>
                    <Text style={styles.coordValue}>
                      {destinationLocation.longitude.toFixed(6)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {driverLocation && (
              <View style={styles.locationSection}>
                <View style={styles.locationHeader}>
                  <FontAwesome5 name="car" size={18} color="#FEB914" />
                  <Text style={styles.locationTitle}>Driver Location</Text>
                </View>
                <View style={styles.coordsContainer}>
                  <View style={styles.coordRow}>
                    <Text style={styles.coordLabel}>Lat:</Text>
                    <Text style={styles.coordValue}>
                      {driverLocation.lat.toFixed(6)}
                    </Text>
                  </View>
                  <View style={styles.coordRow}>
                    <Text style={styles.coordLabel}>Lng:</Text>
                    <Text style={styles.coordValue}>
                      {driverLocation.lng.toFixed(6)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Status Message */}
        <View style={styles.messageContainer}>
          <FontAwesome5
            name={
              rideState === "driver_arrived" ? "check-circle" : "info-circle"
            }
            size={20}
            color={rideState === "driver_arrived" ? "#4CAF50" : "#FEB914"}
          />
          <Text style={styles.messageText}>
            {rideState === "driver_on_way"
              ? `${driver?.name || "Your driver"} is approaching. Get ready!`
              : rideState === "driver_arrived"
                ? `${driver?.name || "Your driver"} has arrived at pickup location!`
                : rideState === "in_progress"
                  ? "Enjoy your ride! Heading to destination..."
                  : "Tracking your ride in real-time"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 12,
  },
  topBar: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  iconContainer: {
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 50,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  topBarTitle: {
    color: "#FEB914",
    fontSize: 16,
    fontWeight: "bold",
  },
  topBarSubtitle: {
    color: "#aaa",
    fontSize: 10,
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  routeInfoBadge: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#FEB914",
  },
  routeInfoText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  pickupMarkerContainer: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 6,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  pickupMarkerInner: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 20,
    padding: 8,
  },
  driverMarkerContainer: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: "#111",
    borderWidth: 3,
    borderColor: "#FEB914",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#FEB914",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  destinationMarkerContainer: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: "#f44336",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 6,
    shadowColor: "#f44336",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  destinationMarkerInner: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 20,
    padding: 8,
  },
  bottomCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#111",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 2,
    borderTopColor: "#FEB914",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  driverInfoSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  driverAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#FEB914",
  },
  driverAvatar: {
    width: "100%",
    height: "100%",
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  driverMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    color: "#FEB914",
    fontSize: 14,
    fontWeight: "600",
  },
  vehicleText: {
    color: "#aaa",
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  locationsContainer: {
    marginBottom: 16,
    gap: 12,
  },
  locationSection: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  locationTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  addressText: {
    color: "#aaa",
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  coordsContainer: {
    gap: 4,
  },
  coordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  coordLabel: {
    color: "#aaa",
    fontSize: 12,
    width: 30,
  },
  coordValue: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "monospace",
    flex: 1,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(254, 185, 20, 0.1)",
    padding: 15,
    borderRadius: 12,
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#FEB914",
  },
  messageText: {
    color: "#fff",
    fontSize: 15,
    flex: 1,
    lineHeight: 20,
  },
});
