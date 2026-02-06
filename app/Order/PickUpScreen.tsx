import CentralModal from "@/components/CentralModal";
import { Ionicons } from "@expo/vector-icons";
import Mapbox from '@rnmapbox/maps';
import Constants from "expo-constants";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MapboxSearchInput from "../../components/MapBoxSearchInput";

if (!Constants.expoConfig?.extra?.mapboxAccessToken) {
  throw new Error("Mapbox token is missing in app.json extra config");
}

const MAPBOX_ACCESS_TOKEN = Constants.expoConfig.extra.mapboxAccessToken;

// Initialize Mapbox
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

interface UserLocation {
  address: string;
  latitude: number;
  longitude: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export default function PickUpScreen({
  setScreen,
  goBack,
}: {
  setScreen: (screen: string, locationData?: UserLocation) => void;
  goBack: () => void;
}) {
  const [pickup, setPickup] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [showErrorModal, setShowErrorModal] = useState(false);

  const cameraRef = useRef<Mapbox.Camera>(null);
  const mapRef = useRef<Mapbox.MapView>(null);
  const [proximityCoords, setProximityCoords] = useState<[number, number] | undefined>();

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    requestLocationAndCenter();
  }, []);

  useEffect(() => {
    if (userLocation && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [userLocation.longitude, userLocation.latitude],
        zoomLevel: 15,
        animationDuration: 1000,
      });
    }
  }, [userLocation]);

  const reverseGeocodeMapbox = async (lng: number, lat: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=address,place,poi`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }
      return "Unknown Location";
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return "Unknown Location";
    }
  };

  const requestLocationAndCenter = async () => {
    try {
      setIsGettingLocation(true);

      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Please enable location access to automatically center the map on your current location.",
          [{ text: "OK" }],
        );
        setIsGettingLocation(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setProximityCoords([location.coords.longitude, location.coords.latitude]);

      const address = await reverseGeocodeMapbox(
        location.coords.longitude,
        location.coords.latitude
      );

      const locationData: UserLocation = {
        address: address,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      };

      setUserLocation(locationData);
      setPickup(address);

      if (cameraRef.current) {
        setTimeout(() => {
          cameraRef.current?.setCamera({
            centerCoordinate: [location.coords.longitude, location.coords.latitude],
            zoomLevel: 15,
            animationDuration: 1000,
          });
        }, 500);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      setShowErrorModal(true);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const getUserLocation = async () => {
    try {
      setIsGettingLocation(true);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Location permission is required to find your current location.",
        );
        setIsGettingLocation(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      setProximityCoords([location.coords.longitude, location.coords.latitude]);

      const address = await reverseGeocodeMapbox(
        location.coords.longitude,
        location.coords.latitude
      );

      const locationData: UserLocation = {
        address: address,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      };

      setUserLocation(locationData);
      setPickup(address);
      setIsGettingLocation(false);
    } catch (error) {
      console.error("Error getting location:", error);
      setShowErrorModal(true);
      setIsGettingLocation(false);
    }
  };

  const handleSelectLocation = (result: any) => {
    const [lng, lat] = result.center;

    const locationData: UserLocation = {
      address: result.place_name,
      latitude: lat,
      longitude: lng,
      coordinates: {
        latitude: lat,
        longitude: lng,
      },
    };

    setUserLocation(locationData);
    setPickup(result.place_name);

    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [lng, lat],
        zoomLevel: 15,
        animationDuration: 1000,
      });
    }
  };

  const handleManualConfirm = () => {
    if (userLocation) {
      const finalLocation: UserLocation = {
        ...userLocation,
        address: pickup || userLocation.address || "Unnamed Location",
      };
      setScreen("planRide", finalLocation);
    } else {
      Alert.alert(
        "No location",
        "Please pick a location or use your current one.",
      );
    }
  };

  const handleUseCurrentLocation = () => {
    getUserLocation();
  };

  const handleLocatePress = () => {
    getUserLocation();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconContainer} onPress={goBack}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={handleLocatePress}
            >
              <Ionicons name="locate" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.mapPlaceholder}>
            <Mapbox.MapView
              ref={mapRef}
              style={styles.map}
              styleURL={Mapbox.StyleURL.Dark}
              logoEnabled={false}
              attributionEnabled={false}
              compassEnabled={false}
            >
              <Mapbox.Camera
                ref={cameraRef}
                zoomLevel={12}
                centerCoordinate={[8.6753, 9.082]}
                animationMode="flyTo"
                animationDuration={1000}
              />

              <Mapbox.UserLocation
                visible={true}
                showsUserHeadingIndicator={true}
              />

              {userLocation && (
                <Mapbox.PointAnnotation
                  id="pickup-marker"
                  coordinate={[userLocation.longitude, userLocation.latitude]}
                >
                  <View style={styles.markerContainer}>
                    <Image
                      source={require("../../assets/images/target.png")}
                      style={{ width: 40, height: 40 }}
                      resizeMode="contain"
                      fadeDuration={0}
                    />
                  </View>
                  {/* Callout for when marker is tapped */}
                  <Mapbox.Callout title="Pick-up Location" />
                </Mapbox.PointAnnotation>
              )}
            </Mapbox.MapView>

            {isGettingLocation && (
              <View style={styles.overlayContainer}>
                <View style={styles.loadingContainer}>
                  <Ionicons name="locate" size={50} color="#f6a623" />
                  <Text style={styles.loadingText}>
                    Finding your location...
                  </Text>
                  <ActivityIndicator
                    size="large"
                    color="#f6a623"
                    style={{ marginTop: 10 }}
                  />
                </View>
              </View>
            )}
          </View>

          <View style={styles.bottomSheet}>
            <Text style={styles.title}>Set your Pick-up Location</Text>

            <View style={styles.searchContainer}>
              <MapboxSearchInput
                value={pickup}
                onChangeText={setPickup}
                onSelectLocation={handleSelectLocation}
                onUseCurrentLocation={handleUseCurrentLocation}
                isGettingLocation={isGettingLocation}
                placeholder="Search or use current location"
                countryCode="ng"
                proximity={proximityCoords}
              />
            </View>

            {isGettingLocation ? (
              <View style={[styles.confirmButton, { backgroundColor: "#555" }]}>
                <Text style={styles.confirmText}>
                  🔍 Getting your address...
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  { backgroundColor: userLocation ? "#4CAF50" : "#f6a623" },
                ]}
                disabled={!userLocation}
                onPress={handleManualConfirm}
              >
                <Text style={styles.confirmText}>
                  {userLocation ? "✓ Use This Address" : "Confirm Pick-up"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <CentralModal
            visible={showErrorModal}
            onClose={() => setShowErrorModal(false)}
            title="Location Error"
            subText="Failed to get your current location. Please try again."
            icon="alert-circle"
            iconColor="#ff4444"
            confirmText="OK"
            confirmButtonColor="#f6a623"
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    zIndex: 10,
  },
  iconContainer: {
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 50,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#333",
    position: "relative",
  },
  map: {
    flex: 1,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    color: "#f6a623",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  markerContainer: {
    height: 50,
    width: 50,
    borderRadius: 10,
    backgroundColor: "#1f1f1fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#111",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  title: {
    color: "white",
    fontSize: 16,
    marginBottom: 15,
  },
  searchContainer: {
    marginBottom: 15,
  },
  confirmButton: {
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  confirmText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});