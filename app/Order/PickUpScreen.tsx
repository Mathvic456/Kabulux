import CentralModal from "@/components/CentralModal";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import { darkMapStyle } from "../../styles/darkMapStyle";

import Constants from "expo-constants";
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
  View
} from "react-native";
import "react-native-get-random-values";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

if (!Constants.expoConfig?.extra?.googleMapsApiKey) {
  throw new Error("API is missing in expoConfig.extra");
}

const GOOGLE_API_KEY = Constants.expoConfig.extra.googleMapsApiKey;

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
  const [initialRegion, setInitialRegion] = useState({
    latitude: 9.082, // Center of Nigeria as fallback
    longitude: 8.6753,
    latitudeDelta: 8,
    longitudeDelta: 8,
  });
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [showErrorModal, setShowErrorModal] = useState(false);
  const mapRef = useRef<MapView>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Automatically request location and get user's position on screen load
    requestLocationAndCenter();
  }, []);

  // Animate map to user location when it's available
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000,
      );
    }
  }, [userLocation]);

  const requestLocationAndCenter = async () => {
    try {
      setIsGettingLocation(true);

      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        // Permission denied - keep default center (Nigeria)
        Alert.alert(
          "Location Permission Required",
          "Please enable location access to automatically center the map on your current location.",
          [{ text: "OK" }],
        );
        setIsGettingLocation(false);
        return;
      }

      // Permission granted - get current location
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Update initial region to user's location
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setInitialRegion(newRegion);

      // Get address from coordinates
      let addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        const formattedAddress = formatAddress(address);

        const locationData: UserLocation = {
          address: formattedAddress,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          coordinates: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        };

        setUserLocation(locationData);
        setPickup(formattedAddress);

        // Set the text in the autocomplete input
        if (autocompleteRef.current) {
          autocompleteRef.current.setAddressText(formattedAddress);
        }

        // Animate map to the detected location
        if (mapRef.current) {
          setTimeout(() => {
            mapRef.current?.animateToRegion(newRegion, 1000);
          }, 500);
        }
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

      let addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        const formattedAddress = formatAddress(address);

        const locationData: UserLocation = {
          address: formattedAddress,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          coordinates: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        };
        setIsGettingLocation(false);
        setUserLocation(locationData);
        setPickup(formattedAddress);

        // Set the text in the autocomplete input
        if (autocompleteRef.current) {
          autocompleteRef.current.setAddressText(formattedAddress);
        }
      }
    } catch (error) {
      console.error("Error getting location:", error);
      setShowErrorModal(true);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const formatAddress = (address: Location.LocationGeocodedAddress): string => {
    if (!address) return "";

    const parts = [];

    if (address.name && address.name !== address.street)
      parts.push(address.name);
    if (address.street) parts.push(address.street);
    if (address.district) parts.push(address.district);
    if (address.city) parts.push(address.city);
    if (address.region) parts.push(address.region);
    if (address.postalCode) parts.push(address.postalCode);
    if (address.country) parts.push(address.country);

    return parts.filter((part) => part && part.trim() !== "").join(", ");
  };

  const handleManualConfirm = () => {
    console.log("🔍 handleManualConfirm called");
    console.log("📍 userLocation:", userLocation);
    console.log("📝 pickup text:", pickup);

    if (userLocation) {
      const finalLocation: UserLocation = {
        ...userLocation,
        address: pickup || userLocation.address || "Unnamed Location",
      };
      console.log("Final location prepared:", finalLocation);
      console.log("🚀 Calling setScreen with 'planRide'");
      setScreen("planRide", finalLocation);
    } else {
      console.log("No userLocation set");
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
          {/* Top Navigation */}
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

          {/* Map View */}
          <View style={styles.mapPlaceholder}>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={initialRegion}
              showsUserLocation
              showsMyLocationButton={false}
              showsCompass={false}
              customMapStyle={darkMapStyle}
            >
              {userLocation && (
                <Marker
                  coordinate={userLocation.coordinates}
                  title="Pick-up Location"
                  description={userLocation.address}
                >
                  <View style={styles.markerContainer}>
                    <Image
                      source={require("../../assets/images/target.png")}
                      style={{ width: 40, height: 40 }}
                      resizeMode="contain"
                    />
                  </View>
                </Marker>
              )}
            </MapView>

            {/* Overlay for loading state */}
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

          {/* Bottom Sheet */}
          <View style={styles.bottomSheet}>
            <Text style={styles.title}>Set your Pick-up Location</Text>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <GooglePlacesAutocomplete
                ref={autocompleteRef}
                placeholder="Search or use current location"
                query={{
                  key: GOOGLE_API_KEY,
                  language: "en",
                  components: "country:ng",
                }}
                autoFillOnNotFound={false}
                currentLocation={false}
                currentLocationLabel="Current location"
                debounce={300}
                disableScroll={false}
                enableHighAccuracyLocation={true}
                enablePoweredByContainer={false}
                fetchDetails={true}
                filterReverseGeocodingByTypes={[]}
                GooglePlacesDetailsQuery={{}}
                GooglePlacesSearchQuery={{}}
                GoogleReverseGeocodingQuery={{}}
                isRowScrollable={true}
                keyboardShouldPersistTaps="always"
                listUnderlayColor="#c8c7cc"
                listViewDisplayed="auto"
                keepResultsAfterBlur={false}
                minLength={2}
                nearbyPlacesAPI="GooglePlacesSearch"
                numberOfLines={1}
                onFail={(error) => {
                  console.error("Places API error:", error);
                }}
                onNotFound={() => {
                  console.log("No results found");
                }}
                onPress={(data, details = null) => {
                  console.log("Selected place:", data.description);
                  if (details?.geometry?.location) {
                    const newLocation: UserLocation = {
                      address: data.description,
                      latitude: details.geometry.location.lat,
                      longitude: details.geometry.location.lng,
                      coordinates: {
                        latitude: details.geometry.location.lat,
                        longitude: details.geometry.location.lng,
                      },
                    };
                    setUserLocation(newLocation);
                    setPickup(data.description);
                  }
                }}
                onTimeout={() => {
                  console.warn("Google Places Autocomplete: request timeout");
                }}
                predefinedPlaces={[]}
                predefinedPlacesAlwaysVisible={false}
                suppressDefaultStyles={false}
                textInputHide={false}
                textInputProps={{
                  onChangeText: (text) => {
                    setPickup(text);
                  },
                  placeholderTextColor: "#aaa",
                }}
                timeout={20000}
                styles={{
                  container: {
                    flex: 0,
                    zIndex: 1,
                  },
                  textInputContainer: {
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#2b2b2b",
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderColor: "#444",
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                  },
                  textInput: {
                    flex: 1,
                    color: "white",
                    paddingVertical: 10,
                    marginLeft: 8,
                    backgroundColor: "transparent",
                  },
                  listView: {
                    backgroundColor: "#1c1c1c",
                    marginTop: 10,
                    borderRadius: 12,
                    maxHeight: 250,
                    elevation: 5,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    borderWidth: 1,
                    borderColor: "#333",
                  },
                  row: {
                    backgroundColor: "#2b2b2b",
                    padding: 15,
                    minHeight: 50,
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 1,
                  },
                  separator: {
                    height: 0.5,
                    backgroundColor: "#444",
                  },
                  description: {
                    color: "#fff",
                  },
                  loader: {
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    height: 20,
                  },
                }}
                renderLeftButton={() => (
                  <Ionicons name="search" size={20} color="white" />
                )}
                renderRightButton={() => (
                  <TouchableOpacity
                    onPress={handleUseCurrentLocation}
                    disabled={isGettingLocation}
                    style={{ marginLeft: 8, padding: 5 }}
                  >
                    <Ionicons
                      name="locate"
                      size={20}
                      color={isGettingLocation ? "#666" : "#f6a623"}
                    />
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* Loading State or Confirm Button */}
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
    ...StyleSheet.absoluteFillObject,
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
  locationFoundBadge: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationFoundBadgeText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "bold",
  },
  addressPreview: {
    color: "#a10505",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  mapText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f6a623",
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
    zIndex: 1,
  },
  locationDetails: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: "#4CAF50",
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
