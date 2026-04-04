import { useAuth } from "@/context/AuthContext";
import { useRide } from "@/context/RideContext";
import { SocketContext } from "@/context/WebSocketProvider";
import { api } from "@/services/api";
import { useLogoutEndPoint } from "@/services/authentication.service";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function SettingsScreen({ setScreen, goBack }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [promoNotifications, setPromoNotifications] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dLoading, setDLoading] = useState(false);
  const route = useRouter();
  const [deleteForm, setDeleteForm] = useState<{ reason: string; password: string }>({
    reason: "",
    password: "",
  });
  const [deleteErrors, setDeleteErrors] = useState<{ reason?: string; password?: string }>({});

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

  const validateDeleteForm = () => {
    const errors: { reason?: string; password?: string } = {};
    if (!deleteForm.reason || deleteForm.reason.trim().length === 0) {
      errors.reason = "Reason is required to delete your account.";
    }
    if (!deleteForm.password || deleteForm.password.trim().length === 0) {
      errors.password = "Password is required to delete your account.";
    } else if (deleteForm.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }
    setDeleteErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDeleteAcct = async () => {
    if (!validateDeleteForm()) return;
    setDLoading(true);
    try {
      await api.post("auth/request_delete_account/", {
        password: deleteForm.password,
        reason: deleteForm.reason,
      });
      console.log("[Settings] Delete account request successful");
      setShowDeleteModal(false);
      setDeleteForm({ reason: "", password: "" });
      setDeleteErrors({ reason: "", password: "" });
      setScreen("login");
    } catch (error: any) {
      console.log("actual err", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again.";
      console.error("[Settings] Delete account error:", message);
      setDeleteErrors({ password: message, reason: message });
    } finally {
      setDLoading(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (dLoading) return;
    setShowDeleteModal(false);
    setDeleteForm({ reason: "", password: "" });
    setDeleteErrors({});
  };

  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          icon: "card-outline",
          label: "Payment Methods",
          action: () => setScreen("paymentMethod"),
        },
        {
          icon: "document-text-outline",
          label: "Ride Receipts",
          action: () => setScreen("ridereceipts"),
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: "notifications-outline",
          label: "Notifications",
          hasToggle: true,
          toggleValue: notificationsEnabled,
          toggleAction: setNotificationsEnabled,
        },
        {
          icon: "megaphone-outline",
          label: "Promotional Notifications",
          hasToggle: true,
          toggleValue: promoNotifications,
          toggleAction: setPromoNotifications,
        },
        {
          icon: "musical-notes-outline",
          label: "Sound Effects",
          hasToggle: true,
          toggleValue: soundEffects,
          toggleAction: setSoundEffects,
        },
        {
          icon: "phone-portrait-outline",
          label: "Haptic Feedback",
          hasToggle: true,
          toggleValue: hapticFeedback,
          toggleAction: setHapticFeedback,
        },
        {
          icon: "language",
          label: "Language",
          value: "English",
          action: () => setScreen("language"),
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: "alert-circle-outline",
          label: "Report an Issue",
          action: () => setScreen("report"),
        },
        {
          icon: "star-outline",
          label: "Rate Our App",
          action: () => console.log("rateapp"),
        },
        {
          icon: "document-text-outline",
          label: "Terms of Service",
          action: () => setScreen("terms"),
        },
      ],
    },
    {
      title: "About",
      items: [
        {
          icon: "people-outline",
          label: "About Us",
          action: () => setScreen("aboutus"),
        },
        {
          icon: "log-out-outline",
          label: "Log Out",
          isAction: true,
          action: () => setShowLogoutModal(true),
        },
        {
          icon: "trash-outline",
          label: "Delete Account",
          isAction: true,
          action: () => setShowDeleteModal(true),
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          {/* FIX: header title sits between two equal-width spacers so it
              always centres without being squeezed by the back button */}
          <Text style={styles.headerTitle} numberOfLines={1}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.item,
                    itemIndex !== section.items.length - 1 && styles.itemWithBorder,
                  ]}
                  onPress={item.action}
                  disabled={!item.action && !item.hasToggle}
                >
                  {/* FIX: itemLeft is flex:1 with flexShrink:1 and minWidth:0
                      so it shrinks when the right side needs space, and the
                      label uses flexShrink + flexWrap to never get clipped */}
                  <View style={styles.itemLeft}>
                    {/* Icon has a fixed width so it never causes label shift */}
                    <View style={styles.itemIconWrap}>
                      <Ionicons name={item.icon} size={22} color="#FEB914" />
                    </View>
                    <Text
                      style={styles.itemLabel}
                      numberOfLines={2}
                    // FIX: numberOfLines={2} lets long labels wrap to a second
                    // line instead of being truncated with "..."
                    >
                      {item.label}
                    </Text>
                  </View>

                  {/* FIX: itemRight has flexShrink:0 so it never gets squashed
                      and never overlaps the label */}
                  <View style={styles.itemRight}>
                    {item.value && (
                      <Text style={styles.itemValue} numberOfLines={1}>
                        {item.value}
                      </Text>
                    )}
                    {item.hasToggle ? (
                      <Switch
                        value={item.toggleValue}
                        onValueChange={item.toggleAction}
                        trackColor={{ false: "#767577", true: "#FEB914" }}
                        thumbColor={item.toggleValue ? "#fff" : "#f4f3f4"}
                      />
                    ) : (
                      item.action && (
                        <Ionicons name="chevron-forward" size={20} color="#FEB914" />
                      )
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

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

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseDeleteModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseDeleteModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.confirmationModal}>
                {/* Header */}
                <View style={styles.deleteModalHeader}>
                  <Ionicons name="warning-outline" size={28} color="#FF4444" />
                  <Text
                    style={[styles.modalTitle, styles.deleteModalTitle]}
                    numberOfLines={1}
                  >
                    Delete Account
                  </Text>
                </View>

                <Text style={styles.modalText}>
                  This action is permanent and cannot be undone. All your data will be erased.
                </Text>

                {/* Reason Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Reason for leaving<Text style={styles.requiredTag}> *</Text>
                  </Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Tell us why you're leaving..."
                    placeholderTextColor="#666"
                    value={deleteForm.reason}
                    onChangeText={(text) =>
                      setDeleteForm((prev) => ({ ...prev, reason: text }))
                    }
                    multiline
                    numberOfLines={3}
                    editable={!dLoading}
                  />
                  {deleteErrors.reason ? (
                    <Text style={styles.errorText}>{deleteErrors.reason}</Text>
                  ) : null}
                </View>

                {/* Password Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Confirm your password<Text style={styles.requiredTag}> *</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      deleteErrors.password ? styles.inputError : null,
                    ]}
                    placeholder="Enter your password"
                    placeholderTextColor="#666"
                    value={deleteForm.password}
                    onChangeText={(text) => {
                      setDeleteForm((prev) => ({ ...prev, password: text }));
                      if (deleteErrors.password) {
                        setDeleteErrors((prev) => ({ ...prev, password: undefined }));
                      }
                    }}
                    secureTextEntry
                    editable={!dLoading}
                  />
                  {deleteErrors.password ? (
                    <Text style={styles.errorText}>{deleteErrors.password}</Text>
                  ) : null}
                </View>

                {/* Buttons */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={handleCloseDeleteModal}
                    disabled={dLoading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={handleDeleteAcct}
                    disabled={dLoading}
                  >
                    {dLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.deleteButtonText}>Delete</Text>
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
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingVertical: 30,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 5,
    // FIX: fixed width matches headerSpacer so title stays perfectly centred
    width: 34,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    // FIX: matches backButton width to balance the header layout
    width: 34,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 20,
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: "#111",
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FEB914",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    // FIX: minHeight ensures items with two-line labels don't look too tight
    minHeight: 56,
  },
  itemWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    // FIX: flex:1 + flexShrink:1 + minWidth:0 is the correct trio for a
    // flex child that must shrink when siblings need space. Without minWidth:0
    // React Native won't shrink below the intrinsic content width.
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    marginRight: 10,
  },
  // FIX: Dedicated fixed-width wrapper for the icon so it never shifts or
  // causes the label to start at an inconsistent position.
  itemIconWrap: {
    width: 28,
    alignItems: "center",
    flexShrink: 0,
  },
  itemLabel: {
    color: "#fff",
    marginLeft: 12,
    fontSize: 16,
    // FIX: flexShrink:1 allows the label to shrink rather than overflow,
    // and flexWrap ensures it wraps to a second line before truncating.
    flexShrink: 1,
    flexWrap: "wrap",
    lineHeight: 22,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    // FIX: flexShrink:0 prevents the right side (toggle/chevron) from being
    // squashed when the label is long — it always gets its natural size.
    flexShrink: 0,
  },
  itemValue: {
    color: "#bbb",
    marginRight: 10,
    fontSize: 14,
    // FIX: constrain value text so it doesn't push the chevron off screen
    maxWidth: 80,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    // FIX: horizontal padding so the modal never touches screen edges on
    // narrow devices — the modal itself uses width:"100%" inside this space
    paddingHorizontal: 24,
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
  deleteModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  deleteModalTitle: {
    // Override for the delete modal header where title sits next to an icon
    marginBottom: 0,
    marginLeft: 8,
    // FIX: flex:1 so the title takes remaining space and never wraps awkwardly
    flex: 1,
  },
  modalText: {
    color: "#9CA3AF",
    fontSize: 14,
    // FIX: textAlign left so text flows naturally across the full modal width
    // instead of being centred and potentially looking like it's cropped
    textAlign: "left",
    marginBottom: 20,
    lineHeight: 20,
    // FIX: width:"100%" ensures the text block fills the modal
    width: "100%",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    // FIX: minHeight so buttons never collapse when text is slightly larger
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: "#444",
  },
  confirmButton: {
    backgroundColor: "#FEB914",
  },
  deleteButton: {
    backgroundColor: "#FF4444",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "600",
    // FIX: explicit fontSize so button text is never clipped by a too-small button
    fontSize: 15,
  },
  confirmButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 15,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  inputGroup: {
    // FIX: width:"100%" so form fields stretch the full modal width
    width: "100%",
    marginBottom: 14,
  },
  inputLabel: {
    color: "#ccc",
    fontSize: 13,
    marginBottom: 6,
    fontWeight: "500",
  },
  requiredTag: {
    color: "#FF4444",
  },
  textInput: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 8,
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    // FIX: width:"100%" so the input never undershoots the modal edges
    width: "100%",
  },
  textArea: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 8,
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: "top",
    minHeight: 70,
    width: "100%",
  },
  inputError: {
    borderColor: "#FF4444",
  },
  errorText: {
    color: "#FF4444",
    fontSize: 12,
    marginTop: 4,
    // FIX: width:"100%" so error text wraps properly and isn't clipped
    width: "100%",
  },
});