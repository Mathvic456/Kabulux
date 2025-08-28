import { Entypo, Feather, FontAwesome } from '@expo/vector-icons';
import React, { useState } from "react";
import {
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Overlay Component for Photo Upload
const UploadPhotoOverlay = ({ isVisible, onClose, onNext }) => {
  if (!isVisible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.overlayContainer}>
        <View style={styles.overlayContent}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Entypo name="cross" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.overlayTitle}>Upload A Photo</Text>
          <Text style={styles.overlaySubtitle}>upload a profile photo for verification</Text>
          <View style={styles.uploadIconContainer}>
            <Feather name="image" size={80} color="#FFD700" />
          </View>
          <TouchableOpacity style={styles.uploadButton} onPress={onNext}>
            <Text style={styles.uploadButtonText}>Next</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={onClose}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// New Overlay Component for Additional Information
const AdditionalInfoOverlay = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  const notificationOptions = ['Push Notifications', 'Email', 'SMS'];
  const paymentOptions = ['Credit Card', 'Bank Transfer', 'Mobile Wallet'];

  const [notificationPreference, setNotificationPreference] = useState("Notification Preference");
  const [preferablePayment, setPreferablePayment] = useState("Preferable Payment");

  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  // Custom Dropdown Component
  const Dropdown = ({ options, onSelect, value, placeholder, isVisible, onClose }) => {
    return (
      <Modal transparent={true} visible={isVisible} onRequestClose={onClose} animationType="fade">
        <TouchableOpacity style={styles.dropdownOverlay} onPress={onClose}>
          <View style={styles.dropdownModal}>
            <ScrollView>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownOption}
                  onPress={() => onSelect(option)}
                >
                  <Text style={styles.dropdownText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.overlayContainer}>
        <View style={styles.overlayContent}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Entypo name="cross" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.overlayTitle}>Additional Information</Text>
          <Text style={styles.overlaySubtitle}>Fill the details to get more information about you</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Address Book"
              placeholderTextColor="#aaa"
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Emergency Contact Info"
              placeholderTextColor="#aaa"
            />
          </View>

          {/* Notification Preference Dropdown Button */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowNotificationDropdown(true)}
          >
            <Text style={styles.dropdownButtonText}>{notificationPreference}</Text>
            <Entypo name="chevron-down" size={16} color="#aaa" />
          </TouchableOpacity>
          <Dropdown
            options={notificationOptions}
            onSelect={(value) => {
              setNotificationPreference(value);
              setShowNotificationDropdown(false);
            }}
            isVisible={showNotificationDropdown}
            onClose={() => setShowNotificationDropdown(false)}
          />

          {/* Preferable Payment Dropdown Button */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowPaymentDropdown(true)}
          >
            <Text style={styles.dropdownButtonText}>{preferablePayment}</Text>
            <Entypo name="chevron-down" size={16} color="#aaa" />
          </TouchableOpacity>
          <Dropdown
            options={paymentOptions}
            onSelect={(value) => {
              setPreferablePayment(value);
              setShowPaymentDropdown(false);
            }}
            isVisible={showPaymentDropdown}
            onClose={() => setShowPaymentDropdown(false)}
          />

          <TouchableOpacity style={styles.biometricsButton}>
            <Entypo name="fingerprint" size={24} color="#FEB914" />
            <Text style={styles.biometricsText}>Enable Biometrics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Next</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={onClose}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


export default function HomeScreen() {
  const [showPhotoOverlay, setShowPhotoOverlay] = useState(true);
  const [showAdditionalInfoOverlay, setShowAdditionalInfoOverlay] = useState(false);

  const handleNextFromPhoto = () => {
    setShowPhotoOverlay(false);
    setShowAdditionalInfoOverlay(true);
  };
  
  const banners = [
    {
      id: "1",
      text: "Save up to 30% on Kablux\nand ride with style",
      image: require("../../assets/images/person.png"),
    },
    {
      id: "2",
      text: "Get premium rides\nat discounted prices",
      image: require("../../assets/images/person.png"),
    },
    {
      id: "3",
      text: "Courier packages\nfaster & safer",
      image: require("../../assets/images/person.png"),
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Main Screen Content */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/logo.png")}
          resizeMode='cover'
          style={{ width: 100, height: 40 }}
        />
      </View>

      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={20} color="white" />
        <TextInput
          placeholder="Where to?"
          placeholderTextColor="#aaa"
          style={styles.searchInput}
        />
        <TouchableOpacity style={styles.laterBtn}>
          <Entypo name="shop" size={20} color="white" />
          <Text style={styles.laterText}>Later</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Suggestion</Text>
      <View style={styles.suggestionRow}>
        <TouchableOpacity style={styles.suggestionCard}>
          <Image
            source={require("../../assets/images/car.png")}
            style={styles.suggestionIcon}
          />
          <Text style={styles.suggestionText}>Ride</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.suggestionCard}>
          <Image
            source={require("../../assets/images/courier.png")}
            style={styles.suggestionIcon}
          />
          <Text style={styles.suggestionText}>Courier</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.suggestionCard}>
          <Image
            source={require("../../assets/images/reserve.png")}
            style={styles.suggestionIcon}
          />
          <Text style={styles.suggestionText}>Reserve</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={banners}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.banner}>
            <View>
              <Text style={styles.bannerText}>{item.text}</Text>
              <TouchableOpacity style={styles.bannerBtn}>
                <Text style={styles.bannerBtnText}>Try our Premium Package</Text>
              </TouchableOpacity>
            </View>
            <Image source={item.image} style={styles.bannerImage} />
          </View>
        )}
        contentContainerStyle={{ paddingRight: 20 }}
      />

      <View style={styles.recentRideHeader}>
        <Text style={styles.sectionTitle}>Recent Ride</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rideCard}>
        <Image
          source={require("../../assets/images/car1.png")}
          style={styles.rideImage}
          resizeMode="contain"
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.price}>₦26,000</Text>
          <Text style={styles.subText}>SUV CAR</Text>
          <Text style={styles.subText}>4 seater</Text>
          <Text style={styles.subText}>Available in your area</Text>
        </View>
        <View style={styles.ratingContainer}>
          <FontAwesome name="star" size={16} color="#FEB914" />
          <Text style={styles.rating}>3.2</Text>
        </View>
      </View>
      <View style={styles.rideCard}>
        <Image
          source={require("../../assets/images/car2.png")}
          style={styles.rideImage}
          resizeMode="contain"
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.price}>₦26,000</Text>
          <Text style={styles.subText}>SUV CAR - 4 seater</Text>
          <Text style={styles.subText}>5.3km from you</Text>
        </View>
        <Text style={styles.rating}>⭐ 3.2</Text>
      </View>

      {/* 🚀 Ride Analytics Section */}
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>Check your ride Analytics</Text>
        <TouchableOpacity style={styles.analyticsButton}>
          <Text style={styles.analyticsButtonText}>View your Ride Summary</Text>
        </TouchableOpacity>
      </View>

      {/* ⭐ Special Service Section */}
      <Text style={styles.sectionTitle}>Special Service</Text>
      <View style={styles.specialServiceRow}>
        <TouchableOpacity style={styles.specialCard}>
          <Image
            source={require("../../assets/images/car3.png")}
            style={styles.specialImage}
          />
          <Text style={styles.specialTitle}>Our Special AI Security</Text>
          <Text style={styles.specialSub}>Checkout our Special AI</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.specialCard}>
          <Image
            source={require("../../assets/images/car4.png")}
            style={styles.specialImage}
          />
          <Text style={styles.specialTitle}>Share your Ride</Text>
          <Text style={styles.specialSub}>See how to share ride</Text>
        </TouchableOpacity>
      </View>

      {/* Conditionally render the overlays */}
      <UploadPhotoOverlay
        isVisible={showPhotoOverlay}
        onClose={() => setShowPhotoOverlay(false)}
        onNext={handleNextFromPhoto}
      />

      <AdditionalInfoOverlay
        isVisible={showAdditionalInfoOverlay}
        onClose={() => setShowAdditionalInfoOverlay(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  logoContainer: {
    height: 50,
    width: 90,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 20,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: "#999",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#fff",
    fontSize: 16,
  },
  laterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "black",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 7,
  },
  laterText: {
    color: "#fff",
    fontSize: 14,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  suggestionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  suggestionCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    width: "30%",
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
    marginBottom: 6,
  },
  suggestionText: {
    color: "#fff",
  },
  banner: {
    flexDirection: "row",
    backgroundColor: "#FEB914",
    borderRadius: 12,
    padding: 15,
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 12,
    width: 280,
  },
  bannerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  bannerBtn: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  bannerBtnText: {
    color: "#fff",
    fontSize: 12,
  },
  bannerImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginLeft: 10,
  },
  recentRideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },
  seeAll: {
    color: "#FEB914",
    fontSize: 14,
  },
  rideCard: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fff",
  },
  rideImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
    resizeMode: "contain",
  },
  price: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subText: {
    color: "#aaa",
    fontSize: 13,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  rating: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 4,
  },

  // 🚀 Analytics styles
  analyticsCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  analyticsTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  analyticsButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  analyticsButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },

  // ⭐ Special Service
  specialServiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  specialCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 15,
    padding: 10,
    width: "48%",
  },
  specialImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginBottom: 10,
  },
  specialTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 5,
  },
  specialSub: {
    color: "#aaa",
    fontSize: 12,
  },

  // Overlay Styles
  overlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  overlayContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  overlayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  overlaySubtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 20,
    textAlign: 'center',
  },
  uploadIconContainer: {
    backgroundColor: '#2C2C2C',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
   
