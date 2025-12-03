import { useProfile } from "@/services/profile.service";
import { useUpdateRiderProfile } from "@/services/updateProfile.service";
import { useUploadProfilePhoto } from "@/services/upload.service";
import { Entypo, Feather, FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  View,
} from "react-native";
type HomeScreenProps = {
  setScreen: (screen: string) => void;
};

type UploadPhotoOverlayProps = {
  isVisible: boolean;
  onClose: () => void;
  onUploadPress: () => void;
  onSubmit: () => void;
  imageUri: string | null;
  loading: boolean;
};

type ComingSoonModalProps = {
  isVisible: boolean;
  onClose: () => void;
};

type PhotoChoiceModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onImageSelected: (uri: string, fileSize?: number) => void;
};

type AdditionalInfoOverlayProps = {
  isVisible: boolean;
  onClose: () => void;
  profileImageId?: string | null;
  onSubmit: (ridePreference: string, securityPreference: string) => void;
  loading?: boolean;
};

type LoginSuccessModalProps = {
  isVisible: boolean;
  onClose: () => void;
};

type DriverOnWayModalProps = {
  isVisible: boolean;
  onClose: () => void;
};



// Add ComingSoonModal component
const ComingSoonModal = ({ isVisible, onClose }: ComingSoonModalProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.comingSoonModalContent}>
          <View style={styles.comingSoonIconContainer}>
            <FontAwesome5 name="crown" size={50} color="#FEB914" />
          </View>
          
          <Text style={styles.comingSoonModalTitle}>Coming Soon! 🚀</Text>
          
          <Text style={styles.comingSoonModalMessage}>
            Our Premium Package is currently under development and will be available soon.
          </Text>
          
          <Text style={styles.comingSoonModalSubtext}>
            Stay tuned for exciting new features and exclusive benefits!
          </Text>

          <TouchableOpacity 
            style={styles.comingSoonModalButton}
            onPress={onClose}
          >
            <Text style={styles.comingSoonModalButtonText}>Got It!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// AreaFada Overlay Component
