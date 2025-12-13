import { useRiderAnalytics } from '@/services/riderAnalytics.service';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Props {
   goBack: () => void; 
   next?: () => void; 
   setScreen: (screen) => void 
}

export default function AnalyticsScreen({ goBack, next, setScreen }: Props) {

  const { data: riderAnalyticsData, isLoading, isError, error } = useRiderAnalytics();

  const totalPoints = riderAnalyticsData?.total_points ?? 0;
  const totalDistance = riderAnalyticsData?.total_distance_km ?? 0;
  const completedRides = riderAnalyticsData?.completed_rides ?? 0;

  useEffect(() => {
    if (riderAnalyticsData) {
      console.log("🎯 [AnalyticsScreen] Rider Analytics Data:", riderAnalyticsData);
    }
  }, [riderAnalyticsData]);

  const handleProceed = () => {
    next?.();
  }

  const handleBack = () => {
    goBack?.();
  };

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const locations = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano']; //Imagining this to be consisted of states the rider has been in?

  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [selectedLocation, setSelectedLocation] = useState('Lagos');
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [currentAnalytics, setCurrentAnalytics] = useState(null);

  const handleAnalyticsPress = (type) => {
    setScreen(type);
  };

 
 const renderMonthModal = () => (
    <Modal
      visible={showMonthModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowMonthModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowMonthModal(false)}>
        <View style={styles.modalOverlay}>
          
          <View style={styles.modalContent}>
            {/* Title stays fixed at the top */}
            <Text style={styles.modalTitle}>Select Month</Text>

            {/* ScrollView wraps ONLY the list items */}
            <ScrollView showsVerticalScrollIndicator={true}> 
              {months.map((month) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.modalOption, 
                    selectedMonth === month && styles.modalOptionSelected
                  ]}
                  onPress={() => { 
                    setSelectedMonth(month); 
                    setShowMonthModal(false); 
                  }}
                >
                  <Text style={[
                    styles.modalOptionText, 
                    selectedMonth === month && styles.modalOptionTextSelected
                  ]}>
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderLocationModal = () => (
    <Modal
      visible={showLocationModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowLocationModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowLocationModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Location</Text>
            {locations.map((location) => (
              <TouchableOpacity
                key={location}
                style={[styles.modalOption, selectedLocation === location && styles.modalOptionSelected]}
                onPress={() => { setSelectedLocation(location); setShowLocationModal(false); }}
              >
                <Text style={[styles.modalOptionText, selectedLocation === location && styles.modalOptionTextSelected]}>
                  {location}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics Summary</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="search..."
            placeholderTextColor="#777"
          />
        </View>

        {/* Filter Row */}
        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={[styles.filterDropdown, selectedFilter === 'All' && styles.filterSelected]}
            onPress={() => setSelectedFilter('All')}
          >
            <Text style={[styles.filterText, selectedFilter === 'All' && styles.filterTextSelected]}>All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterDropdown, styles.monthDropdown]}
            onPress={() => setShowMonthModal(true)}
          >
            <Text style={styles.filterText}>{selectedMonth}</Text>
            <Text style={styles.arrow}>▼</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterDropdown, styles.locationDropdown]}
            onPress={() => setShowLocationModal(true)}
          >
            <Text style={styles.filterText}>{selectedLocation}</Text>
            <Text style={styles.arrow}>▼</Text>
          </TouchableOpacity>
        </View>

     
        <View style={styles.analyticsGrid}>
          
          {/* Card 1: Loyalty Points */}
          <TouchableOpacity 
            style={[styles.analyticsCard, styles.largeCard]}
            onPress={() => handleAnalyticsPress('loyalty')}
          >
            <Text style={styles.icon}>🏇</Text>
            <Text style={[styles.cardTitle, { color: '#000' }]}>Loyalty Points & Rewards</Text>
            {/* Display Real Points */}
            <Text style={[styles.cardValue, { color: '#000' }]}>{totalPoints}</Text>
            <Text style={[styles.topRightIcon, { color: '#000' }]}>↗</Text>
          </TouchableOpacity>
          
          {/* Card 2: Ride in KM */}
          <TouchableOpacity 
            style={[styles.analyticsCard, { backgroundColor: '#721c24' }]}
            onPress={() => handleAnalyticsPress('rideKm')}
          >
            <Text style={styles.icon}>🚗</Text>
            <Text style={styles.cardTitle}>Ride in Km</Text>
            {/* Display Real Distance */}
            <Text style={styles.cardValue}>{totalDistance.toFixed(2)} km</Text>
            <Text style={styles.topRightIcon}>↗</Text>
          </TouchableOpacity>
          
          {/* Card 3: CHANGED to Completed Rides */}
          <TouchableOpacity 
            style={[styles.analyticsCard, { backgroundColor: '#3b5998' }]}
            onPress={() => handleAnalyticsPress('completedRides')}
          >
            {/* Changed Icon to checkmark or car */}
            <Text style={styles.icon}>✅</Text> 
            <Text style={styles.cardTitle}>Completed Rides</Text>
            {/* Display Real Completed Rides count */}
            <Text style={styles.cardValue}>{completedRides}</Text>
            <Text style={styles.topRightIcon}>↗</Text>
          </TouchableOpacity>
        </View>

        {/* Suggestion Section */}
        <Text style={styles.sectionTitle}>Suggestion</Text>
        <View style={styles.suggestionGrid}>
          <View style={styles.suggestionCard}>
            <Image
              source={{ uri: 'https://via.placeholder.com/40/000000/FFFFFF?text=🚗' }}
              style={styles.suggestionImage}
            />
            <Text style={styles.suggestionText}>Ride</Text>
          </View>
          <View style={styles.suggestionCard}>
            <Image
              source={{ uri: 'https://via.placeholder.com/40/000000/FFFFFF?text=📦' }}
              style={styles.suggestionImage}
            />
            <Text style={styles.suggestionText}>Courier</Text>
          </View>
          <View style={styles.suggestionCard}>
            <Image
              source={{ uri: 'https://via.placeholder.com/40/000000/FFFFFF?text=📅' }}
              style={styles.suggestionImage}
            />
            <Text style={styles.suggestionText}>Reserve</Text>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      {renderMonthModal()}
      {renderLocationModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backArrow: {
    fontSize: 28,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  searchBar: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 20,
  },
  searchIcon: {
    fontSize: 20,
    color: '#777',
  },
  searchInput: {
    color: '#fff',
    paddingHorizontal: 10,
    flex: 1,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  filterDropdown: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 10,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDropdown: {
      // additional styles if needed
  },
  locationDropdown: {
      // additional styles if needed
  },
  filterSelected: {
    backgroundColor: '#ffc107',
  },
  filterText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 5,
  },
  filterTextSelected: {
    color: '#000',
  },
  arrow: {
    fontSize: 10,
    color: '#fff',
  },
  arrowSelected: {
    color: '#000',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
  },
  analyticsCard: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 20,
    minHeight: 120,
    width: (width - 55) / 2,
  },
  largeCard: {
    backgroundColor: '#ffc107',
    height: 255,
  },
  icon: {
    fontSize: 30,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    color: '#fff',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 5,
    color: '#fff',
  },
  topRightIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    fontSize: 18,
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  suggestionGrid: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  suggestionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    flex: 1,
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionImage: {
    width: 40,
    height: 40,
    marginBottom: 10,
    borderRadius: 5,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  analyticsModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    fontSize: 24,
    color: '#fff',
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalOptionSelected: {
    backgroundColor: '#ffc107',
  },
  modalOptionText: {
    color: '#fff',
    fontSize: 16,
  },
  modalOptionTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
  analyticsDetails: {
    marginTop: 10,
  },
  detailMonth: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffc107',
    marginBottom: 5,
  },
  detailCard: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  detailValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffc107',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 16,
    color: '#ccc',
  },
});