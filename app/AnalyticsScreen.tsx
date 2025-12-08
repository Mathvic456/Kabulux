import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import Car from '../assets/images/car1.png';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen({ goBack, next }: { goBack: () => void; next?: () => void}) {

    
  const handleProceed = () => {
    next();
  }

  const handleBack = () => {
    if (goBack) {
      goBack();
    }
  };

  // const handle

  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('July');
  const [selectedLocation, setSelectedLocation] = useState('Lagos');
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [currentAnalytics, setCurrentAnalytics] = useState(null);

  // Sample data for different months
  const analyticsData = {
    January: {
      loyaltyPoints: 1250,
      rideKm: 342,
      rideValue: 24500,
    },
    February: {
      loyaltyPoints: 980,
      rideKm: 278,
      rideValue: 19800,
    },
    March: {
      loyaltyPoints: 1560,
      rideKm: 412,
      rideValue: 31200,
    },
    April: {
      loyaltyPoints: 2100,
      rideKm: 523,
      rideValue: 42500,
    },
    May: {
      loyaltyPoints: 1870,
      rideKm: 467,
      rideValue: 37800,
    },
    June: {
      loyaltyPoints: 2340,
      rideKm: 589,
      rideValue: 48700,
    },
    July: {
      loyaltyPoints: 2750,
      rideKm: 642,
      rideValue: 53200,
    },
    August: {
      loyaltyPoints: 1980,
      rideKm: 487,
      rideValue: 39600,
    },
    September: {
      loyaltyPoints: 1630,
      rideKm: 423,
      rideValue: 34100,
    },
    October: {
      loyaltyPoints: 2250,
      rideKm: 556,
      rideValue: 45800,
    },
    November: {
      loyaltyPoints: 1890,
      rideKm: 498,
      rideValue: 40200,
    },
    December: {
      loyaltyPoints: 3120,
      rideKm: 721,
      rideValue: 62500,
    },
  };

  const months = Object.keys(analyticsData);
  const locations = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano'];

  const handleAnalyticsPress = (type) => {
    setCurrentAnalytics({
      type,
      data: analyticsData[selectedMonth]
    });
    setShowAnalyticsModal(true);
  };

  const getAnalyticsValue = (type) => {
    const data = analyticsData[selectedMonth];
    switch(type) {
      case 'loyalty': return data.loyaltyPoints;
      case 'rideKm': return `${data.rideKm} km`;
      case 'rideValue': return `₦${data.rideValue.toLocaleString()}`;
      default: return '';
    }
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
            <Text style={styles.modalTitle}>Select Month</Text>
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
                style={[
                  styles.modalOption,
                  selectedLocation === location && styles.modalOptionSelected
                ]}
                onPress={() => {
                  setSelectedLocation(location);
                  setShowLocationModal(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  selectedLocation === location && styles.modalOptionTextSelected
                ]}>
                  {location}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderAnalyticsModal = () => (
    <Modal
      visible={showAnalyticsModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAnalyticsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.analyticsModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {currentAnalytics?.type === 'loyalty' && 'Loyalty Points Details'}
              {currentAnalytics?.type === 'rideKm' && 'Ride Distance Details'}
              {currentAnalytics?.type === 'rideValue' && 'Ride Value Details'}
            </Text>
            <TouchableOpacity onPress={() => setShowAnalyticsModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.analyticsDetails}>
            <Text style={styles.detailMonth}>{selectedMonth} Analytics</Text>
            <Text style={styles.detailLocation}>Location: {selectedLocation}</Text>
            
            <View style={styles.detailCard}>
              <Text style={styles.detailValue}>
                {currentAnalytics?.type === 'loyalty' && getAnalyticsValue('loyalty')}
                {currentAnalytics?.type === 'rideKm' && getAnalyticsValue('rideKm')}
                {currentAnalytics?.type === 'rideValue' && getAnalyticsValue('rideValue')}
              </Text>
              <Text style={styles.detailLabel}>
                {currentAnalytics?.type === 'loyalty' && 'Loyalty Points'}
                {currentAnalytics?.type === 'rideKm' && 'Distance Traveled'}
                {currentAnalytics?.type === 'rideValue' && 'Total Value'}
              </Text>
            </View>
            
            <View style={styles.comparisonSection}>
              <Text style={styles.comparisonTitle}>Monthly Comparison</Text>
              {months.map((month, index) => (
                <View key={month} style={styles.comparisonRow}>
                  <Text style={styles.comparisonMonth}>{month}</Text>
                  <Text style={styles.comparisonValue}>
                    {currentAnalytics?.type === 'loyalty' && analyticsData[month].loyaltyPoints}
                    {currentAnalytics?.type === 'rideKm' && `${analyticsData[month].rideKm} km`}
                    {currentAnalytics?.type === 'rideValue' && `₦${analyticsData[month].rideValue.toLocaleString()}`}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
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
            <Text style={[styles.filterText, selectedFilter === 'All' && styles.filterTextSelected]}>
              All
            </Text>
            <Text style={[styles.arrow, selectedFilter === 'All' && styles.arrowSelected]}>▼</Text>
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

        {/* Analytics Grid */}
        <View style={styles.analyticsGrid}>
          <TouchableOpacity 
            style={[styles.analyticsCard, styles.largeCard]}
            onPress={handleProceed  }
          >
            <Text style={styles.icon}>🏇</Text>
            <Text style={[styles.cardTitle, { color: '#000' }]}>Loyalty Point & Reward</Text>
            <Text style={[styles.cardValue, { color: '#000' }]}>{getAnalyticsValue('loyalty')}</Text>
            <Text style={[styles.topRightIcon, { color: '#000' }]}>↗</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.analyticsCard, { backgroundColor: '#721c24' }]}
            onPress={() => handleAnalyticsPress('rideKm')}
          >
            <Text style={styles.icon}>🚗</Text>
            <Text style={styles.cardTitle}>Ride in Km</Text>
            <Text style={styles.cardValue}>{getAnalyticsValue('rideKm')}</Text>
            <Text style={styles.topRightIcon}>↗</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.analyticsCard, { backgroundColor: '#3b5998' }]}
            onPress={() => handleAnalyticsPress('rideValue')}
          >
            <Text style={styles.icon}>💰</Text>
            <Text style={styles.cardTitle}>Ride in Value</Text>
            <Text style={styles.cardValue}>{getAnalyticsValue('rideValue')}</Text>
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

        {/* Special Service Section */}
        <Text style={styles.sectionTitle}>Special Service</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialServiceScroll}>
          <View style={styles.specialServiceCard}>
            <Image
              source={Car}
              style={styles.specialServiceImage}
            />
          </View>
          <View style={styles.specialServiceCard}>
            <Image
              source={Car}
              style={styles.specialServiceImage}
            />
          </View>
          <View style={styles.specialServiceCard}>
            <Image
              source={Car}
              style={styles.specialServiceImage}
            />
          </View>
          <View style={styles.specialServiceCard}>
            <Image
              source={Car}
              style={styles.specialServiceImage}
              resizeMethod='cover'
            />
          </View>
        </ScrollView>
      </ScrollView>

      {/* Modals */}
      {renderMonthModal()}
      {renderLocationModal()}
      {renderAnalyticsModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    padding: 20,
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
  specialServiceScroll: {
    flexDirection: 'row',
    paddingBottom: 10,
  },
  specialServiceCard: {
    width: 150,
    height: 100,
    borderRadius: 15,
    overflow: 'hidden',
    marginRight: 10,
    borderWidth: 0.5,
    borderColor: 'white',
  },
  specialServiceImage: {
    width: '100%',
    height: '100%',
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
  detailLocation: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 20,
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
  comparisonSection: {
    marginTop: 10,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  comparisonMonth: {
    color: '#ccc',
    fontSize: 14,
  },
  comparisonValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});