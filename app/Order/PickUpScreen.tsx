import { Ionicons } from "@expo/vector-icons";
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import { darkMapStyle } from '../../styles/darkMapStyle';


import Constants from "expo-constants";
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import 'react-native-get-random-values';
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

export default function PickUpScreen({ setScreen, goBack }: { 
  setScreen: (screen: string, locationData?: UserLocation) => void; 
  goBack: () => void; 
}) {
  const [pickup, setPickup] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    // Don't automatically get location on mount
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Animate map to user location when it's available
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [userLocation]);

  const getUserLocation = async () => {
    try {
      setIsGettingLocation(true);
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to find your current location.');
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
          }
        };
        
        setUserLocation(locationData);
        setPickup(formattedAddress);
        // REMOVED: The automatic navigation that was here
      }
      
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your current location. Please try again.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const formatAddress = (address: Location.LocationGeocodedAddress): string => {
    if (!address) return "";
    
    const parts = [];
    
    if (address.name && address.name !== address.street) parts.push(address.name);
    if (address.street) parts.push(address.street);
    if (address.district) parts.push(address.district);
    if (address.city) parts.push(address.city);
    if (address.region) parts.push(address.region);
    if (address.postalCode) parts.push(address.postalCode);
    if (address.country) parts.push(address.country);
    
    return parts.filter(part => part && part.trim() !== '').join(', ');
  };

  const handleManualConfirm = () => {
    if (pickup.trim() && userLocation) {
      setScreen("planRide", userLocation);
    }
  };

  const handleUseCurrentLocation = () => {
    getUserLocation();
  };

  const handleLocatePress = () => {
    getUserLocation();
  };

  const renderAddressDetails = () => {
    if (!userLocation) return null;

    return (
      <View style={styles.locationDetails}>
        {/* Address details commented out */}
      </View>
    );
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
            <TouchableOpacity style={styles.iconContainer} onPress={handleLocatePress}>
              <Ionicons name="locate" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Map View */}
          <View style={styles.mapPlaceholder}>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: userLocation?.latitude || 5.0377,
                longitude: userLocation?.longitude || 7.9128,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
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
              <Image
                  source={require('../../assets/images/Pickup_marker-removebg-preview.png')}
                  style={{ width: 40, height: 40 }}
                  resizeMode="contain"
                />
                </Marker>
              )}
            </MapView>

            {/* Overlay for loading state */}
            {isGettingLocation && (
              <View style={styles.overlayContainer}>
                <View style={styles.loadingContainer}>
                  <Ionicons name="locate" size={50} color="#f6a623" />
                  <Text style={styles.loadingText}>Finding your location...</Text>
                  <ActivityIndicator size="large" color="#f6a623" style={{ marginTop: 10 }} />
                </View>
              </View>
            )}

            {/* Overlay for location found (brief display) */}
            {!isGettingLocation && userLocation && (
              <View style={styles.locationFoundBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.locationFoundBadgeText}>Location Found!</Text>
              </View>
            )}
          </View>

          {/* Bottom Sheet */}
          <View style={styles.bottomSheet}>
            <Text style={styles.title}>Set your Pick-up Location</Text>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <GooglePlacesAutocomplete
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
                      }
                    };
                    setUserLocation(newLocation);
                    setPickup(data.description);
                  }
                }}
                onTimeout={() => {
                  console.warn('Google Places Autocomplete: request timeout');
                }}
                predefinedPlaces={[]}
                predefinedPlacesAlwaysVisible={false}
                suppressDefaultStyles={false}
                textInputHide={false}
                textInputProps={{
                  value: pickup,
                  onChangeText: setPickup,
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
                    backgroundColor: "#333",
                    borderRadius: 8,
                    paddingHorizontal: 8,
                  },
                  textInput: {
                    flex: 1,
                    color: "white",
                    paddingVertical: 10,
                    marginLeft: 8,
                    backgroundColor: "transparent",
                  },
                  listView: {
                    backgroundColor: "#222",
                    marginTop: 5,
                    borderRadius: 8,
                    position: "absolute",
                    top: 50,
                    left: 0,
                    right: 0,
                    maxHeight: 200,
                  },
                  row: {
                    backgroundColor: "#222",
                    padding: 13,
                    minHeight: 44,
                    flexDirection: "row",
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

            {/* Address Details */}
            {userLocation && renderAddressDetails()}

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
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#f6a623',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  locationFoundBadge: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationFoundBadgeText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addressPreview: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  mapText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f6a623",
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
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
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