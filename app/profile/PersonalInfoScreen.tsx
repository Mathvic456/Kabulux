import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function PersonalInfoScreen({ goBack, next }) {


  const [email, setEmail] = useState("kabluxt}esting@gmail.com");
  const [phone, setPhone] = useState("+2349188730421");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempPhone, setTempPhone] = useState(phone);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Validation functions
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    // Remove non-digit characters and check length
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length <= 11;
  };

  // Edit handlers
  const handleEditEmail = () => {
    setTempEmail(email);
    setIsEditingEmail(true);
    setIsEditingPhone(false);
  };

  const handleEditPhone = () => {
    setTempPhone(phone);
    setIsEditingPhone(true);
    setIsEditingEmail(false);
  };

  // Save handlers
  const saveEmail = () => {
    if (isValidEmail(tempEmail)) {
      setEmail(tempEmail);
      setIsEditingEmail(false);
    } else {
      Alert.alert("Invalid Email", "Please enter a valid email address");
    }
  };

  const savePhone = () => {
    if (isValidPhone(tempPhone)) {
      setPhone(tempPhone);
      setIsEditingPhone(false);
    } else {
      Alert.alert("Invalid Phone", "Phone number should not exceed 11 digits");
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setIsEditingEmail(false);
    setIsEditingPhone(false);
    Keyboard.dismiss();
  };

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 11)}`;
  };

  // Handle confirm button press
  const handleConfirm = () => {
    if (!isValidEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }
    if (!isValidPhone(phone)) {
      Alert.alert("Invalid Phone", "Phone number should not exceed 11 digits");
      return;
    }
    setShowConfirmationModal(true);
  };

  // Handle final confirmation
  const handleFinalConfirm = () => {
    setShowConfirmationModal(false);
    if (next) {
      next();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={cancelEdit}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Info</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          {/* Email Row */}
          <View style={styles.row}>
            <MaterialIcons name="email" size={20} color="#FEB914" />
            {isEditingEmail ? (
              <TextInput
                style={styles.input}
                value={tempEmail}
                onChangeText={setTempEmail}
                autoFocus
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Enter your email"
                placeholderTextColor="#666"
                onSubmitEditing={saveEmail}
              />
            ) : (
              <Text style={styles.infoText}>{email}</Text>
            )}
            <TouchableOpacity onPress={isEditingEmail ? saveEmail : handleEditEmail}>
              <MaterialIcons 
                name={isEditingEmail ? "check" : "edit"} 
                size={20} 
                color="#FEB914" 
              />
            </TouchableOpacity>
          </View>

          {/* Phone Row */}
          <View style={styles.row}>
            <Ionicons name="call" size={20} color="#FEB914" />
            {isEditingPhone ? (
              <TextInput
                style={styles.input}
                value={tempPhone}
                onChangeText={setTempPhone}
                autoFocus
                keyboardType="phone-pad"
                placeholder="Enter your phone number"
                placeholderTextColor="#666"
                onSubmitEditing={savePhone}
              />
            ) : (
              <Text style={styles.infoText}>{formatPhoneNumber(phone)}</Text>
            )}
            <TouchableOpacity onPress={isEditingPhone ? savePhone : handleEditPhone}>
              <MaterialIcons 
                name={isEditingPhone ? "check" : "edit"} 
                size={20} 
                color="#FEB914" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmText}>Confirm</Text>
        </TouchableOpacity>

        {/* Confirmation Modal */}
        <Modal
          visible={showConfirmationModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowConfirmationModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIcon}>
                <Ionicons name="checkmark-circle" size={40} color="#FEB914" />
              </View>
              <Text style={styles.modalTitle}>Confirm Information</Text>
              <Text style={styles.modalText}>
                Please confirm your personal information:
              </Text>
              
              <View style={styles.modalInfo}>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Email:</Text>
                  <Text style={styles.modalInfoValue}>{email}</Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Phone:</Text>
                  <Text style={styles.modalInfoValue}>{formatPhoneNumber(phone)}</Text>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowConfirmationModal(false)}
                >
                  <Text style={styles.modalButtonCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleFinalConfirm}
                >
                  <Text style={styles.modalButtonConfirmText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    color: "white",
    fontWeight: "600",
    marginRight: 24,
  },
  headerSpacer: {
    width: 24,
  },
  infoBox: {
    borderWidth: 1,
    borderColor: "#FEB914",
    borderRadius: 10,
    padding: 15,
    marginBottom: 40,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    padding: 10,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    color: "white",
    fontSize: 14,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: "white",
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#FEB914",
    padding: 5,
  },
  confirmButton: {
    backgroundColor: "#FEB914",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: "auto",
  },
  confirmText: {
    color: "black",
    fontWeight: "600",
    fontSize: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#2C2C2C",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalIcon: {
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },
  modalText: {
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 14,
  },
  modalInfo: {
    backgroundColor: "#3C3C3C",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  modalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  modalInfoLabel: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  modalInfoValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#6B7280",
  },
  modalButtonConfirm: {
    backgroundColor: "#FEB914",
  },
  modalButtonCancelText: {
    color: "white",
    fontWeight: "600",
  },
  modalButtonConfirmText: {
    color: "black",
    fontWeight: "700",
  },
});