import { useRideId } from "@/context/RideIdContext";
import { useCancelRideEndPoint } from "@/services/cancelRide.service";
import { useProfile } from "@/services/profile.service";
import { useRideDetails } from "@/services/rideDetails.service";
import { useUpdateRiderProfile } from "@/services/updateProfile.service";
import { useUploadProfilePhoto } from "@/services/upload.service";
import {
  Entypo,
  Feather,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  View,
} from "react-native";
import { useRide } from "../../context/RideContext";

type HomeScreenProps = {
  setScreen: (screen: string) => void;
};

type UploadPhotoOverlayProps = {
  isVisible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onSubmit: () => void;
  imageUri: string | null;
  loading: boolean;
};

type ComingSoonModalProps = {
  isVisible: boolean;
  onClose: () => void;
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

// ComingSoonModal component
export const ComingSoonModal = ({
  isVisible,
  onClose,
}: ComingSoonModalProps) => {
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
            Our Premium Package is currently under development and will be
            available soon.
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
const AreaFadaOverlay = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  if (!visible) return null;

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.areaFadaOverlay}>
        <View style={styles.areaFadaModalContainer}>
          <Text style={styles.areaFadaTitle}>KabLüx</Text>
          <Text style={styles.areaFadaSubtitle}>Area Fada</Text>

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

          <Text style={styles.areaFadaHighlightText}>
            You are ahead of your peeps
          </Text>

          <View style={styles.areaFadaAvatarRow}>
            {["#D9D9D9", "#8B5E3C", "#FFB800", "#F86E6E", "#004AAD"].map(
              (color, index) => (
                <View
                  key={index}
                  style={[styles.areaFadaAvatarCircle, { borderColor: color }]}
                >
                  <Image
                    source={require("../../assets/images/Ava.png")}
                    style={styles.areaFadaSmallAvatar}
                  />
                </View>
              ),
            )}
          </View>

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
  onTakePhoto,
  onSubmit,
  imageUri,
  loading,
}: UploadPhotoOverlayProps) => {
  if (!isVisible) return null;

  return (
    <Modal
      animationType="slide"
      transparent
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.overlayContainer}>
        <View style={styles.overlayContent}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Entypo name="cross" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.overlayTitle}>Take A Photo</Text>
          <Text style={styles.overlaySubtitle}>
            Take a profile photo for verification
          </Text>

          <View style={styles.uploadIconContainer}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{ width: 120, height: 120, borderRadius: 60 }}
              />
            ) : (
              <Feather name="camera" size={80} color="#f7b731" />
            )}
          </View>

          <TouchableOpacity style={styles.uploadButton} onPress={onTakePhoto}>
            <Text style={styles.uploadButtonText}>
              {imageUri ? "Retake Photo" : "Take Photo"}
            </Text>
          </TouchableOpacity>

          {imageUri && (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={onSubmit}
              disabled={loading}
            >
              <Text style={styles.submitText}>
                {loading ? "Uploading..." : "Submit"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Additional Info Overlay Component
const AdditionalInfoOverlay = ({
  isVisible,
  onClose,
  profileImageId,
  onSubmit,
  loading,
}: AdditionalInfoOverlayProps) => {
  const [ridePreference, setRidePreference] = useState<string>("Comfort");
  const [securityPreference, setSecurityPreference] =
    useState<string>("Standard");
  const [showRideDropdown, setShowRideDropdown] = useState<boolean>(false);
  const [showSecurityDropdown, setShowSecurityDropdown] =
    useState<boolean>(false);

  const rideOptions = ["Economy", "Comfort", "Premium"];
  const securityOptions = ["Standard", "Verified Driver", "Premium Protection"];

  const handleSubmit = () => {
    console.log("\n🔍 [AdditionalInfoOverlay] Submit button pressed");
    console.log("📝 Form Data:");
    console.log("  - Ride Preference:", ridePreference);
    console.log("  - Security Preference:", securityPreference);

    console.log(
      "[AdditionalInfoOverlay] Validation passed, calling onSubmit...",
    );
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
                      ridePreference === option &&
                        styles.dropdownMenuItemSelected,
                    ]}
                    onPress={() => {
                      setRidePreference(option);
                      setShowRideDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownMenuText,
                        ridePreference === option &&
                          styles.dropdownMenuTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

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
                      securityPreference === option &&
                        styles.dropdownMenuItemSelected,
                    ]}
                    onPress={() => {
                      setSecurityPreference(option);
                      setShowSecurityDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownMenuText,
                        securityPreference === option &&
                          styles.dropdownMenuTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

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

          <TouchableOpacity style={styles.successModalButton} onPress={onClose}>
            <Text style={styles.successModalButtonText}>Let's Go!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Driver On Way Modal Component
const DriverOnWayModal = ({ isVisible, onClose }: DriverOnWayModalProps) => {
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

          <Text style={styles.driverOnWayModalTitle}>
            Driver On The Way! 🚗
          </Text>

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
const ProfileUpdateSuccessModal = ({
  isVisible,
  onClose,
}: LoginSuccessModalProps) => {
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

          <TouchableOpacity style={styles.successModalButton} onPress={onClose}>
            <Text style={styles.successModalButtonText}>Let's Go!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function HomeScreen({ setScreen }: HomeScreenProps) {
  const [showComingSoonModal, setShowComingSoonModal] =
    useState<boolean>(false);
  const [showAdditionalInfoOverlay, setShowAdditionalInfoOverlay] =
    useState<boolean>(false);
  const [showLoginSuccessModal, setShowLoginSuccessModal] =
    useState<boolean>(false);
  const [showProfileUpdateSuccessModal, setShowProfileUpdateSuccessModal] =
    useState<boolean>(false);
  const [showAreaFadaOverlay, setShowAreaFadaOverlay] =
    useState<boolean>(false);
  const [uploadedProfileImageId, setUploadedProfileImageId] = useState<
    string | null
  >(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showDriverOnWayModal, setShowDriverOnWayModal] =
    useState<boolean>(false);
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState(null);

  const CANCELLATION_REASONS = [
    "Can't find driver",
    "Wrong pickup location",
    "Vehicle issue",
    "Personal emergency",
    "Other",
  ];

  const { mutate: cancelRide, isPending: isCanceling } =
    useCancelRideEndPoint();

  const uploadMutation = useUploadProfilePhoto();
  const updateProfileMutation = useUpdateRiderProfile(userId || undefined);
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useProfile();
  const { rideState, driverLocation, resetRide } = useRide();
  const { rideId } = useRideId();
  const { data: rideDetails } = useRideDetails(rideId);
  const driver = rideDetails?.driver;

  const handleCancelPress = () => {
    setCancelModalVisible(true);
    setSelectedCancelReason(null);
  };

  const submitCancellation = () => {
    if (!selectedCancelReason) {
      Alert.alert("Select a Reason", "Please tell us why you are cancelling.");
      return;
    }

    if (rideId) {
      cancelRide(
        { rideId, reason: selectedCancelReason },
        {
          onSuccess: () => {
            setCancelModalVisible(false);
            //TODO: Add a Ride cancelled.
            resetRide();
          },
        },
      );
    }
  };

  const activeRideStatus = (() => {
    switch (rideState) {
      case "driver_on_way":
        return {
          title: "Driver on the Way",
          subtitle: "Your ride is approaching",
          icon: "car",
          color: "#FEB914", // Gold
          bgColor: "rgba(254, 185, 20, 0.1)",
        };
      case "driver_arrived":
        return {
          title: "Driver Arrived",
          subtitle: "Driver is waiting at pickup",
          icon: "map-marker-alt",
          color: "#4CAF50",
          bgColor: "rgba(76, 175, 80, 0.1)",
        };
      case "in_progress":
        return {
          title: "Ride in Progress",
          subtitle: "Heading to your destination",
          icon: "route",
          color: "#2196F3",
          bgColor: "rgba(33, 150, 243, 0.1)",
        };
      default:
        return null;
    }
  })();

  useEffect(() => {
    if (profileError) {
      const status =
        profileError?.response?.status || (profileError as any)?.status;

      console.log("Profile Error Detected:", status);

      if (status === 401) {
        Alert.alert("Session Expired", "Please login again.");
        const clearSession = async () => {
          await AsyncStorage.multiRemove([
            "token",
            "refreshToken",
            "user_id",
            "hasShownLoginSuccess",
          ]);
          setScreen("login");
        };

        clearSession();
      }
    }
  }, [profileError, setScreen]);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera permission is needed to take a photo",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
    }
  };

  const uploadPhotoToServer = async () => {
    if (!imageUri) return;

    try {
      const formData = new FormData();
      formData.append("name", "profile_photo");

      const filename = imageUri.split("/").pop() || "profile.jpg";
      formData.append("files", {
        uri: imageUri,
        type: "image/jpeg",
        name: filename,
      } as any);

      await uploadMutation.mutateAsync(formData, {
        onSuccess: (res) => {
          console.log("UPLOAD RESULT", res.data);
          const fileId = res.data?.results?.[0]?.id;
          const fileUrl = res.data?.results?.[0]?.file;
          console.log("📸 Extracted file ID:", fileId);
          console.log("📸 Extracted file URL:", fileUrl);
          if (fileId) {
            setUploadedProfileImageId(fileId);
            setImageUri(null);
            setShowUploadOverlay(false);
            setShowAdditionalInfoOverlay(true);
          }
        },
        onError: (error: any) => {
          console.log("Full error:", error.response?.data);
          Alert.alert(
            "Error",
            error?.response?.data?.message || "Failed to upload image",
          );
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

  useEffect(() => {
    if (profile && profile.profile_image === null) {
      console.log("📸 No profile picture found, showing upload modal");
      setShowUploadOverlay(true);
    } else {
      console.log("Profile picture exists, hiding upload modal");
      setShowUploadOverlay(false);
    }
  }, [profile]);

  const checkLoginSuccessShown = async () => {
    try {
      const hasShownLoginSuccess = await AsyncStorage.getItem(
        "hasShownLoginSuccess",
      );

      if (!hasShownLoginSuccess) {
        setShowLoginSuccessModal(true);
        await AsyncStorage.setItem("hasShownLoginSuccess", "true");
      }
    } catch (error) {
      console.error("Error checking login success modal:", error);
      setShowLoginSuccessModal(true);
    }
  };

  const handleLoginSuccessClose = () => {
    setShowLoginSuccessModal(false);
  };

  const handleAdditionalInfoSubmit = (
    ridePreference: string,
    securityPreference: string,
  ) => {
    console.log("\n🎯 [AdditionalInfo] User submitted preferences");
    console.log("🚗 Ride Preference:", ridePreference);
    console.log("🔒 Security Preference:", securityPreference);
    console.log("🖼️ Profile Image ID:", uploadedProfileImageId);

    const payload = {
      profile_picture: uploadedProfileImageId,
      ride_preference: ridePreference,
      security_preference: securityPreference,
    };

    console.log("\n📦 [AdditionalInfo] Full payload being sent:");
    console.log(JSON.stringify(payload, null, 2));

    updateProfileMutation.mutate(payload, {
      onSuccess: () => {
        console.log("[AdditionalInfo] Profile updated successfully");
        setShowAdditionalInfoOverlay(false);
        setUploadedProfileImageId(null);
        setShowProfileUpdateSuccessModal(true);
      },
      onError: (error: any) => {
        console.error("[AdditionalInfo] Profile update failed:", error);
        Alert.alert("Error", "Failed to update profile preferences");
      },
    });
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
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/logo.png")}
          resizeMode="cover"
          style={{ width: 100, height: 40 }}
        />

        <TouchableOpacity onPress={() => setShowAreaFadaOverlay(true)}>
          {profile?.profile_image ? (
            <Image
              source={{ uri: profile.profile_image }}
              resizeMode="contain"
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                marginLeft: "auto",
              }}
            />
          ) : (
            <Image
              source={require("../../assets/images/Ava.png")}
              resizeMode="contain"
              style={{ width: 100, height: 40, marginLeft: "auto" }}
            />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.searchContainer}
        onPress={() => setScreen("orderScreen")}
      >
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

      {activeRideStatus && (
        <View
          style={[styles.statusCard, { borderColor: activeRideStatus.color }]}
        >
          <View style={styles.statusContentRow}>
            {/* 2. Driver Profile Image (Replaces the Icon Circle) */}
            <View
              style={[
                styles.statusIconCircle,
                {
                  overflow: "hidden",
                  padding: 0,
                  backgroundColor: "transparent",
                },
              ]}
            >
              <Image
                source={
                  driver?.profile_image
                    ? { uri: driver.profile_image }
                    : require("../../assets/images/Ava.png")
                }
                style={styles.driverAvatar}
                resizeMode="cover"
              />
            </View>

            {/* 3. Driver Info Text */}
            <View style={styles.statusTextCol}>
              {/* Dynamic Title: "John is on the way" */}
              <Text style={styles.statusTitle}>
                {driver?.name
                  ? `${driver.name} is on the way`
                  : activeRideStatus.title}
              </Text>

              <View style={styles.liveIndicatorRow}>
                {/* Status Dot */}
                <View
                  style={[
                    styles.pulsingDot,
                    { backgroundColor: activeRideStatus.color },
                  ]}
                />

                <Text style={styles.statusSubtitle}>
                  {driver?.vehicle ? driver.vehicle : activeRideStatus.subtitle}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.statusActionRow}>
            <TouchableOpacity
              style={[
                styles.trackBtn,
                { backgroundColor: activeRideStatus.color, flex: 1 },
              ]}
              onPress={() => setScreen("trackRide")}
            >
              <Text style={styles.trackBtnText}>Track Ride</Text>
              <Entypo name="chevron-right" size={18} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => setScreen("chatScreen")}
            >
              <Ionicons name="chatbubble-ellipses" size={24} color="#000" />
            </TouchableOpacity>{" "}
            {/* Added closing tag */}
          </View>

          {rideState === "driver_on_way" && (
            <TouchableOpacity
              style={[
                styles.cancelRideButton,
                isCanceling && { backgroundColor: "#444444ff" },
              ]}
              onPress={handleCancelPress}
              disabled={isCanceling}
            >
              {isCanceling ? (
                <ActivityIndicator size="small" color="#ff4444" />
              ) : (
                <Text style={styles.cancelRideButtonText}>Cancel Ride</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      <Text style={styles.sectionTitle}>Suggestion</Text>
      <View style={styles.suggestionRow}>
        <TouchableOpacity
          style={styles.suggestionCard}
          onPress={() => setScreen("orderScreen")}
        >
          <Image
            source={require("../../assets/images/car.png")}
            style={styles.suggestionIcon}
          />
          <Text style={styles.suggestionText}>Ride</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.suggestionCard}
          onPress={() => setShowComingSoonModal(true)}
        >
          <Image
            source={require("../../assets/images/courier.png")}
            style={styles.suggestionIcon}
          />
          <Text style={styles.suggestionText}>Courier</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.suggestionCard}
          onPress={() => setShowComingSoonModal(true)}
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
                <Text style={styles.bannerBtnText}>
                  Try our Premium Package
                </Text>
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
      </View>

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
          onPress={() => setScreen("orderScreen")}
        >
          <Text style={styles.emptyRideButtonText}>Book a Ride</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>Check your ride Analytics</Text>
        <TouchableOpacity
          style={styles.analyticsButton}
          onPress={() => setScreen("analyticsScreen")}
        >
          <Text style={styles.analyticsButtonText}>View your Ride Summary</Text>
        </TouchableOpacity>
      </View>

      {/* <TouchableOpacity style={styles.resetButton} onPress={resetRide}>
        <Text style={styles.resetButtonText}>
          Debug: Reset, current state: {rideState}
        </Text>
      </TouchableOpacity> */}

      <Text style={styles.sectionTitle}>Special Service</Text>
      <View style={styles.specialServiceRow}>
        <TouchableOpacity
          style={styles.specialCard}
          onPress={() => setShowComingSoonModal(true)}
        >
          <Image
            source={require("../../assets/images/car2.png")}
            style={styles.specialImage}
          />
          <Text style={styles.specialTitle}>Our Special AI Security</Text>
          <Text style={styles.specialSub}>Checkout our Special AI</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.specialCard}
          onPress={() => setShowComingSoonModal(true)}
        >
          <Image
            source={require("../../assets/images/car2.png")}
            style={styles.specialImage}
          />
          <Text style={styles.specialTitle}>Share your Ride</Text>
          <Text style={styles.specialSub}>See how to share ride</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.specialCard}
          onPress={() => setShowComingSoonModal(true)}
        >
          <Image
            source={require("../../assets/images/car2.png")}
            style={styles.specialImage}
          />
          <Text style={styles.specialTitle}>Share your Ride</Text>
          <Text style={styles.specialSub}>See how to share ride</Text>
        </TouchableOpacity>
      </View>

      <UploadPhotoOverlay
        isVisible={showUploadOverlay}
        onClose={() => setShowUploadOverlay(false)}
        onTakePhoto={takePhoto}
        imageUri={imageUri}
        onSubmit={uploadPhotoToServer}
        loading={uploadMutation.isPending}
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

      {/* Cancel Ride Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={cancelModalVisible}
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Why are you cancelling?</Text>
              <TouchableOpacity onPress={() => setCancelModalVisible(false)}>
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Reasons List */}
            <View style={styles.reasonsContainer}>
              {CANCELLATION_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonButton,
                    selectedCancelReason === reason &&
                      styles.reasonButtonSelected,
                  ]}
                  onPress={() => setSelectedCancelReason(reason)}
                >
                  <Text
                    style={[
                      styles.reasonText,
                      selectedCancelReason === reason &&
                        styles.reasonTextSelected,
                    ]}
                  >
                    {reason}
                  </Text>
                  {selectedCancelReason === reason && (
                    <Ionicons name="checkmark-circle" size={20} color="#000" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              style={[
                styles.confirmCancelButton,
                (!selectedCancelReason || isCanceling) && {
                  backgroundColor: "#202020ff",
                },
              ]}
              onPress={submitCancellation}
              disabled={!selectedCancelReason || isCanceling}
            >
              {isCanceling ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.confirmCancelText}>Cancel Ride</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  statusCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20, // Spacing from the next element
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  statusContentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  statusTextCol: {
    flex: 1,
  },
  statusTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  liveIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusSubtitle: {
    color: "#ccc",
    fontSize: 14,
  },

  trackBtnText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoContainer: {
    height: 50,
    alignItems: "center",
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  driverLocationBanner: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#FEB914",
  },
  cancelRideButton: {
    backgroundColor: "#252525",
    borderWidth: 1,
    marginTop: 15,
    borderColor: "#333",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  cancelRideButtonText: {
    color: "#ff4444",
    fontSize: 14,
    fontWeight: "600",
  },
  cancelModalContent: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#333",
    minHeight: "50%",
  },
  reasonsContainer: {
    marginBottom: 20,
    gap: 10,
  },
  reasonButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  reasonButtonSelected: {
    backgroundColor: "#facc15",
    borderColor: "#facc15",
  },
  reasonText: {
    color: "#ccc",
    fontSize: 16,
    fontWeight: "500",
  },
  reasonTextSelected: {
    color: "#000",
    fontWeight: "bold",
  },
  confirmCancelButton: {
    backgroundColor: "#ff4444",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  confirmCancelText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  bannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  bannerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FEB914",
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },
  bannerSubtitle: {
    color: "#aaa",
    fontSize: 14,
  },
  resetButton: {
    backgroundColor: "#242424ff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#fff",
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEB914",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  trackButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  statusIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  driverAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
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
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: "100%",
    maxWidth: 350,
    borderWidth: 2,
    borderColor: "#FEB914",
  },
  comingSoonIconContainer: {
    marginBottom: 20,
  },
  comingSoonModalTitle: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
  },
  emptyRideCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
    borderStyle: "dashed",
  },
  emptyRideIconContainer: {
    backgroundColor: "#000",
    borderRadius: 50,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FEB914",
  },
  emptyRideTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  emptyRideMessage: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
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
    color: "#ccc",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 22,
  },
  comingSoonModalSubtext: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  comingSoonModalButton: {
    backgroundColor: "#FEB914",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  comingSoonModalButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
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
  overlayContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  overlayScrollView: {
    flex: 1,
  },
  overlayScrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  overlayContent: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
    paddingBottom: 40,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 5,
  },
  overlayTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  overlaySubtitle: {
    fontSize: 16,
    color: "#aaa",
    marginBottom: 20,
    textAlign: "center",
  },
  uploadIconContainer: {
    backgroundColor: "black",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    width: 140,
    height: 140,
  },
  uploadButton: {
    backgroundColor: "#FEB914",
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  skipButton: {
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "white",
  },
  skipButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successModalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: "100%",
    maxWidth: 350,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successModalTitle: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
  },
  successModalMessage: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 22,
  },
  successModalSubtext: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  successModalButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  successModalButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
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
    borderColor: "#333",
  },
  dropdownText: {
    color: "#fff",
    fontSize: 14,
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
    padding: 20,
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
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: "100%",
    maxWidth: 350,
    borderWidth: 2,
    borderColor: "#FEB914",
  },
  driverOnWayIconContainer: {
    marginBottom: 20,
  },
  driverOnWayModalTitle: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
  },
  driverOnWayModalMessage: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 22,
  },
  driverOnWayModalSubtext: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  driverOnWayModalButton: {
    backgroundColor: "#FEB914",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  driverOnWayModalButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
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
  statusActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 5,
  },
  chatBtn: {
    backgroundColor: "#FEB914",
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  trackBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 5,
  },
});
