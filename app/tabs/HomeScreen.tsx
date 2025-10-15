import { Entypo, Feather, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";


// Type definitions
type UploadPhotoOverlayProps = {
  isVisible: boolean;
  onClose: () => void;
  onNext: () => void;
};

type PhotoChoiceModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onImageSelected: (uri: string) => void;
};

type AdditionalInfoOverlayProps = {
  isVisible: boolean;
  onClose: () => void;
  profileImage?: string | null;
};

type LoginSuccessModalProps = {
  isVisible: boolean;
  onClose: () => void;
};

type HomeScreenProps = {
  setScreen: (screen: string) => void;
};

// Overlay Component for Photo Upload
const UploadPhotoOverlay = ({ isVisible, onClose, onNext }: UploadPhotoOverlayProps) => {
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
            <Feather name="image" size={80} color="#f7b731" />
          </View>
          <TouchableOpacity style={styles.uploadButton} onPress={onNext}>
            <Text style={styles.uploadButtonText}>Upload</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={onClose}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const PhotoChoiceModal = ({ isVisible, onClose, onImageSelected }: PhotoChoiceModalProps) => {
  if (!isVisible) return null;

  const pickImage = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    alert("Media library permission is required!");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (result.canceled) {
    console.log("User cancelled picking image");
    return;
  }

  if (result.assets[0]) {
    onImageSelected(result.assets[0].uri);
    onClose();
  }
}

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Permission to access camera is required!");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
        onClose();
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* Bottom sheet container */}
          <TouchableWithoutFeedback>
            <View style={styles.bottomSheet}>
              <Text style={styles.title}>Select Photo</Text>

              <TouchableOpacity
                style={styles.button}
                onPress={takePhoto}
              >
                <Text style={styles.buttonText}>Take a photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={pickImage}
              >
                <Text style={styles.buttonText}>Choose from gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={[styles.buttonText, { color: "#333" }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// New Overlay Component for Additional Information
const AdditionalInfoOverlay = ({ isVisible, onClose, profileImage }: AdditionalInfoOverlayProps) => {
  if (!isVisible) return null;

  const notificationOptions = ['Push Notifications', 'Email', 'SMS'];
  const paymentOptions = ['Credit Card', 'Bank Transfer', 'Mobile Wallet'];

  const [notificationPreference, setNotificationPreference] = useState<string>("Notification Preference");
  const [preferablePayment, setPreferablePayment] = useState<string>("Preferable Payment");
  const [addressBook, setAddressBook] = useState<string>("");
  const [emergencyContact, setEmergencyContact] = useState<string>("");

  const [showNotificationDropdown, setShowNotificationDropdown] = useState<boolean>(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState<boolean>(false);

  const handleNext = () => {
    // Validate and save the additional info
    console.log({
      addressBook,
      emergencyContact,
      notificationPreference,
      preferablePayment,
      profileImage,
    });
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.overlayContainer}>
        <ScrollView 
          style={styles.overlayScrollView}
          contentContainerStyle={styles.overlayScrollContent}
        >
          <View style={styles.overlayContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Entypo name="cross" size={28} color="#fff" />
            </TouchableOpacity>

            {profileImage && (
            <Image source={{ uri: profileImage }} style={styles.profilePreview} />
          )}

            <Text style={styles.overlayTitle}>Additional Information</Text>
            <Text style={styles.overlaySubtitle}>
              Fill the details to get more information about you
            </Text>

            {/* Address Book */}
            <TextInput
              style={styles.inputField}
              placeholder="Address Book"
              placeholderTextColor="#aaa"
              value={addressBook}
              onChangeText={setAddressBook}
            />

            {/* Emergency Contact Info */}
            <TextInput
              style={styles.inputField}
              placeholder="Emergency Contact Info"
              placeholderTextColor="#aaa"
              value={emergencyContact}
              onChangeText={setEmergencyContact}
              keyboardType="phone-pad"
            />

            {/* Notification Preference */}
            <TouchableOpacity
              style={styles.inputField}
              onPress={() => setShowNotificationDropdown(!showNotificationDropdown)}
            >
              <Text style={styles.dropdownText}>
                {notificationPreference}
              </Text>
              <Entypo name="chevron-down" size={18} color="#aaa" />
            </TouchableOpacity>

            {/* Preferable Payment */}
            <TouchableOpacity
              style={styles.inputField}
              onPress={() => setShowPaymentDropdown(!showPaymentDropdown)}
            >
              <Text style={styles.dropdownText}>
                {preferablePayment}
              </Text>
              <Entypo name="chevron-down" size={18} color="#aaa" />
            </TouchableOpacity>

            {/* Biometrics */}
            <TouchableOpacity style={styles.biometricsToggle}>
              <Entypo name="fingerprint" size={36} color="#FEB914" />
              <Text style={styles.biometricsLabel}>Enable Biometrics</Text>
            </TouchableOpacity>

            {/* Buttons */}
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipButton} onPress={onClose}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

// Login Success Modal Component
const LoginSuccessModal = ({ isVisible, onClose }: LoginSuccessModalProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.successModalContent}>
          <View style={styles.successIconContainer}>
            <FontAwesome name="check-circle" size={60} color="#4CAF50" />
          </View>
          
          <Text style={styles.successModalTitle}>Login Successful! 🎉</Text>
          
          <Text style={styles.successModalMessage}>
            Welcome back! You have been logged in successfully.
          </Text>
          
          <Text style={styles.successModalSubtext}>
            Ready to start your next ride?
          </Text>

          <TouchableOpacity 
            style={styles.successModalButton}
            onPress={onClose}
          >
            <Text style={styles.successModalButtonText}>Let's Go!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function HomeScreen({ setScreen }: HomeScreenProps) {
  const [showPhotoOverlay, setShowPhotoOverlay] = useState<boolean>(true);
  const [showAdditionalInfoOverlay, setShowAdditionalInfoOverlay] = useState<boolean>(false);
  const [showLoginSuccessModal, setShowLoginSuccessModal] = useState<boolean>(false);
  const [showPhotoChoiceModal, setShowPhotoChoiceModal] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Check if login success modal has been shown before
  useEffect(() => {
    checkLoginSuccessShown();
  }, []);

  const checkLoginSuccessShown = async () => {
    try {
      const hasShownLoginSuccess = await AsyncStorage.getItem('hasShownLoginSuccess');
      
      // If it hasn't been shown before, show it and mark as shown
      if (!hasShownLoginSuccess) {
        setShowLoginSuccessModal(true);
        await AsyncStorage.setItem('hasShownLoginSuccess', 'true');
      }
    } catch (error) {
      console.error('Error checking login success modal:', error);
      // If there's an error, default to showing the modal
      setShowLoginSuccessModal(true);
    }
  };

  const handleNextFromPhoto = () => {
    setShowPhotoOverlay(false);
    setShowPhotoChoiceModal(true);
  };

  const handleImageSelected = (uri: string) => {
    setUploadedImage(uri);
    setShowPhotoChoiceModal(false);
    setShowAdditionalInfoOverlay(true);
  };

  const handleLoginSuccessClose = () => {
    setShowLoginSuccessModal(false);
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

      <TouchableOpacity style={styles.searchContainer} onPress={() => setScreen('orderScreen')}>
        <FontAwesome name="car" size={19} color="white" />
        <TextInput
          placeholder="Where to today?"
          placeholderTextColor="white"
          style={styles.searchInput}
          editable={false}
        />
        <TouchableOpacity style={styles.laterBtn}>
          <Entypo name="shop" size={20} color="white" />
          <Text style={styles.laterText}>Later</Text>
        </TouchableOpacity>
      </TouchableOpacity>

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

      {/* Ride Analytics Section */}
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>Check your ride Analytics</Text>
        <TouchableOpacity 
          style={styles.analyticsButton} 
          onPress={() => setScreen('analyticsScreen')}
        >
          <Text style={styles.analyticsButtonText}>View your Ride Summary</Text>
        </TouchableOpacity>
      </View>

      {/* Special Service Section */}
      <Text style={styles.sectionTitle}>Special Service</Text>
      <View style={styles.specialServiceRow}>
        <TouchableOpacity style={styles.specialCard}>
          <Image
            source={require("../../assets/images/car2.png")}
            style={styles.specialImage}
          />
          <Text style={styles.specialTitle}>Our Special AI Security</Text>
          <Text style={styles.specialSub}>Checkout our Special AI</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.specialCard}>
          <Image
            source={require("../../assets/images/car2.png")}
            style={styles.specialImage}
          />
          <Text style={styles.specialTitle}>Share your Ride</Text>
          <Text style={styles.specialSub}>See how to share ride</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.specialCard}>
          <Image
            source={require("../../assets/images/car2.png")}
            style={styles.specialImage}
          />
          <Text style={styles.specialTitle}>Share your Ride</Text>
          <Text style={styles.specialSub}>See how to share ride</Text>
        </TouchableOpacity>
      </View>

      {/* Overlays and Modals */}
      <UploadPhotoOverlay
        isVisible={showPhotoOverlay}
        onClose={() => setShowPhotoOverlay(false)}
        onNext={handleNextFromPhoto}
      />

      <PhotoChoiceModal
        isVisible={showPhotoChoiceModal}
        onClose={() => setShowPhotoChoiceModal(false)}
        onImageSelected={handleImageSelected}
      />

    <AdditionalInfoOverlay
      key={uploadedImage} // forces re-render when image changes
      isVisible={showAdditionalInfoOverlay}
      onClose={() => setShowAdditionalInfoOverlay(false)}
      profileImage={uploadedImage}
    />

      <LoginSuccessModal
        isVisible={showLoginSuccessModal}
        onClose={handleLoginSuccessClose}
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
  specialServiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 150,
    gap: 10,
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
  overlayScrollView: {
    flex: 1,
  },
  overlayScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
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
    backgroundColor: 'black',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButton: {
    backgroundColor: '#FEB914',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  skipButton: {
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'white',
  },
  skipButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Success Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successModalTitle: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  successModalMessage: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  successModalSubtext: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  successModalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  successModalButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Additional styles for overlays
  inputField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  dropdownText: {
    color: "#fff",
    fontSize: 14,
  },
  biometricsToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10,
  },
  biometricsLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  nextButton: {
    backgroundColor: "#FEB914",
    paddingVertical: 15,
    width: "100%",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  nextButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  button: {
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginVertical: 6,
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  buttonText: {
    fontSize: 16,
    color: "#000",
  },
  profilePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FEB914',
  },
});