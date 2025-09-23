import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Import your existing axios instance
import { api } from '../../services/api';

const { height } = Dimensions.get('window');

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  /**
   * Prepares the booking data in the exact format expected by the backend
   * Backend expects: {
   *   "pickup_lat": "6.4541",
   *   "pickup_lng": "3.3947",
   *   "dropoff_lat": "6.605874",
   *   "dropoff_lng": "3.349149"
   * }
   */
  const prepareBookingData = () => {
    if (!destinationLocation) {
      throw new Error('Destination location is required');
    }

    if (!locationData) {
      throw new Error('Current location data is required');
    }

    // Format according to backend specification
    return {
      pickup_lat: locationData.latitude.toString(),
      pickup_lng: locationData.longitude.toString(),
      dropoff_lat: destinationLocation.latitude.toString(),
      dropoff_lng: destinationLocation.longitude.toString()
    };
  };

  /**
   * Enhanced handleConfirmRide that gets ride estimate from backend
   * Uses the correct endpoint: /rides/requests/estimate
   */
  const handleConfirmRide = async () => {
    console.log('🚗 handleConfirmRide called - Getting ride estimate');
    
    // Validate destination selection
    if (!destinationLocation) {
      console.log('❌ No destination selected');
      Alert.alert('Select Destination', 'Please select a destination first');
      return;
    }

    // Validate current location data
    if (!locationData) {
      console.log('❌ No location data available');
      Alert.alert('Location Error', 'Unable to access your current location. Please try again.');
      return;
    }

    // Prevent multiple simultaneous submissions
    if (isSubmitting) {
      console.log('❌ Already submitting, ignoring press');
      return;
    }

    console.log('✅ Starting estimate request process');
    setIsSubmitting(true);

    try {
      // Prepare the booking data
      const bookingData = prepareBookingData();
      console.log('📦 Prepared estimate request data:', bookingData);

      // Show immediate feedback
      Alert.alert('Getting Ride Estimate', 'Please wait while we calculate your ride...', [], {
        cancelable: false
      });

      // Use the CORRECT endpoint for getting ride estimates
      console.log('🌐 Sending estimate request to /rides/requests/estimate...');
      const response = await api.post('/rides/requests/estimate', bookingData);
      
      console.log('✅ Estimate response received:', response.data);

      // Create navigation data with the estimate information
      const navigationData = {
        // Estimate data from backend
        estimateData: response.data,
        serverResponse: response.data,
        submittedAt: new Date().toISOString(),
        
        // Original location data for UI display
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
        
        // Backend request data for reference
        backendRequest: bookingData,
        
        // Include estimate-specific data for the booking screen
        estimatedPrice: response.data.price || response.data.estimated_cost,
        estimatedDuration: response.data.duration || response.data.estimated_time,
        distance: response.data.distance
      };

      console.log('➡️ Navigating to booking screen with estimate data');
      setScreen('bookingScreen', navigationData);
      
    } catch (error: any) {
      console.error('❌ Estimate API error:', error);
      
      let errorMessage = 'Failed to get ride estimate. Please try again.';
      
      if (error.response) {
        console.log('📡 Server responded with error:', error.response.status);
        console.log('📡 Error details:', error.response.data);
        
        // Handle specific error cases for estimate endpoint
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
        console.log('📡 No response received from server');
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else {
        console.log('⚡ Other error:', error.message);
        errorMessage = `Estimate request failed: ${error.message}`;
      }
      
      Alert.alert('Estimate Failed', errorMessage);
    } finally {
      console.log('🏁 Estimate request process completed');
      setIsSubmitting(false);
    }
  };

  // Add a simple test function to check if button is working
  const testButtonFunction = () => {
    console.log('=== BUTTON TEST ===');
    console.log('Button pressed successfully!');
    console.log('destinationLocation:', destinationLocation);
    console.log('locationData:', locationData);
    console.log('isSubmitting:', isSubmitting);
    console.log('===================');
    
    Alert.alert('Button Test', 'Button is working! Check console for details.');
  };

  const searchDestinations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await Location.geocodeAsync(query);
      
      const formattedResults = results.map((result, index) => ({
        id: index,
        name: query,
        address: formatAddress(result),
        latitude: result.latitude,
        longitude: result.longitude
      }));

      const matchingSuggestions = suggestedLocations.filter(loc =>
        loc.name.toLowerCase().includes(query.toLowerCase()) ||
        loc.address.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults([...formattedResults, ...matchingSuggestions]);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search locations');
    } finally {
      setIsSearching(false);
    }
  };

  const formatAddress = (address: any): string => {
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.region) parts.push(address.region);
    if (address.country) parts.push(address.country);
    return parts.join(', ');
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    searchDestinations(text);
  };

  const handleSelectDestination = (location: any) => {
    setDestinationLocation(location);
    setShowSearchModal(false);
    setSearchQuery('');
  };

  const handleSelectSuggestedLocation = (location: any) => {
    setDestinationLocation(location);
    console.log('Destination selected:', location);
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

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#aaa" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a place or address"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
        </View>

        {isSearching ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.searchResultItem}
                onPress={() => handleSelectDestination(item)}
              >
                <FontAwesome5 
                  name="map-marker-alt" 
                  size={18} 
                  color="#f0d46d" 
                />
                <View style={styles.searchResultText}>
                  <Text style={styles.searchResultName}>{item.name}</Text>
                  <Text style={styles.searchResultAddress}>{item.address}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              searchQuery ? (
                <Text style={styles.noResults}>No results found for "{searchQuery}"</Text>
              ) : null
            }
          />
        )}
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        {locationData ? (
          <View style={styles.mapContent}>
            <Text style={styles.mapText}>
              {destinationLocation ? '📍 Destination Set' : '📍 Your Location'}
            </Text>
            <Text style={styles.mapSubtext}>
              {destinationLocation 
                ? shortenAddress(destinationLocation.address, 30)
                : shortenAddress(locationData.address, 30)
              }
            </Text>
          </View>
        ) : (
          <Text style={styles.mapText}>[ Map Placeholder ]</Text>
        )}
      </View>

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconContainer} onPress={handleBackPress}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
          <Feather name="navigation" size={24} color="#f0d46d" />
        </TouchableOpacity>
      </View>

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
                      {destinationLocation ? '📍 ' + shortenAddress(destinationLocation.address, 40) : 'Select your destination'}
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

          {/* Main Confirm Ride Button */}
          <TouchableOpacity 
            style={[
              styles.confirmButton,
              { 
                backgroundColor: destinationLocation && locationData && !isSubmitting ? '#f0d46d' : '#555',
                opacity: (!destinationLocation || !locationData || isSubmitting) ? 0.7 : 1
              }
            ]}
            onPress={handleConfirmRide}
            disabled={!destinationLocation || !locationData || isSubmitting}
          >
            {isSubmitting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.confirmButtonText}>Getting Estimate...</Text>
              </View>
            ) : (
              <Text style={styles.confirmButtonText}>
                Get Ride Estimate {destinationLocation ? `to ${shortenAddress(destinationLocation.address, 20)}` : ''}
              </Text>
            )}
          </TouchableOpacity>

          {/* Debug Button - Uncomment to test */}
          <TouchableOpacity 
            style={[styles.confirmButton, { backgroundColor: 'red', marginTop: 10 }]}
            onPress={testButtonFunction}
          >
            <Text style={styles.confirmButtonText}>DEBUG BUTTON</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>

      <SearchModal />
    </View>
  );
}

// Your styles remain exactly the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f0d46d',
    marginBottom: 5,
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 50,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.75,
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
    backgroundColor: '#f0d46d',
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
    color: '#f0d46d',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2b2b2b',
    margin: 20,
    padding: 15,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  searchResultText: {
    marginLeft: 15,
    flex: 1,
  },
  searchResultName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  searchResultAddress: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
  },
  loadingText: {
    color: '#aaa',
  },
  noResults: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});