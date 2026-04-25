import { useAuth } from "@/context/AuthContext";
import { useRide } from "@/context/RideContext";
import { SocketContext } from "@/context/WebSocketProvider";
import { useLogoutEndPoint } from "@/services/authentication.service";
import { useProfile } from "@/services/profile.service";
import { Ionicons } from "@expo/vector-icons";
import { AxiosError } from "axios";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
useProfile


type ProfileScreenProps = {
  setScreen: (screen: string) => void;
};

export default function ProfileScreen({ setScreen }: ProfileScreenProps) {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [authExpired, setAuthExpired] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);


  const { data: profile, isLoading, isError, error } = useProfile();

  const { clearTokens } = useAuth();
  const { resetRide } = useRide();
  const { socket } = useContext(SocketContext);
  const { mutate: logout, isPending: isLoggingOut } = useLogoutEndPoint(
    clearTokens,
    resetRide,
  );

  const handleLogout = () => {
    console.log("🚪 [Settings] Starting logout process...");
    if (socket) {
      console.log("🔌 [Settings] Closing WebSocket connection...");
      socket.close(1000, "User logged out");
    }
    logout(undefined, {
      onSuccess: () => {
        console.log("✅ [Settings] Logout successful");
        setShowLogoutModal(false);
        setScreen("login");
      },
      onError: (error) => {
        console.error("[Settings] Logout error:", error);
        setShowLogoutModal(false);
        setScreen("login");
      },
    });
  };

  useEffect(() => {
    console.log("🔍 [ProfileScreen] Profile state changed:");
    console.log("  - isLoading:", isLoading);
    console.log("  - isError:", isError);
    console.log("  - profile:", profile);
    if (error) {
      console.error("  - error:", error);
    }
  }, [profile, isLoading, isError, error]);

  useEffect(() => {
    if (isError && (error as AxiosError)?.response?.status === 401) {
      console.warn("⚠️ [ProfileScreen] 401 error detected - auth expired");
      setAuthExpired(true);
    }
  }, [isError, error]);

  // const logoutMutation = useLogoutEndPoint();

  // const handleLogout = async () => {
  //   try {
  //     await logoutMutation.mutateAsync();
  //   } catch (error) {
  //     console.error("Logout failed:", error);
  //   } finally {
  //     await AsyncStorage.multiRemove(["token", "refreshToken", "rememberedEmail"]);
  //     setAuthExpired(false);
  //     setLogoutModalVisible(false);
  //     setScreen("login");
  //   }
  // };


  const openLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const menuItems = [
    { icon: "settings", label: "Settings", screen: "settings" },
    { icon: "location-outline", label: "Saved Places", screen: "savedPlaces" },
    { icon: "gift-outline", label: "Refer & Earn", screen: "referAndEarn" },
    { icon: "help-circle-outline", label: "Help & Support", screen: "helpAndSupport" },
    { icon: "document-text-outline", label: "Legal", screen: "legal" },

  ];



  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a0a0a", }}>
        <ActivityIndicator size="large" color="#f7b731" />
        <Text style={{ color: "#fff" }}>Loading profile...</Text>
      </View>
    );
  }

  if (isError && (error as AxiosError)?.response?.status === 401)
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={authExpired}
        onRequestClose={() => setAuthExpired(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Ionicons name="alert-circle-outline" size={40} color="#f7b731" />
            </View>

            <Text style={styles.modalTitle}>Session Expired</Text>
            <Text style={styles.modalMessage}>
              There has been an error authenticating your profile. Please log in again.
            </Text>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )

  if (isError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>Failed to load profile</Text>
      </View>
    );
  }


  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <Text
          style={{
            color: "#fff",
            fontSize: 24,
            fontWeight: "bold",
            marginTop: 30,
            marginLeft: 20,
          }}
        >
          Account
        </Text>

        {/* Profile Section */}
        <View style={{ alignItems: "center", marginVertical: 20, }}>
          {profile?.profile_image ? (
            <Image
              source={{ uri: profile.profile_image }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                marginBottom: 10,
                borderWidth: 0.5,
                borderColor: 'white',
              }}
            />
          ) : (
            <Image
              source={require("../../assets/images/Ava.png")}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                marginBottom: 10,
                borderWidth: 0.5,
                borderColor: 'white',
              }}
            />
          )}
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>
            {profile && `${profile.first_name} ${profile.last_name}`}
          </Text>
          {/* 
          <View style={{ flexDirection: "row", marginTop: 5 }}>
            <Text style={{ color: "#fff", marginRight: 5 }}>4.99</Text>
            <FontAwesome name="star" size={14} color="#f7b731" />
            <FontAwesome name="star" size={14} color="#f7b731" />
            <FontAwesome name="star" size={14} color="#f7b731" />
            <FontAwesome name="star" size={14} color="#f7b731" />
            <FontAwesome name="star" size={14} color="#f7b731" />
          </View>
          */}
        </View>

        {/* Section 1 */}
        <View
          style={{
            backgroundColor: "#111",
            marginHorizontal: 20,
            borderRadius: 12,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: "#f7b731",
            marginBottom: 20,
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 15,
              borderBottomWidth: 1,
              borderBottomColor: "#333",
            }}
            onPress={() => setScreen("personalInfo")}
          >
            <Ionicons name="person-outline" size={20} color="#f7b731" />
            <Text style={{ color: "#fff", marginLeft: 15, flex: 1 }}>
              Personal info
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#f7b731" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 15,
            }}
            onPress={() => setScreen("loginAndSecurity")}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#f7b731" />
            <Text style={{ color: "#fff", marginLeft: 15, flex: 1 }}>
              Login & security
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#f7b731" />
          </TouchableOpacity>
        </View>

        {/* Section 2 */}
        <View
          style={{
            backgroundColor: "#111",
            marginHorizontal: 20,
            borderRadius: 12,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: "#f7b731",
          }}
        >
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 15,
                borderBottomWidth: 1,
                borderBottomColor: "#333",
              }}
              onPress={item.isAction ? item.action : () => setScreen(item.screen)}
            >
              <Ionicons name={item.icon} size={20} color="#f7b731" />
              <Text style={{ color: "#fff", marginLeft: 15, flex: 1 }}>
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#f7b731" />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 15,
            borderBottomWidth: 0,
            borderBottomColor: "#333",
          }}
            onPress={openLogoutModal}
          >
            <Ionicons name="log-out-outline" size={20} color="#f7b731" />
            <Text style={{ color: "#fff", marginLeft: 15, flex: 1 }} onPress={openLogoutModal}>
              Logout
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#f7b731" />

          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      {/* <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginBottom: 50,
          paddingVertical: 15,
          backgroundColor: "#111",
        }}
      >
        <TouchableOpacity onPress={() => setScreen("dashboard")}>
          <Ionicons name="home-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setScreen("bookings")}>
          <Ionicons name="book-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setScreen("wallet")}>
          <Ionicons name="wallet-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="person-outline" size={24} color="#f7b731" />
        </TouchableOpacity>
      </View> */}

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => !isLoggingOut && setShowLogoutModal(false)}
        >
          <View style={styles.modalOverlay}>
            {/* FIX: wrap inner modal in TouchableWithoutFeedback so taps
                      inside don't bubble up and close it accidentally */}
            <TouchableWithoutFeedback>
              <View style={styles.confirmationModal}>
                <Text style={styles.modalTitle}>Log Out</Text>
                <Text style={styles.modalText}>
                  Are you sure you want to log out?
                </Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowLogoutModal(false)}
                    disabled={isLoggingOut}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <Text style={styles.confirmButtonText}>Log Out</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f7b731',
  },
  modalIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2C2C2C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#f7b731',
  },
  logoutButton: {
    backgroundColor: '#f7b731',
    padding: 10,
    borderRadius: 5
  },
  cancelButtonText: {
    color: '#f7b731',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  // modalButton: {
  //   flex: 1,
  //   padding: 12,
  //   borderRadius: 8,
  //   alignItems: "center",
  //   justifyContent: "center",
  //   marginHorizontal: 5,
  //   // FIX: minHeight so buttons never collapse when text is slightly larger
  //   minHeight: 44,
  // },
  confirmButton: {
    backgroundColor: "#FEB914",
  },
  deleteButton: {
    backgroundColor: "#FF4444",
  },
  confirmButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 15,
  },
  modalText: {
    color: "#9CA3AF",
    fontSize: 14,
    // FIX: textAlign left so text flows naturally across the full modal width
    // instead of being centred and potentially looking like it's cropped
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
    // FIX: width:"100%" ensures the text block fills the modal
    width: "100%",
  },
  confirmationModal: {
    backgroundColor: "#2C2C2C",
    borderRadius: 16,
    padding: 24,
    // FIX: width:"100%" + maxWidth fills available space (minus overlay
    // padding) and caps at a comfortable width on large screens.
    // Previously "85%" could be too narrow on small phones, cropping text.
    width: "100%",
    maxWidth: 420,
    // FIX: removed alignItems:"center" from the modal container — it was
    // forcing all child text to compress to its intrinsic width instead of
    // stretching across the full modal width.
  },
});