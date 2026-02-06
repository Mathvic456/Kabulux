import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import Mapbox from '@rnmapbox/maps';
import Constants from "expo-constants";
import React, { useEffect, useRef, useState } from 'react';
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
import MapboxSearchInput from '../../components/MapBoxSearchInput';

const { height } = Dimensions.get('window');

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

interface DestinationLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface PlanRideScreenProps {
  setScreen: (screen: string, navigationData: any) => void;
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
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][] | null>(null);
  const [destinationSearchText, setDestinationSearchText] = useState('');

  const cameraRef = useRef<Mapbox.Camera>(null);
  const mapRef = useRef<Mapbox.MapView>(null);

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

  // Fetch route from Mapbox when destination changes
  const fetchRoute = async () => {
    if (!locationData || !destinationLocation) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${locationData.longitude},${locationData.latitude};${destinationLocation.longitude},${destinationLocation.latitude}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates as [number, number][];
        setRouteCoordinates(coordinates);

        console.log(`Distance: ${route.distance / 1000} km`);
        console.log(`Duration: ${route.duration / 60} min`);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  // Fit map to show both markers when destination is selected
  useEffect(() => {
    if (locationData && destinationLocation) {
      fetchRoute();

      if (cameraRef.current) {
        setTimeout(() => {
          cameraRef.current?.fitBounds(
            [Math.min(locationData.longitude, destinationLocation.longitude), Math.min(locationData.latitude, destinationLocation.latitude)],
            [Math.max(locationData.longitude, destinationLocation.longitude), Math.max(locationData.latitude, destinationLocation.latitude)],
            [50, 100, 300, 50], // padding: [top, right, bottom, left]
            1000
          );
        }, 500);
      }
    } else if (locationData && cameraRef.current) {
      // Just center on pickup location
      setTimeout(() => {
        cameraRef.current?.setCamera({
          centerCoordinate: [locationData.longitude, locationData.latitude],
          zoomLevel: 14,
          animationDuration: 1000,
        });
      }, 500);
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

  const handleConfirmRide = () => {
    if (!destinationLocation || !locationData) {
      Alert.alert('Error', 'Select both pickup and destination locations');
      return;
    }

    const bookingData = prepareBookingData();

    const navigationData = {
      pickupLocation: {
        address: currentLocation,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      },
      destination: {
        name: destinationLocation.name,
        address: destinationLocation.address,
        latitude: destinationLocation.latitude,
        longitude: destinationLocation.longitude,
      },
      backendRequest: bookingData,
    };

    setScreen('bookingScreen', navigationData);
  };

  const handleSelectDestination = (location: DestinationLocation) => {
    setDestinationLocation(location);
    setDestinationSearchText(location.address);
    setShowSearchModal(false);
    console.log('Destination selected:', location);
  };

  const handleSelectSuggestedLocation = (location: any) => {
    setDestinationLocation(location);
    setDestinationSearchText(location.address);
    console.log('Destination selected:', location);
  };

  const handleMapboxSearchSelect = (result: any) => {
    const [lng, lat] = result.center;

    const newLocation: DestinationLocation = {
      name: result.text || result.place_name,
      address: result.place_name,
      latitude: lat,
      longitude: lng,
    };

    handleSelectDestination(newLocation);
  };

  const handleBackPress = () => {
    goBack();
  };

  const shortenAddress = (address: string, maxLength: number = 35) => {
    if (address.length <= maxLength) return address;
    return address.substring(0, maxLength) + '...';
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
          <MapboxSearchInput
            value={destinationSearchText}
            onChangeText={setDestinationSearchText}
            onSelectLocation={handleMapboxSearchSelect}
            onUseCurrentLocation={() => {
              if (locationData) {
                setDestinationLocation({
                  name: 'Current Location',
                  address: locationData.address,
                  latitude: locationData.latitude,
                  longitude: locationData.longitude,
                });
                setShowSearchModal(false);
              }
            }}
            isGettingLocation={false}
            placeholder="Search for a destination"
            countryCode="ng"
            proximity={locationData ? [locationData.longitude, locationData.latitude] : undefined}
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
      {/* Mapbox Map View */}
      <View style={styles.mapContainer}>
        {locationData ? (
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
              zoomLevel={14}
              centerCoordinate={[locationData.longitude, locationData.latitude]}
              animationMode="flyTo"
              animationDuration={1000}
            />

            {/* Pickup Location Marker */}
            <Mapbox.PointAnnotation
              id="pickup-marker"
              coordinate={[locationData.longitude, locationData.latitude]}
              title="Pick-up Location"
              snippet={locationData.address}
            >
              <View style={styles.pickupMarkerContainer}>
                <Image
                  source={require('../../assets/images/target.png')}
                  style={{ width: 30, height: 30 }}
                  resizeMode="contain"
                />
              </View>
            </Mapbox.PointAnnotation>

            {/* Destination Marker */}
            {destinationLocation && (
              <Mapbox.PointAnnotation
                id="destination-marker"
                coordinate={[destinationLocation.longitude, destinationLocation.latitude]}
                title="Drop-off Location"
                snippet={destinationLocation.address}
              >
                <View style={styles.markerContainer}>
                  <Image
                    source={require('../../assets/images/send.png')}
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                </View>
              </Mapbox.PointAnnotation>
            )}

            {/* Route Line */}
            {routeCoordinates && (
              <Mapbox.ShapeSource
                id="routeSource"
                shape={{
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: routeCoordinates,
                  },
                }}
              >
                <Mapbox.LineLayer
                  id="routeLine"
                  style={{
                    lineColor: '#ffbc07',
                    lineWidth: 4,
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                />
              </Mapbox.ShapeSource>
            )}
          </Mapbox.MapView>
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
                </View>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>Where to?</Text>
                  <TouchableOpacity onPress={() => setShowSearchModal(true)}>
                    <Text style={[styles.inputValue, destinationLocation ? styles.selectedDestination : styles.placeholderText]}>
                      {destinationLocation ? '🏁 ' + shortenAddress(destinationLocation.address, 40) : 'Select your destination'}
                    </Text>
                  </TouchableOpacity>
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
                    Lat: {loc.latitude.toFixed(4)}, Long: {loc.longitude.toFixed(4)}
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
                backgroundColor: destinationLocation && locationData ? '#f0d46d' : '#555',
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
    flex: 1,
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