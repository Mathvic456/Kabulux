import { Ionicons } from "@expo/vector-icons";
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker } from "react-native-maps";

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
  const [isGettingLocation, setIsGettingLocation] = useState(true);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current; // Start at 0 (already visible)
  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    getUserLocation();
    startWatchingLocation();
    
    // Start the animation immediately without timeout
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // cleanup on unmount
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []); // Removed slideAnim dependency

  const startWatchingLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      //Subscription is to watch position, you can check if the interval is okay (decrease/increase) as needed
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000, 
          distanceInterval: 1, //1 meter
        },
        (loc) => {
          // Update map region to follow user
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        }
      );
    } catch (error) {
      console.error('Error watching location:', error);
    }
  };

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
      
      if (addresses.length > 0) {
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
        
        // Animate map to user location
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
        
        // Auto-navigate after getting location (optional - you can remove this too if you want)
        setTimeout(() => {
          setScreen("planRide", locationData);
        }, 1500);
      }
      
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your current location. Please try again.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const formatAddress = (address: Location.LocationGeocodedAddress): string => {
    const parts = [];
    
    // Start with the most specific details first
    if (address.name && address.name !== address.street) parts.push(address.name);
    if (address.street) parts.push(address.street);
    if (address.district) parts.push(address.district);
    if (address.city) parts.push(address.city);
    if (address.region) parts.push(address.region);
    if (address.postalCode) parts.push(address.postalCode);
    if (address.country) parts.push(address.country);
    
    // Filter out any empty parts and join with commas
    return parts.filter(part => part && part.trim() !== '').join(', ');
  };

  const handleManualConfirm = () => {
    if (pickup.trim() && userLocation) {
      setScreen("planRide", userLocation);
    }
  };

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      setPickup(userLocation.address);
      setScreen("planRide", userLocation);
    } else {
      getUserLocation();
    }
  };

  const handleLocatePress = () => {
    getUserLocation();
  };

  // Function to display address in a more readable format
  const renderAddressDetails = () => {
    if (!userLocation) return null;

    return (
      <View style={styles.locationDetails}>
        {/* <Text style={styles.detailTitle}>📍 Your Current Address:</Text>
        <Text style={styles.addressText}>{userLocation.address}</Text>
        <View style={styles.addressBreakdown}>
          {userLocation.address.split(', ').map((part, index) => (
            <Text key={index} style={styles.addressPart}>
              {part.trim()}
            </Text>
          ))}
        </View> */}
      </View>
    );
  };

  return (
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

      {/* Map View - Fully Functional */}
      <MapView
        ref={mapRef}
        style={styles.mapPlaceholder}
        initialRegion={{
          latitude: userLocation?.latitude || 37.78825,
          longitude: userLocation?.longitude || -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        followsUserLocation={true}
      >
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="You are here"
          />
        )}
      </MapView>

      {/* Bottom Sheet - Now immediately visible without animation delay */}
      <View style={styles.bottomSheet}>
        <Text style={styles.title}>Set your Pick-up Location</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="white" />
          <GooglePlacesAutocomplete
            placeholder="Search for a location"
            fetchDetails={true} // important! gives lat/lng
            onPress={(data, details = null) => {
              // 'details' contains geometry (lat/lng)
              if (details) {
                const location = {
                  address: data.description,
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                  coordinates: {
                    latitude: details.geometry.location.lat,
                    longitude: details.geometry.location.lng
                  },
                };
                setUserLocation(location);
                
                // Animate map to selected location
                if (mapRef.current) {
                  mapRef.current.animateToRegion({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  });
                }
              }
            }}
            query={{
              key: process.env.GOOGLE_MAPS_API_KEY, // set it up in env
              language: 'en',
            }}
            styles={{
              textInput: { height: 40, color: '#000', fontSize: 16 },
            }}
          />

          <TouchableOpacity 
            style={styles.locateIcon}
            onPress={handleUseCurrentLocation}
          >
            <Ionicons 
              name="locate" 
              size={20} 
              color="#f6a623"
            />
          </TouchableOpacity>
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
            onPress={handleManualConfirm}
          >
            <Text style={styles.confirmText}>
              {userLocation ? "✓ Use This Address" : "Confirm Pick-up"}
            </Text>
          </TouchableOpacity>
        )}
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
    justifyContent: "center",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    color: "white",
    paddingVertical: 10,
    marginLeft: 8,
  },
  locateIcon: {
    marginLeft: 8,
  },
  locationDetails: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  detailTitle: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 14,
  },
  addressText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 20,
  },
  addressBreakdown: {
    marginTop: 5,
  },
  addressPart: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 2,
    fontStyle: 'italic',
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