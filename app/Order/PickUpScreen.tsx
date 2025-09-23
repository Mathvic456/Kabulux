import { Ionicons } from "@expo/vector-icons";
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

  useEffect(() => {
    getUserLocation();
    
    // Start the animation immediately without timeout
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []); // Removed slideAnim dependency

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

      {/* Map Placeholder with Loading State */}
      <View style={styles.mapPlaceholder}>
        {isGettingLocation ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="locate" size={50} color="#f6a623" />
            <Text style={styles.loadingText}>Finding your location...</Text>
          </View>
        ) : userLocation ? (
          <View style={styles.locationFoundContainer}>
            <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />
            <Text style={styles.locationFoundText}>Location Found!</Text>
            <Text style={styles.addressPreview} numberOfLines={2}>
              {userLocation.address}
            </Text>
          </View>
        ) : (
          <Text style={styles.mapText}>📍 Enable location services</Text>
        )}
      </View>

      {/* Bottom Sheet - Now immediately visible without animation delay */}
      <View style={styles.bottomSheet}>
        <Text style={styles.title}>Set your Pick-up Location</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="white" />
          <TextInput
            style={styles.input}
            placeholder="Search or use current location"
            placeholderTextColor="#aaa"
            value={pickup}
            onChangeText={setPickup}
            editable={!isGettingLocation}
          />
          <TouchableOpacity 
            style={styles.locateIcon}
            onPress={handleUseCurrentLocation}
            disabled={isGettingLocation}
          >
            <Ionicons 
              name="locate" 
              size={20} 
              color={isGettingLocation ? "#666" : "#f6a623"} 
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
    borderWidth: 1,
    borderColor: 'blue',
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#f6a623',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  locationFoundContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationFoundText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
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