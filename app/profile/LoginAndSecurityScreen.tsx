import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// 1. Import the hook (adjust path as needed)
import { useChangePassword } from "../../services/changepassword.service";

export default function LoginAndSecurityScreen({
  goBack,
  next,
}: {
  next: () => void;
  goBack: () => void;
}) {
  // 2. Initialize the mutation
  const changePasswordMutation = useChangePassword();

  const [modalVisible, setModalVisible] = useState(false);
  const [currentModal, setCurrentModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // State for form inputs
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
const [showNew, setShowNew] = useState(false);
const [showConfirm, setShowConfirm] = useState(false);
const [passwordError, setPasswordError] = useState("");

  const openModal = (modalType: string) => {
    setCurrentModal(modalType);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setCurrentModal(null);
    // Reset form fields
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleAction = () => {
  if (currentModal === "password") {
  // Reset error
  setPasswordError("");

  // Validations
  if (!currentPassword || !newPassword || !confirmPassword) {
    setPasswordError("All fields are required.");
    return;
  }

  if (newPassword.length < 6) {
    setPasswordError("New password must be at least 6 characters.");
    return;
  }

  if (newPassword === currentPassword) {
    setPasswordError("New password cannot be the same as the current password.");
    return;
  }

  if (newPassword !== confirmPassword) {
    setPasswordError("New passwords do not match.");
    return;
  }

  // Execute Mutation
  changePasswordMutation.mutate(
    {
      current_password: currentPassword,
      new_password: newPassword,
    },
    {
      onSuccess: () => {
        Alert.alert("Success", "Password changed successfully!");
        closeModal();
      },
      onError: (err: any) => {
        const backendMsg =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to change password";

        if (
          backendMsg.toLowerCase().includes("invalid") ||
          backendMsg.toLowerCase().includes("incorrect")
        ) {
          setPasswordError("Current password is incorrect.");
        } else {
          setPasswordError(backendMsg);
        }
      },
    }
  );

  return;
}

    // --- Logic for other modals (Simulation) ---
    setLoading(true);

    // Simulate API call or async operation
    setTimeout(() => {
      setLoading(false);
      closeModal();

      // Show success message based on the action
      let message = "";
      switch (currentModal) {
        case "passkeys":
          message = "Passkeys set up successfully!";
          break;
        case "invite":
          message = "Invitations sent successfully!";
          break;
        default:
          message = "Action completed successfully!";
      }

      Alert.alert("Success", message);
    }, 2000);
  };

  const renderModalContent = () => {
    switch (currentModal) {
      case "password":
  return (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Change Password</Text>

      {/* CURRENT PASSWORD */}
      <View style={styles.passwordField}>
        <TextInput
          style={styles.input}
          placeholder="Current Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!showCurrent}
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowCurrent(!showCurrent)}
        >
          <Ionicons
            name={showCurrent ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#FEB914"
          />
        </TouchableOpacity>
      </View>

      {/* NEW PASSWORD */}
      <View style={styles.passwordField}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!showNew}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowNew(!showNew)}
        >
          <Ionicons
            name={showNew ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#FEB914"
          />
        </TouchableOpacity>
      </View>

      {/* CONFIRM PASSWORD */}
      <View style={styles.passwordField}>
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!showConfirm}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowConfirm(!showConfirm)}
        >
          <Ionicons
            name={showConfirm ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#FEB914"
          />
        </TouchableOpacity>
      </View>

      {/* ERROR MESSAGE */}
      {passwordError !== "" && (
        <Text style={styles.errorText}>{passwordError}</Text>
      )}

      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={[styles.modalButton, styles.cancelButton]}
          onPress={closeModal}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modalButton, styles.confirmButton]}
          onPress={handleAction}
          disabled={changePasswordMutation.isPending}
        >
          {changePasswordMutation.isPending ? (
            <ActivityIndicator color="black" />
          ) : (
            <Text style={styles.confirmButtonText}>Change</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

      case "passkeys":
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set up Passkeys</Text>
            <Text style={styles.modalDescription}>
              Passkeys provide a more secure and convenient way to sign in to
              your account without passwords.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                // onPress={handleAction}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="black" />
                ) : (
                  <Text style={styles.confirmButtonText}>Set up Passkeys</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
     
      case "invite":
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invite Friends</Text>
            <Text style={styles.modalDescription}>
              Invite your friends to join KabLUX and enjoy exclusive benefits
              together.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAction}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="black" />
                ) : (
                  <Text style={styles.confirmButtonText}>Send Invites</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="chevron-back" size={20} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Login & Security</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        <View style={styles.infoCard}>
          {/* Change Password */}
          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => openModal("password")}
          >
            <View style={styles.infoLeft}>
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color="#FEB914"
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>Change Password</Text>
            </View>
          </TouchableOpacity>

          {/* Passkeys */}
          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => openModal("passkeys")}
          >
            <View style={styles.infoLeft}>
              <Ionicons
                name="key-outline"
                size={22}
                color="#FEB914"
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>Set up Passkeys</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FEB914" />
          </TouchableOpacity>

          {/* Google */}

        </View>

        {/* Note */}
        <Text style={styles.note}>
          Linking a social account allows you to sign in to KabLUX with ease. We
          will not use your social account for anything else without your
          permission.
        </Text>
      </ScrollView>

      {/* Fixed Bottom Button */}
      {/* <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={() => openModal("invite")}
        >
          <Text style={styles.confirmButtonText}>Invite Friends</Text>
        </TouchableOpacity>
      </View> */}

      {/* Custom Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>{renderModalContent()}</View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: "black",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    marginTop: 30,
  },
  backButton: {
    position: "absolute",
    left: 20,
    backgroundColor: "white",
    borderRadius: 25,
    padding: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  mainContent: {
    padding: 16,
    alignItems: "center",
    paddingBottom: 80, // Add padding to avoid overlap with fixed button
  },
  infoCard: {
    width: "100%",
    backgroundColor: "#2C2C2C",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FEB914",
    padding: 16,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#3d3d3d",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  note: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 20,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#1E1E1E",
    height: 120,
    // borderWidth:1,
    borderColor: "white",
  },
  confirmButton: {
    backgroundColor: "#FEB914",
    borderRadius: 10,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    elevation: 5,
    height: 50,
  },
  confirmButtonText: {
    color: "black",
    fontWeight: "700",
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#2C2C2C",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContent: {
    width: "100%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#3d3d3d",
    borderRadius: 10,
    padding: 15,
    color: "white",
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#3d3d3d",
    height: 50,
    borderRadius: 10,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "600",
  },
  inviteButton: {
    backgroundColor: "#FEB914",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    borderRadius: 20,
  },
  passwordField: {
  width: "100%",
  position: "relative",
},

eyeIcon: {
  position: "absolute",
  right: 12,
  top: 18,
},

errorText: {
  color: "#ff6b6b",
  fontSize: 13,
  marginBottom: 10,
  marginTop: -5,
  textAlign: "center",
},

});