const AreaFadaOverlay = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  if (!visible) return null;

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.areaFadaOverlay}>
        <View style={styles.areaFadaModalContainer}>
          {/* Header */}
          <Text style={styles.areaFadaTitle}>KabLüx</Text>
          <Text style={styles.areaFadaSubtitle}>Area Fada</Text>

          {/* Crown avatar */}
          <View style={styles.areaFadaCrownContainer}>
            <Image
              source={require("../../assets/images/Ava.png")}
              style={styles.areaFadaMainAvatar}
            />
            <FontAwesome5
              name="crown"
              size={40}
              color="#FFB800"
              style={styles.areaFadaCrown}
            />
          </View>

          <Text style={styles.areaFadaHighlightText}>You are ahead of your peeps</Text>

          {/* Leaderboard avatars */}
          <View style={styles.areaFadaAvatarRow}>
            {["#D9D9D9", "#8B5E3C", "#FFB800", "#F86E6E", "#004AAD"].map(
              (color, index) => (
                <View key={index} style={[styles.areaFadaAvatarCircle, { borderColor: color }]}>
                  <Image
                    source={require("../../assets/images/Ava.png")}
                    style={styles.areaFadaSmallAvatar}
                  />
                </View>
              )
            )}
          </View>

          {/* Stats container */}
          <View style={styles.areaFadaStatsContainer}>
            <View style={styles.areaFadaStatBox}>
              <MaterialIcons name="local-taxi" size={20} color="#FFB800" />
              <Text style={styles.areaFadaStatTitle}>Trips</Text>
              <Text style={styles.areaFadaStatValue}>5</Text>
            </View>

            <View style={styles.areaFadaStatBox}>
              <MaterialIcons name="route" size={20} color="#FFB800" />
              <Text style={styles.areaFadaStatTitle}>Kilometers covered</Text>
              <Text style={styles.areaFadaStatValue}>5</Text>
            </View>

            <View style={styles.areaFadaStatBox}>
              <FontAwesome5 name="medal" size={20} color="#FFB800" />
              <Text style={styles.areaFadaStatTitle}>Points</Text>
              <Text style={styles.areaFadaStatValue}>5</Text>
            </View>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.areaFadaCloseBtn} onPress={onClose}>
            <Text style={styles.areaFadaCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Overlay Component for Photo Upload
const UploadPhotoOverlay = ({
  isVisible,
  onClose,
  onUploadPress,
  onSubmit,
  imageUri,
  loading
}: UploadPhotoOverlayProps) => {
  if (!isVisible) return null;

  return (
    <Modal animationType="slide" transparent visible={isVisible} onRequestClose={onClose}>
      <View style={styles.overlayContainer}>
        <View style={styles.overlayContent}>

          {/* Close */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Entypo name="cross" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.overlayTitle}>Upload A Photo</Text>
          <Text style={styles.overlaySubtitle}>upload a profile photo for verification</Text>

          {/* If image selected, show preview */}
          <View style={styles.uploadIconContainer}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{ width: 120, height: 120, borderRadius: 60 }}
              />
            ) : (
              <Feather name="image" size={80} color="#f7b731" />
            )}
          </View>

          {/* Upload Button */}
          <TouchableOpacity style={styles.uploadButton} onPress={onUploadPress}>
            <Text style={styles.uploadButtonText}>
              {imageUri ? "Change Photo" : "Upload"}
            </Text>
          </TouchableOpacity>

          {/* Submit button appears **only if image exists** */}
          {imageUri && (
            <TouchableOpacity style={styles.submitButton} onPress={onSubmit} disabled={loading}>
              <Text style={styles.submitText}>{loading ? "Uploading..." : "Submit"}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};


const PhotoChoiceModal = ({ isVisible, onClose, onImageSelected }: PhotoChoiceModalProps) => {
  if (!isVisible) return null;

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return alert("Permission required");

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      onImageSelected(asset.uri, asset.fileSize);
      // Optionally set size if available
      if (asset.fileSize) {
        // You'll need to pass this back - see below
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return alert("Camera permission required");

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      onImageSelected(asset.uri, asset.fileSize);
    }
  };

  return (
    <Modal animationType="fade" transparent visible={isVisible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.bottomSheet}>
              <Text style={styles.title}>Select Photo</Text>

              <TouchableOpacity style={styles.button} onPress={takePhoto}>
                <Text style={styles.buttonText}>Take a photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Text style={styles.buttonText}>Choose from gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={[styles.buttonText, { color: "#fff" }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};


// const AdditionalInfoOverlay = ({ isVisible, onClose, profileImage }: AdditionalInfoOverlayProps) => {
//   if (!isVisible) return null;

//   const notificationOptions = ['Push Notifications', 'Email', 'SMS'];
//   const paymentOptions = ['Credit Card', 'Bank Transfer', 'Mobile Wallet'];

//   const [notificationPreference, setNotificationPreference] = useState<string>("Notification Preference");
//   const [preferablePayment, setPreferablePayment] = useState<string>("Preferable Payment");
//   const [addressBook, setAddressBook] = useState<string>("");
//   const [emergencyContact, setEmergencyContact] = useState<string>("");

//   const [showNotificationDropdown, setShowNotificationDropdown] = useState<boolean>(false);
//   const [showPaymentDropdown, setShowPaymentDropdown] = useState<boolean>(false);

//   const handleNext = () => {
//     // Validate and save the additional info
//     console.log({
//       addressBook,
//       emergencyContact,
//       notificationPreference,
//       preferablePayment,
//       profileImage,
//     });
//     onClose();
//   };

//   return (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={isVisible}
//       onRequestClose={onClose}
//     >
//       <View style={styles.overlayContainer}>
//         <ScrollView 
//           style={styles.overlayScrollView}
//           contentContainerStyle={styles.overlayScrollContent}
//         >
//           <View style={styles.overlayContent}>
//             <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//               <Entypo name="cross" size={28} color="#fff" />
//             </TouchableOpacity>

//             {profileImage && (
//             <Image source={{ uri: profileImage }} style={styles.profilePreview} />
//           )}

//             <Text style={styles.overlayTitle}>Additional Information</Text>
//             <Text style={styles.overlaySubtitle}>
//               Fill the details to get more information about you
//             </Text>

//             {/* Address Book */}
//             <TextInput
//               style={styles.inputField}
//               placeholder="Address Book"
//               placeholderTextColor="#aaa"
//               value={addressBook}
//               onChangeText={setAddressBook}
//             />

//             {/* Emergency Contact Info */}
//             <TextInput
//               style={styles.inputField}
//               placeholder="Emergency Contact Info"
//               placeholderTextColor="#aaa"
//               value={emergencyContact}
//               onChangeText={setEmergencyContact}
//               keyboardType="phone-pad"
//             />

//             {/* Notification Preference */}
//             <TouchableOpacity
//               style={styles.inputField}
//               onPress={() => setShowNotificationDropdown(!showNotificationDropdown)}
//             >
//               <Text style={styles.dropdownText}>
//                 {notificationPreference}
//               </Text>
//               <Entypo name="chevron-down" size={18} color="#aaa" />
//             </TouchableOpacity>

//             {/* Preferable Payment */}
//             <TouchableOpacity
//               style={styles.inputField}
//               onPress={() => setShowPaymentDropdown(!showPaymentDropdown)}
//             >
//               <Text style={styles.dropdownText}>
//                 {preferablePayment}
//               </Text>
//               <Entypo name="chevron-down" size={18} color="#aaa" />
//             </TouchableOpacity>

//             {/* Biometrics */}
//             <TouchableOpacity style={styles.biometricsToggle}>
//               <Entypo name="fingerprint" size={36} color="#FEB914" />
//               <Text style={styles.biometricsLabel}>Enable Biometrics</Text>
//             </TouchableOpacity>

//             {/* Buttons */}
//             <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
//               <Text style={styles.nextButtonText}>Next</Text>
//             </TouchableOpacity>
// };

// Additional Info Overlay Component
const AdditionalInfoOverlay = ({
  isVisible,
  onClose,
  profileImageId,
  onSubmit,
  loading,
}: AdditionalInfoOverlayProps) => {
  const [ridePreference, setRidePreference] = useState<string>("Comfort");
  const [securityPreference, setSecurityPreference] = useState<string>("Standard");
  const [showRideDropdown, setShowRideDropdown] = useState<boolean>(false);
  const [showSecurityDropdown, setShowSecurityDropdown] = useState<boolean>(false);

  const rideOptions = ["Economy", "Comfort", "Premium"];
  const securityOptions = ["Standard", "Verified Driver", "Premium Protection"];

  const handleSubmit = () => {
    console.log("\n🔍 [AdditionalInfoOverlay] Submit button pressed");
    console.log("📝 Form Data:");
    console.log("  - Ride Preference:", ridePreference);
    console.log("  - Security Preference:", securityPreference);
    
    console.log("✅ [AdditionalInfoOverlay] Validation passed, calling onSubmit...");
    onSubmit(ridePreference, securityPreference);
  };

  if (!isVisible) return null;

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

            <Text style={styles.overlayTitle}>Preferences</Text>
            <Text style={styles.overlaySubtitle}>
              Choose your ride and security preferences
            </Text>

            {/* Ride Preference Dropdown */}
            <TouchableOpacity
              style={styles.inputField}
              onPress={() => setShowRideDropdown(!showRideDropdown)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.dropdownLabel}>Ride Preference</Text>
                <Text style={styles.dropdownText}>{ridePreference}</Text>
              </View>
              <Entypo
                name={showRideDropdown ? "chevron-up" : "chevron-down"}
                size={18}
                color="#FEB914"
              />
            </TouchableOpacity>

            {showRideDropdown && (
              <View style={styles.dropdownMenu}>
                {rideOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.dropdownMenuItem,
                      ridePreference === option && styles.dropdownMenuItemSelected,
                    ]}
                    onPress={() => {
                      setRidePreference(option);
                      setShowRideDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownMenuText,
                        ridePreference === option && styles.dropdownMenuTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Security Preference Dropdown */}
            <TouchableOpacity
              style={styles.inputField}
              onPress={() => setShowSecurityDropdown(!showSecurityDropdown)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.dropdownLabel}>Security Preference</Text>
                <Text style={styles.dropdownText}>{securityPreference}</Text>
              </View>
              <Entypo
                name={showSecurityDropdown ? "chevron-up" : "chevron-down"}
                size={18}
                color="#FEB914"
              />
            </TouchableOpacity>

            {showSecurityDropdown && (
              <View style={styles.dropdownMenu}>
                {securityOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.dropdownMenuItem,
                      securityPreference === option && styles.dropdownMenuItemSelected,
                    ]}
                    onPress={() => {
                      setSecurityPreference(option);
                      setShowSecurityDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownMenuText,
                        securityPreference === option && styles.dropdownMenuTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Buttons */}
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.nextButtonText}>Submit</Text>
              )}
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

// Driver On Way Modal Component
const DriverOnWayModal = ({ 
  isVisible, 
  onClose,
}: DriverOnWayModalProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.driverOnWayModalContent}>
          <View style={styles.driverOnWayIconContainer}>
            <FontAwesome5 name="car" size={50} color="#FEB914" />
          </View>
          
          <Text style={styles.driverOnWayModalTitle}>Driver On The Way! 🚗</Text>
          
          <Text style={styles.driverOnWayModalMessage}>
            Your driver is heading to your location
          </Text>
          
          <Text style={styles.driverOnWayModalSubtext}>
            Get ready for your ride!
          </Text>

          <TouchableOpacity 
            style={styles.driverOnWayModalButton}
            onPress={onClose}
          >
            <Text style={styles.driverOnWayModalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Profile Update Success Modal Component
const ProfileUpdateSuccessModal = ({ isVisible, onClose }: LoginSuccessModalProps) => {
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
          
          <Text style={styles.successModalTitle}>Profile Updated! 🎉</Text>
          
          <Text style={styles.successModalMessage}>
            Your preferences have been saved successfully.
          </Text>
          
          <Text style={styles.successModalSubtext}>
            You're all set to start riding!
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

  const [showComingSoonModal, setShowComingSoonModal] = useState<boolean>(false);
  const [showPhotoOverlay, setShowPhotoOverlay] = useState<boolean>(false);
  const [showAdditionalInfoOverlay, setShowAdditionalInfoOverlay] = useState<boolean>(false);
  const [showLoginSuccessModal, setShowLoginSuccessModal] = useState<boolean>(false);
  const [showPhotoChoiceModal, setShowPhotoChoiceModal] = useState<boolean>(false);
  const [showProfileUpdateSuccessModal, setShowProfileUpdateSuccessModal] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showAreaFadaOverlay, setShowAreaFadaOverlay] = useState<boolean>(false);
  const [uploadedProfileImageId, setUploadedProfileImageId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [showDriverOnWayModal, setShowDriverOnWayModal] = useState<boolean>(false);
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<number>(0);
  
  const uploadMutation = useUploadProfilePhoto();
  const updateProfileMutation = useUpdateRiderProfile(userId || undefined);
  const { data: profile, isLoading: profileLoading } = useProfile();

const uploadPhotoToServer = async () => {
  if (!imageUri) return;

  try {
    const formData = new FormData();
    
    formData.append("name", "profile_photo");

    const filename = imageUri.split('/').pop() || 'profile.jpg';
    formData.append("files", {
      uri: imageUri,
      type: "image/jpeg",
      name: filename,
    } as any);

    await uploadMutation.mutateAsync(formData, {
      onSuccess: (res) => {
        console.log("UPLOAD RESULT", res.data);
        // Extract the file ID from the response (not the URL)
        const fileId = res.data?.results?.[0]?.id;
        const fileUrl = res.data?.results?.[0]?.file;
        console.log("📸 Extracted file ID:", fileId);
        console.log("📸 Extracted file URL:", fileUrl);
        if (fileId) {
          setUploadedProfileImageId(fileId);
          setImageUri(null);
          setImageSize(0);
          setShowUploadOverlay(false);
          // Show additional info modal instead of closing
          setShowAdditionalInfoOverlay(true);
        }
      },
      onError: (error: any) => {
        console.log("Full error:", error.response?.data);
        Alert.alert("Error", error?.response?.data?.message || "Failed to upload image");
      },
    });
  } catch (err) {
    console.error(err);
    Alert.alert("Error", "Failed to upload image");
  }
};


  useEffect(() => {
    const afterMount = async () => {
      const token = await AsyncStorage.getItem("token");
      const Rtoken = await AsyncStorage.getItem("refreshToken");
      const storedUserId = await AsyncStorage.getItem("user_id");
      
      console.log(`Access token: ${token} Refresh Token: ${Rtoken}`);
      console.log(`User ID: ${storedUserId}`);
      
      if (storedUserId) {
        setUserId(storedUserId);
      }
      
      checkLoginSuccessShown();
    };
    afterMount();
  }, []);

  // Show upload modal only if profile picture is null
  useEffect(() => {
    if (profile && profile.profile_image === null) {
      console.log("📸 No profile picture found, showing upload modal");
      setShowUploadOverlay(true);
    } else {
      console.log("✅ Profile picture exists, hiding upload modal");
      setShowUploadOverlay(false);
    }
  }, [profile]);

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

  const handleImageSelected = (uri: string, fileSize?: number) => {
    setUploadedImage(uri);
    setImageUri(uri);
    if (fileSize) {
      setImageSize(fileSize);
    }
    setShowPhotoChoiceModal(false);
    setShowAdditionalInfoOverlay(true);
  };

  const handleLoginSuccessClose = () => {
    setShowLoginSuccessModal(false);
  };

  const handleAdditionalInfoSubmit = (ridePreference: string, securityPreference: string) => {
    console.log("\n🎯 [AdditionalInfo] User submitted preferences");
    console.log("🚗 Ride Preference:", ridePreference);
    console.log("🔒 Security Preference:", securityPreference);
    console.log("🖼️ Profile Image ID:", uploadedProfileImageId);
    
    const payload = {
      profile_picture: uploadedProfileImageId,
       ride_preference: { ride: ridePreference },
      security_preference: { security: securityPreference },
    };
    
    console.log("\n📦 [AdditionalInfo] Full payload being sent:");
    console.log(JSON.stringify(payload, null, 2));
    console.log("\n🚀 [AdditionalInfo] Patching to rider_profile/{userId} endpoint...\n");
    
    updateProfileMutation.mutate(
      payload,
      {
        onSuccess: () => {
          console.log("✅ [AdditionalInfo] Profile updated successfully");
          setShowAdditionalInfoOverlay(false);
          setUploadedProfileImageId(null);
          setShowProfileUpdateSuccessModal(true);
        },
        onError: (error: any) => {
          console.error("❌ [AdditionalInfo] Profile update failed:", error);
          Alert.alert("Error", "Failed to update profile preferences");
        },
      }
    );
  };

  const handleProfileUpdateSuccessClose = () => {
    setShowProfileUpdateSuccessModal(false);
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

        <TouchableOpacity onPress={() => setShowAreaFadaOverlay(true)}>
          {profile?.profile_image ? (
            <Image
              source={{ uri: profile.profile_image }}
              resizeMode='contain'
              style={{ width: 40, height: 40, borderRadius: 20, marginLeft:'auto' }}
            />
          ) : (
            <Image
              source={require("../../assets/images/Ava.png")}
              resizeMode='contain'
              style={{ width: 100, height: 40, marginLeft:'auto' }}
            />
          )}
        </TouchableOpacity>
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
        <TouchableOpacity style={styles.suggestionCard} onPress={() => setScreen('orderScreen')}>
          <Image
            source={require("../../assets/images/car.png")}
            style={styles.suggestionIcon}
          />
          <Text style={styles.suggestionText}>Ride</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.suggestionCard} onPress={() => setShowComingSoonModal(true)}
>
          <Image
            source={require("../../assets/images/courier.png")}
            style={styles.suggestionIcon}
          />
          <Text style={styles.suggestionText}>Courier</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.suggestionCard} onPress={() => setShowComingSoonModal(true)}
>
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
          <TouchableOpacity 
            style={styles.banner}
            onPress={() => setShowComingSoonModal(true)}
            activeOpacity={0.8}
          >
            <View>
              <Text style={styles.bannerText}>{item.text}</Text>
              <TouchableOpacity 
                style={styles.bannerBtn}
                onPress={() => setShowComingSoonModal(true)}
              >
                <Text style={styles.bannerBtnText}>Try our Premium Package</Text>
              </TouchableOpacity>
            </View>
            <Image source={item.image} style={styles.bannerImage} />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingRight: 20 }}
      />


       <ComingSoonModal
        isVisible={showComingSoonModal}
        onClose={() => setShowComingSoonModal(false)}
      />

      <View style={styles.recentRideHeader}>
        <Text style={styles.sectionTitle}>Recent Ride</Text>
        {/* Remove the See All button since there's no history to see */}
      </View>

      {/* Recent Ride Components */}
       <View style={styles.emptyRideCard}>
        <View style={styles.emptyRideIconContainer}>
          <FontAwesome5 name="car" size={40} color="#FEB914" />
        </View>
        <Text style={styles.emptyRideTitle}>No Recent Rides</Text>
        <Text style={styles.emptyRideMessage}>
          Take a ride to see your ride history here
        </Text>
        <TouchableOpacity 
          style={styles.emptyRideButton}
          onPress={() => setScreen('orderScreen')}
        >
          <Text style={styles.emptyRideButtonText}>Book a Ride</Text>
        </TouchableOpacity>
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
        isVisible={showUploadOverlay}
        onClose={() => setShowUploadOverlay(false)}
        onUploadPress={() => setShowPickerModal(true)}
        imageUri={imageUri}
        onSubmit={uploadPhotoToServer}
        loading={uploadMutation.isPending}
      />

      <PhotoChoiceModal
        isVisible={showPickerModal}
        onClose={() => setShowPickerModal(false)}
        onImageSelected={(uri: string, fileSize?: number) => {
          setImageUri(uri);
          if (fileSize) {
            setImageSize(fileSize);
          }
          setShowPickerModal(false);
        }}
      />

      <AdditionalInfoOverlay
        isVisible={showAdditionalInfoOverlay}
        onClose={() => setShowAdditionalInfoOverlay(false)}
        profileImageId={uploadedProfileImageId}
        onSubmit={handleAdditionalInfoSubmit}
        loading={updateProfileMutation.isPending}
      />

      <LoginSuccessModal
        isVisible={showLoginSuccessModal}
        onClose={handleLoginSuccessClose}
      />

      {/* AreaFada Overlay */}
      <AreaFadaOverlay
        visible={showAreaFadaOverlay}
        onClose={() => setShowAreaFadaOverlay(false)}
      />
      <DriverOnWayModal
        isVisible={showDriverOnWayModal}
        onClose={() => setShowDriverOnWayModal(false)}
      />

      <ProfileUpdateSuccessModal
        isVisible={showProfileUpdateSuccessModal}
        onClose={handleProfileUpdateSuccessClose}
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
    // width: 90,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    // borderColor:'white',
    flexDirection:'row',  
    justifyContent:'space-between',
    
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


  comingSoonModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    borderWidth: 2,
    borderColor: '#FEB914',
  },
  comingSoonIconContainer: {
    marginBottom: 20,
  },
  comingSoonModalTitle: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },

   emptyRideCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
    borderStyle: 'dashed',
  },
  emptyRideIconContainer: {
    backgroundColor: '#000',
    borderRadius: 50,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FEB914',
  },
  emptyRideTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyRideMessage: {
    color: "#aaa",
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyRideButton: {
    backgroundColor: "#FEB914",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  emptyRideButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  
  comingSoonModalMessage: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  comingSoonModalSubtext: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  comingSoonModalButton: {
    backgroundColor: '#FEB914',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  comingSoonModalButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
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
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
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
    backgroundColor: "#1a1a1a",
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
    color: "#fff",
  },
  button: {
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#d6d6d6ff",
    borderRadius: 10,
    marginVertical: 6,
  },
  cancelButton: {
    backgroundColor: "#1a1a1a",
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

  // AreaFada Overlay Styles
  areaFadaOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  areaFadaModalContainer: {
    width: "88%",
    backgroundColor: "#000",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFB800",
    paddingVertical: 25,
    alignItems: "center",
    padding:20
  },
  areaFadaTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFB800",
  },
  areaFadaSubtitle: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 10,
  },
  areaFadaCrownContainer: {
    marginVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  areaFadaMainAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  areaFadaCrown: {
    position: "absolute",
    top: -20,
  },
  areaFadaHighlightText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  areaFadaAvatarRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  areaFadaAvatarCircle: {
    borderWidth: 2,
    borderRadius: 40,
    padding: 3,
    marginHorizontal: 5,
  },
  areaFadaSmallAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  areaFadaStatsContainer: {
    flexDirection: "row",
    backgroundColor: "#0F1B2D",
    borderRadius: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: "#FFB800",
    marginBottom: 20,
  },
  areaFadaStatBox: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
    
  },
  areaFadaStatTitle: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  areaFadaStatValue: {
    color: "#FFB800",
    fontWeight: "700",
    fontSize: 14,
    marginTop: 2,
  },
  areaFadaCloseBtn: {
    backgroundColor: "#FFB800",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 30,
  },
  areaFadaCloseText: {
    color: "#000",
    fontWeight: "700",
  },
  driverOnWayModalContent: {
  backgroundColor: '#1a1a1a',
  borderRadius: 20,
  padding: 30,
  alignItems: 'center',
  width: '100%',
  maxWidth: 350,
  borderWidth: 2,
  borderColor: '#FEB914',
},
driverOnWayIconContainer: {
  marginBottom: 20,
},
driverOnWayModalTitle: {
  fontSize: 24,
  color: '#fff',
  marginBottom: 15,
  textAlign: 'center',
  fontWeight: 'bold',
},
driverOnWayModalMessage: {
  fontSize: 16,
  color: '#ccc',
  textAlign: 'center',
  marginBottom: 10,
  lineHeight: 22,
},
driverOnWayModalSubtext: {
  fontSize: 14,
  color: '#aaa',
  textAlign: 'center',
  marginBottom: 25,
  lineHeight: 20,
},
driverOnWayModalButton: {
  backgroundColor: '#FEB914',
  paddingVertical: 12,
  paddingHorizontal: 40,
  borderRadius: 10,
  width: '100%',
  alignItems: 'center',
},
driverOnWayModalButtonText: {
  color: '#000',
  fontSize: 18,
  fontWeight: 'bold',
},
rideInProgressBanner: {
  backgroundColor: '#1a1a1a',
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: '#FEB914',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
rideInProgressContent: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
},
rideInProgressText: {
  color: '#fff',
  fontSize: 15,
  fontWeight: '600',
},
rideInProgressDot: {
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: '#FEB914',
},
dropdownLabel: {
  color: "#aaa",
  fontSize: 12,
  marginBottom: 4,
},
dropdownMenu: {
  backgroundColor: "#2a2a2a",
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "#333",
  marginBottom: 16,
  overflow: "hidden",
},
dropdownMenuItem: {
  paddingVertical: 12,
  paddingHorizontal: 15,
  borderBottomWidth: 1,
  borderBottomColor: "#333",
},
dropdownMenuItemSelected: {
  backgroundColor: "#FEB914",
},
dropdownMenuText: {
  color: "#fff",
  fontSize: 14,
},
dropdownMenuTextSelected: {
  color: "#000",
  fontWeight: "600",
},
});