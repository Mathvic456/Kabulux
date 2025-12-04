import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import { useRide } from "../../context/RideContext";
import { darkMapStyle } from '../../styles/darkMapStyle';

export default function RideTrackingScreen({ goBack }: { goBack: () => void }) {
  const { driverLocation, rideId } = useRide();
  const mapRef = useRef<MapView>(null);

  // Animate map to driver location when it updates
  useEffect(() => {
    if (driverLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: driverLocation.lat,
        longitude: driverLocation.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [driverLocation]);

  return (
    <View style={styles.container}>
      {/* Top Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconContainer} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.topBarTitle}>Tracking Driver</Text>
        </View>
        <View style={styles.iconContainer} />
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: driverLocation?.lat || 5.0377,
            longitude: driverLocation?.lng || 7.9128,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          customMapStyle={darkMapStyle}
        >
          {driverLocation && (
            <Marker
              coordinate={{
                latitude: driverLocation.lat,
                longitude: driverLocation.lng,
              }}
              title="Driver Location"
              description="Your driver is here"
            >
              <View style={styles.markerContainer}>
                <FontAwesome5 name="car" size={24} color="#FEB914" />
              </View>
            </Marker>
          )}
        </MapView>
      </View>

      {/* Bottom Info Card */}
      <View style={styles.bottomCard}>
        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Driver is on the way</Text>
        </View>

        {driverLocation && (
          <View style={styles.coordsContainer}>
            <View style={styles.coordRow}>
              <Ionicons name="location-outline" size={16} color="#FEB914" />
              <Text style={styles.coordLabel}>Latitude:</Text>
              <Text style={styles.coordValue}>{driverLocation.lat.toFixed(6)}</Text>
            </View>
            <View style={styles.coordRow}>
              <Ionicons name="location-outline" size={16} color="#FEB914" />
              <Text style={styles.coordLabel}>Longitude:</Text>
              <Text style={styles.coordValue}>{driverLocation.lng.toFixed(6)}</Text>
            </View>
          </View>
        )}

        <View style={styles.messageContainer}>
          <FontAwesome5 name="check-circle" size={20} color="#4CAF50" />
          <Text style={styles.messageText}>
            Your driver is approaching. Get ready!
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  topBarTitle: {
    color: "#FEB914",
    fontSize: 16,
    fontWeight: "bold",
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: "#111",
    borderWidth: 3,
    borderColor: "#FEB914",
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#FEB914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
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
    backgroundColor: "#4CAF50",
    marginRight: 10,
  },
  statusText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  coordsContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  coordRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 8,
  },
  coordLabel: {
    color: "#aaa",
    fontSize: 14,
  },
  coordValue: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "monospace",
    flex: 1,
  },
  rideIdText: {
    color: "#666",
    fontSize: 12,
    fontFamily: "monospace",
    marginBottom: 16,
    textAlign: "center",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    padding: 15,
    borderRadius: 12,
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#4CAF50",
  },
  messageText: {
    color: "#fff",
    fontSize: 15,
    flex: 1,
    lineHeight: 20,
  },
});