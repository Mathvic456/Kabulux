import { Feather, FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { height } = Dimensions.get('window');

export default function PlanRideScreen({ setScreen }) {
  const [isPanelUp, setIsPanelUp] = useState(false);
  const [slideAnim] = useState(new Animated.Value(height));
  const [destinationLocation, setDestinationLocation] = useState('');

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
    // Animate the bottom panel sliding up after a short delay
    const timer = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: 0, // Slide up to bottom of screen
        duration: 500,
        useNativeDriver: true,
      }).start(() => setIsPanelUp(true));
    }, 500);

    return () => clearTimeout(timer);
  }, []);
  
  const handleSelectLocation = (location) => {
    setDestinationLocation(location.name);
    
    // Navigate to BookingScreen after a short delay to show selection feedback
    setTimeout(() => {
      // Pass the selected location data to the BookingScreen
      setScreen('bookingScreen', { 
        destination: location 
      });
    }, 300);
  };

  const handleBackPress = () => {
    // Navigate back to the previous screen
    setScreen('homeScreen'); // Replace with your actual previous screen name
  };

  return (
    <View style={styles.container}>
      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>[ Map Placeholder ]</Text>
      </View>

      {/* Top Bar Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconContainer} onPress={handleBackPress}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
          <Feather name="navigation" size={24} color="#f0d46d" />
        </TouchableOpacity>
      </View>

      {/* Sliding Bottom Overlay */}
      <Animated.View style={[styles.bottomPanel, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.panelHeader}>
          <TouchableOpacity style={styles.headerIconContainer} onPress={handleBackPress}>
            <Feather name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Plan your Ride</Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Location Inputs */}
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
                  <Text style={styles.inputValue}>Current Location</Text>
                </View>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>Where to?</Text>
                  <Text style={[styles.inputValue, destinationLocation ? styles.selectedDestination : {}]}>
                    {destinationLocation || 'Your destination'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Suggested Locations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested Locations</Text>
            {suggestedLocations.map((loc) => (
              <TouchableOpacity 
                key={loc.id} 
                style={[
                  styles.suggestionItem,
                  destinationLocation === loc.name && styles.selectedSuggestion
                ]} 
                onPress={() => handleSelectLocation(loc)}
              >
                <FontAwesome5 
                  name="map-marker-alt" 
                  size={18} 
                  color={destinationLocation === loc.name ? '#f0d46d' : '#aaa'} 
                />
                <View style={styles.suggestionTextContainer}>
                  <Text style={[
                    styles.suggestionName,
                    destinationLocation === loc.name && styles.selectedSuggestionText
                  ]}>
                    {loc.name}
                  </Text>
                  <Text style={styles.suggestionAddress}>{loc.address}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Other Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>More Options</Text>
            <TouchableOpacity style={styles.actionItem}>
              <Feather name="globe" size={20} color="#aaa" />
              <Text style={styles.actionText}>Search in a different city</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Feather name="map-pin" size={20} color="#aaa" />
              <Text style={styles.actionText}>Set location on map</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Feather name="bookmark" size={20} color="#aaa" />
              <Text style={styles.actionText}>Saved places</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

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
  mapText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#aaa',
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
    height: height * 0.75, // Increased height for better spacing
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
    paddingBottom: 30, // Add padding at the bottom for better spacing
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
  },
  locationInputCard: {
    backgroundColor: '#2b2b2b',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Changed to flex-start for better alignment
  },
  inputContainer: {
    flex: 1,
  },
  locationPinLine: {
    alignItems: 'center',
    marginRight: 15,
    marginTop: 5, // Added margin for better vertical alignment
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
    marginBottom: 15, // Increased margin for better spacing
  },
  inputLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 4, // Added margin for better spacing
  },
  inputValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  selectedDestination: {
    color: '#f0d46d',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20, // Added margin between sections
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
    marginHorizontal: -10, // Compensate for horizontal padding
  },
  suggestionTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    marginBottom: 4, // Added margin for better spacing
  },
  selectedSuggestionText: {
    color: '#f0d46d',
    fontWeight: '600',
  },
  suggestionAddress: {
    fontSize: 12,
    color: '#aaa',
    lineHeight: 16, // Added line height for better readability
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15, // Increased padding for better touch targets
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  actionText: {
    fontSize: 16,
    color: '#aaa',
    marginLeft: 15,
  },
  bottomSpacing: {
    height: 20, // Added bottom spacing to ensure content doesn't get cut off
  },
});