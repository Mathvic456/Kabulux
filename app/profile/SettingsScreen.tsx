import { useLogoutEndPoint } from "@/services/authentication.service";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen({ setScreen }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [promoNotifications, setPromoNotifications] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const logoutMutation = useLogoutEndPoint();

  const handleLogout = async() => {
    try {
      await logoutMutation.mutateAsync(); // Wait for logout to complete
    setShowLogoutModal(false);
    console.log("User logged out");
     setScreen("login")
    } catch (error) {
      console.error("Logout failed:", error);
    }

  };

  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          icon: "person-outline",
          label: "Personal Information",
          action: () => setScreen("personalInfo"),
        },
        {
          icon: "lock-closed-outline",
          label: "Login & Security",
          action: () => setScreen("loginAndSecurity"),
        },
        {
          icon: "card-outline",
          label: "Payment Methods",
          action: () => setScreen("paymentMethods"),
        },
        {
          icon: "document-text-outline",
          label: "Ride Receipts",
          action: () => setScreen("rideReceipts"),
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: "notifications-outline",
          label: "Notifications",
          action: () => setScreen("notifications"),
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
          icon: "help-circle-outline",
          label: "Help Center",
          action: () => setScreen("helpCenter"),
        },
        {
          icon: "alert-circle-outline",
          label: "Report an Issue",
          action: () => setScreen("reportIssue"),
        },
        {
          icon: "star-outline",
          label: "Rate Our App",
          action: () => console.log("Rate app"),
        },
        {
          icon: "document-text-outline",
          label: "Terms of Service",
          action: () => setScreen("terms"),
        },
        {
          icon: "shield-checkmark-outline",
          label: "Privacy Policy",
          action: () => setScreen("privacy"),
        },
      ],
    },
    {
      title: "About",
      items: [
        {
          icon: "information-circle-outline",
          label: "App Version",
          value: "3.2.1",
        },
        {
          icon: "people-outline",
          label: "About Us",
          action: () => setScreen("about"),
        },
        {
          icon: "business-outline",
          label: "Careers",
          action: () => console.log("Careers"),
        },
        {
          icon: "log-out-outline",
          label: "Log Out",
          isAction: true,
          action: () => setShowLogoutModal(true),
        },
      ],
    },
  ];

  if (logoutMutation.isPending) {
    return <ActivityIndicator />
    }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setScreen("dashboard")} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
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
                  <View style={styles.itemLeft}>
                    <Ionicons name={item.icon} size={22} color="#FEB914" />
                    <Text style={styles.itemLabel}>{item.label}</Text>
                  </View>
                  
                  <View style={styles.itemRight}>
                    {item.value && <Text style={styles.itemValue}>{item.value}</Text>}
                    {item.hasToggle ? (
                      <Switch
                        value={item.toggleValue}
                        onValueChange={item.toggleAction}
                        trackColor={{ false: "#767577", true: "#FEB914" }}
                        thumbColor={item.toggleValue ? "#fff" : "#f4f3f4"}
                      />
                    ) : (
                      item.action && <Ionicons name="chevron-forward" size={20} color="#FEB914" />
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
        <TouchableWithoutFeedback onPress={() => setShowLogoutModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.confirmationModal}>
              <Text style={styles.modalTitle}>Log Out</Text>
              <Text style={styles.modalText}>Are you sure you want to log out?</Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleLogout}
                >
                  <Text style={styles.confirmButtonText}>Log Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
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
          <Ionicons name="person-outline" size={24} color="#FEB914" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSpacer: {
    width: 30,
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
  },
  itemWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemLabel: {
    color: "#fff",
    marginLeft: 15,
    fontSize: 16,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemValue: {
    color: "#bbb",
    marginRight: 10,
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
    backgroundColor: "#111",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmationModal: {
    backgroundColor: "#2C2C2C",
    borderRadius: 16,
    padding: 24,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    color: "#9CA3AF",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#444",
  },
  confirmButton: {
    backgroundColor: "#FEB914",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "#000",
    fontWeight: "600",
  },
});