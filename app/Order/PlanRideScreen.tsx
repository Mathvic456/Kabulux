import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import Constants from "expo-constants";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import 'react-native-get-random-values';
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from "react-native-maps-directions";
import { darkMapStyle } from '../../styles/darkMapStyle';

// Import your existing axios instance
import { api } from '../../services/api';

const { height } = Dimensions.get('window');



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

interface DestinationLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface PlanRideScreenProps {
  setScreen: (screen: string, params?: any) => void;
  goBack: () => void;
  locationData?: UserLocation;
}

export default function PlanRideScreen({ setScreen, goBack, locationData }: PlanRideScreenProps) {
  const [isPanelUp, setIsPanelUp] = useState(false);
  const [slideAnim] = useState(new Animated.Value(height));
  const [destinationLocation, setDestinationLocation] = useState<DestinationLocation | null>(null);
  const [currentLocation, setCurrentLocation] = useState('Current Location');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mapRef = useRef<MapView>(null);

  const suggestedLocations = [
    { 
      id: 1, 
      name: 'ShopRite Cinema Sangotedo Lagos', 
      address: 'Sangotedo Rd, Ajah, Lagos',
      latitude: 6.5244,
      longitude: 3.3792
    },
    { 
      id: 2, 
      name: 'Lekki Conservation Centre', 
      address: 'Lekki-Epe Expressway, Lagos',
      latitude: 6.4413,
      longitude: 3.5244
    },
    { 
      id: 3, 
      name: 'Eko Atlantic City', 
      address: 'Victoria Island, Lagos',
      latitude: 6.4167,
      longitude: 3.4333
    },
  ];

  useEffect(() => {
    if (locationData && locationData.address) {
      setCurrentLocation(locationData.address);
    }

    const timer = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setIsPanelUp(true));
    }, 500);

    return () => clearTimeout(timer);
  }, [locationData]);

  // Fit map to show both markers when destination is selected
  useEffect(() => {
    if (locationData && destinationLocation && mapRef.current) {
      const coordinates = [
        {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        },
        {
          latitude: destinationLocation.latitude,
          longitude: destinationLocation.longitude,
        }
      ];

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
        animated: true,
      });
    } else if (locationData && mapRef.current) {
      // Just center on pickup location
      mapRef.current.animateToRegion({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  }, [destinationLocation, locationData]);


  const prepareBookingData = () => {
    if (!destinationLocation) {
      throw new Error('Destination location is required');
    }

    if (!locationData) {
      throw new Error('Current location data is required');
    }

    const requestData = {
      pickup_lat: locationData.latitude.toString(),
      pickup_lng: locationData.longitude.toString(),
      dropoff_lat: destinationLocation.latitude.toString(),
      dropoff_lng: destinationLocation.longitude.toString()
    };

    return requestData;
  };

  const handleConfirmRide = async () => {
    console.log('=== 🚗 handleConfirmRide STARTED ===');
    
    console.log('📊 Current State Values:');
    console.log('isSubmitting:', isSubmitting);
    console.log('locationData:', locationData);
    console.log('destinationLocation:', destinationLocation);
    console.log('currentLocation address:', currentLocation);

    if (!destinationLocation) {
      console.log('❌ No destination selected - showing alert');
      Alert.alert('Select Destination', 'Please select a destination first');
      return;
    }

    if (!locationData) {
      console.log('❌ No location data available - showing alert');
      Alert.alert('Location Error', 'Unable to access your current location. Please try again.');
      return;
    }

    if (isSubmitting) {
      console.log('❌ Already submitting - ignoring press');
      return;
    }

    console.log('✅ Starting submission process');
    setIsSubmitting(true);
    console.log('📊 isSubmitting set to:', true);

    try {
      const bookingData = prepareBookingData();
      
      console.log('=== 📍 LOCATION DATA DETAILS ===');
      console.log('🚖 USER CURRENT LOCATION:');
      console.log('📍 Address:', currentLocation);
      console.log('📍 Latitude:', locationData.latitude);
      console.log('📍 Longitude:', locationData.longitude);
      
      console.log('🎯 DESTINATION LOCATION:');
      console.log('📍 Name:', destinationLocation.name);
      console.log('📍 Address:', destinationLocation.address);
      console.log('📍 Latitude:', destinationLocation.latitude);
      console.log('📍 Longitude:', destinationLocation.longitude);
      
      console.log('=== 📦 REQUEST DATA BEING SENT ===');
      console.log('🌐 Endpoint: POST /rides/requests/estimate');
      console.log('📤 Request Body:', JSON.stringify(bookingData, null, 2));
      console.log('🌐 Full request URL:', api.defaults.baseURL + '/rides/requests/estimate/');

      console.log('🌐 Sending API request to /rides/requests/estimate...');
      const response = await api.post('/rides/requests/estimate/', bookingData);
      
      console.log('✅ API Response received:');
      console.log('📥 Response status:', response.status);
      console.log('📥 Response data:', JSON.stringify(response.data, null, 2));

      const navigationData = {
        estimateData: response.data,
        serverResponse: response.data,
        submittedAt: new Date().toISOString(),
        pickupLocation: {
          address: currentLocation,
          latitude: locationData.latitude,
          longitude: locationData.longitude
        },
        destination: {
          name: destinationLocation.name,
          address: destinationLocation.address,
          latitude: destinationLocation.latitude,
          longitude: destinationLocation.longitude
        },
        backendRequest: bookingData,
        estimatedPrice: response.data.price || response.data.estimated_cost,
        estimatedDuration: response.data.duration || response.data.estimated_time,
        distance: response.data.distance
      };

      console.log('➡️ Navigating to booking screen with data');
      setScreen('bookingScreen', navigationData);
      
    } catch (error: any) {
      console.error('❌ API Error Details:');
      console.error('Error object:', error);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('Request made but no response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      
      let errorMessage = 'Failed to get ride estimate. Please try again.';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = 'Invalid location data. Please check your pickup and destination.';
        } else if (error.response.status === 404) {
          errorMessage = 'Ride service not available in this area.';
        } else if (error.response.status === 422) {
          errorMessage = 'Unable to calculate route. Please try different locations.';
        } else if (error.response.status === 500) {
          errorMessage = 'Service temporarily unavailable. Please try again later.';
        } else {
          errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = `Request failed: ${error.message}`;
      }
      
      Alert.alert('Estimate Failed', errorMessage);
    } finally {
      console.log('🏁 Process completed - resetting isSubmitting to false');
      setIsSubmitting(false);
      console.log('📊 isSubmitting set to:', false);
    }
  };

  const handleSelectDestination = (location: DestinationLocation) => {
    setDestinationLocation(location);
    setShowSearchModal(false);
    console.log('Destination selected:', location);
  };

  const handleSelectSuggestedLocation = (location: any) => {
    setDestinationLocation(location);
    console.log('Destination selected:', location);
  };

  const handleBackPress = () => {
    goBack();
  };

// Memoize the destination marker to prevent unnecessary re-renders
const destinationMarker = useMemo(() => {
  if (!destinationLocation) return null;
  
  return (
    <Marker
      key={`destination-${destinationLocation.latitude}-${destinationLocation.longitude}`}
      coordinate={{
        latitude: destinationLocation.latitude,
        longitude: destinationLocation.longitude,
      }}
      centerOffset={{ x: 10, y: -10 }}
      title="Drop-off Location"
      description={destinationLocation.address}
    >
      <View style={styles.markerContainer}>
        <Image
          source={require('../../assets/images/send.png')}
          style={{ width: 20, height: 20 }}
          resizeMode="contain"
        />
      </View>
    </Marker>
  );
}, [destinationLocation?.latitude, destinationLocation?.longitude, destinationLocation?.address]);

  const shortenAddress = (address: string, maxLength: number = 35) => {
    if (address.length <= maxLength) return address;
    return address.substring(0, maxLength) + '...';
  };

  const testButtonPress = () => {
    console.log('=== 🔴 DEBUG BUTTON PRESSED ===');
    console.log('📊 Current State Values:');
    console.log('isSubmitting:', isSubmitting);
    
    console.log('🚖 USER CURRENT LOCATION:');
    if (locationData) {
      console.log('📍 Address:', currentLocation);
      console.log('📍 Latitude:', locationData.latitude);
      console.log('📍 Longitude:', locationData.longitude);
      console.log('📍 Full object:', locationData);
    } else {
      console.log('📍 No location data available');
    }
    
    console.log('🎯 DESTINATION LOCATION:');
    if (destinationLocation) {
      console.log('📍 Name:', destinationLocation.name);
      console.log('📍 Address:', destinationLocation.address);
      console.log('📍 Latitude:', destinationLocation.latitude);
      console.log('📍 Longitude:', destinationLocation.longitude);
      console.log('📍 Full object:', destinationLocation);
    } else {
      console.log('📍 No destination selected');
    }
    
    console.log('================================');
    
    Alert.alert('Debug', 'Button is working! Check console for both location details.');
  };

  const SearchModal = () => (
    <Modal
      visible={showSearchModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setShowSearchModal(false)}
          >
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Search Destination</Text>
        </View>

        <View style={styles.searchContainerWrapper}>
          <GooglePlacesAutocomplete
            placeholder="Search for a destination"
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
                const newLocation: DestinationLocation = {
                  name: data.structured_formatting?.main_text || data.description,
                  address: data.description,
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                };
                handleSelectDestination(newLocation);
              } else {
                const newLocation: DestinationLocation = {
                  name: data.description,
                  address: data.description,
                  latitude: 0,
                  longitude: 0,
                };
                handleSelectDestination(newLocation);
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
              placeholderTextColor: "#666",
              autoFocus: true,
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
                borderRadius: 10,
                paddingHorizontal: 15,
              },
              textInput: {
                flex: 1,
                color: "white",
                paddingVertical: 12,
                fontSize: 16,
                backgroundColor: "transparent",
              },
              listView: {
                backgroundColor: "#1c1c1c",
                marginTop: 10,
                borderRadius: 10,
              },
              row: {
                backgroundColor: "#2b2b2b",
                padding: 15,
                minHeight: 50,
                flexDirection: "row",
                marginBottom: 2,
              },
              separator: {
                height: 1,
                backgroundColor: "#333",
              },
              description: {
                color: "#fff",
                fontSize: 15,
              },
              loader: {
                flexDirection: "row",
                justifyContent: "flex-end",
                height: 20,
              },
            }}
            renderLeftButton={() => (
              <Ionicons name="search" size={20} color="#666" style={{ marginRight: 10 }} />
            )}
          />
        </View>
        
        <View style={styles.suggestedSection}>
          <Text style={styles.suggestedTitle}>Popular Destinations</Text>
          <ScrollView>
            {suggestedLocations.map((loc) => (
              <TouchableOpacity 
                key={loc.id} 
                style={styles.modalSuggestionItem}
                onPress={() => handleSelectDestination(loc)}
              >
                <FontAwesome5 name="map-marker-alt" size={18} color="#f0d46d" />
                <View style={styles.modalSuggestionText}>
                  <Text style={styles.modalSuggestionName}>{loc.name}</Text>
                  <Text style={styles.modalSuggestionAddress}>{loc.address}</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Map View */}
      <View style={styles.mapContainer}>
        {locationData ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={false}
            customMapStyle={darkMapStyle}
          >
            {/* Pickup Location Marker */}
            <Marker
              coordinate={{
                latitude: locationData.latitude,
                longitude: locationData.longitude,
              }}
              title="Pick-up Location"
              description={locationData.address}
              centerOffset={{ x: 10, y: 0 }}
            >
              <View style={styles.pickupMarkerContainer}>
                <Image
                  source={require('../../assets/images/target.png')}
                  style={{ width: 30, height: 30 }}
                  resizeMode="contain"
                />
              </View>
            </Marker>

            {/* Destination Marker */}
          
           {destinationMarker}
            {/* Route Line */}
            {destinationLocation && (
         <MapViewDirections
           origin={{
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          }}
          destination={{
            latitude: destinationLocation.latitude,
            longitude: destinationLocation.longitude,
          }}
          apikey={GOOGLE_API_KEY}
          strokeWidth={4}
          strokeColor="#ffbc07"
          optimizeWaypoints={true}
          onReady={(result: any) => {
            console.log(`Distance: ${result.distance} km`);
            console.log(`Duration: ${result.duration} min`);
          }}
          onError={(errMessage) => console.warn(errMessage)}
        />
            )}
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator size="large" color="#f0d46d" />
            <Text style={styles.mapText}>Loading map...</Text>
          </View>
        )}

        {/* Map Info Badge */}
        {destinationLocation && (
          <View style={styles.mapInfoBadge}>
            <Ionicons name="information-circle" size={20} color="#f0d46d" />
            <Text style={styles.mapInfoText}>Route Preview</Text>
          </View>
        )}
      </View>

      {/* Top Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconContainer} onPress={handleBackPress}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
          <Feather name="navigation" size={24} color="#f0d46d" />
        </TouchableOpacity>
      </View>

      {/* Bottom Panel */}
      <Animated.View style={[styles.bottomPanel, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.panelHeader}>
          <TouchableOpacity style={styles.headerIconContainer} onPress={handleBackPress}>
            <Feather name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Plan your Ride</Text>
          {locationData && (
            <View style={styles.locationIndicator}>
              <Feather name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.locationIndicatorText}>Live Location</Text>
            </View>
          )}
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.locationInputCard}>
            <View style={styles.inputRow}>
              <View style={styles.locationPinLine}>
                <View style={styles.startPin} />
                <View style={styles.line} />
                <View style={styles.endPin} />
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>Pick up Location</Text>
                  <Text style={[styles.inputValue, styles.currentLocationText]}>
                    {locationData ? '📍 ' + shortenAddress(currentLocation, 40) : 'Current Location'}
                  </Text>
                  {locationData && (
                    <Text style={styles.locationAccuracy}>
                      ✓ Latitude: {locationData.latitude.toFixed(6)}, Longitude: {locationData.longitude.toFixed(6)}
                    </Text>
                  )}
                </View>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>Where to?</Text>
                  <TouchableOpacity onPress={() => setShowSearchModal(true)}>
                    <Text style={[styles.inputValue, destinationLocation ? styles.selectedDestination : styles.placeholderText]}>
                      {destinationLocation ? '🏁 ' + shortenAddress(destinationLocation.address, 40) : 'Select your destination'}
                    </Text>
                  </TouchableOpacity>
                  {destinationLocation && (
                    <Text style={styles.locationAccuracy}>
                      ✓ Latitude: {destinationLocation.latitude.toFixed(6)}, Longitude: {destinationLocation.longitude.toFixed(6)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested Locations</Text>
            {suggestedLocations.map((loc) => (
              <TouchableOpacity 
                key={loc.id} 
                style={[
                  styles.suggestionItem,
                  destinationLocation?.name === loc.name && styles.selectedSuggestion
                ]} 
                onPress={() => handleSelectSuggestedLocation(loc)}
              >
                <FontAwesome5 
                  name="map-marker-alt" 
                  size={18} 
                  color={destinationLocation?.name === loc.name ? '#f0d46d' : '#aaa'} 
                />
                <View style={styles.suggestionTextContainer}>
                  <Text style={[
                    styles.suggestionName,
                    destinationLocation?.name === loc.name && styles.selectedSuggestionText
                  ]}>
                    {loc.name}
                  </Text>
                  <Text style={styles.suggestionAddress}>{loc.address}</Text>
                  <Text style={styles.coordinatesText}>
                    Lat: {loc.latitude.toFixed(4)}, Lng: {loc.longitude.toFixed(4)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => setShowSearchModal(true)}
          >
            <Ionicons name="search" size={20} color="#f0d46d" />
            <Text style={styles.searchButtonText}>Search for another destination</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.confirmButton,
              { 
                backgroundColor: destinationLocation && locationData && !isSubmitting ? '#f0d46d' : '#555',
                opacity: (!destinationLocation || !locationData || isSubmitting) ? 0.6 : 1
              }
            ]}
            onPress={handleConfirmRide}
            disabled={!destinationLocation || !locationData || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.confirmButtonText}>Getting Estimate...</Text>
              </View>
            ) : (
              <Text style={styles.confirmButtonText}>
                {!locationData ? 'Waiting for Location...' : 
                 !destinationLocation ? 'Select Destination' : 
                 `Get Estimate to ${shortenAddress(destinationLocation.address, 20)}`}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>

      <SearchModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#333',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 16,
    color: '#f0d46d',
    marginTop: 10,
  },
  mapInfoBadge: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapInfoText: {
    color: '#f0d46d',
    fontSize: 14,
    fontWeight: '600',
  },
  markerContainer: {
    alignItems: 'center',
    backgroundColor: "#ffbc07",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center'


  },

    pickupMarkerContainer: {
    height: 40,
    width: 40,
    borderRadius: 10,
    backgroundColor: "#1f1f1fff",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  mapContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapSubtext: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconContainer: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 50,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.60,
    backgroundColor: '#1c1c1c',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIconContainer: {
    padding: 8,
    backgroundColor: '#333',
    borderRadius: 50,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 15,
    flex: 1,
  },
  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  locationIndicatorText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '600',
  },
  locationInputCard: {
    backgroundColor: '#2b2b2b',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  inputContainer: {
    flex: 1,
  },
  locationPinLine: {
    alignItems: 'center',
    marginRight: 15,
    marginTop: 5,
  },
  startPin: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  line: {
    width: 1.5,
    height: 40,
    backgroundColor: '#555',
    marginVertical: 4,
  },
  endPin: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f0d46d',
  },
  inputBox: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 4,
  },
  inputValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  currentLocationText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  placeholderText: {
    color: '#666',
    fontStyle: 'italic',
  },
  selectedDestination: {
    color: '#f0d46d',
    fontWeight: '600',
  },
  locationAccuracy: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  selectedSuggestion: {
    backgroundColor: 'rgba(240, 212, 109, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginHorizontal: -10,
  },
  suggestionTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    marginBottom: 4,
  },
  selectedSuggestionText: {
    color: '#f0d46d',
    fontWeight: '600',
  },
  suggestionAddress: {
    fontSize: 12,
    color: '#aaa',
    lineHeight: 16,
  },
  coordinatesText: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2b2b2b',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  searchButtonText: {
    color: '#f0d46d',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  confirmButton: {
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1c1c1c',
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalCloseButton: {
    padding: 8,
    backgroundColor: '#333',
    borderRadius: 50,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 15,
  },
  searchContainerWrapper: {
    padding: 20,
    zIndex: 10,
  },
  suggestedSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  suggestedTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2b2b2b',
    borderRadius: 10,
    marginBottom: 10,
  },
  modalSuggestionText: {
    flex: 1,
    marginLeft: 15,
  },
  modalSuggestionName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  modalSuggestionAddress: {
    color: '#aaa',
    fontSize: 12,
  },
});