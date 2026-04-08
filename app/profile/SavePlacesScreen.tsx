import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type AddressType = "home" | "work" | "place";

interface SavedAddress {
  id?: string;
  type?: AddressType;
  name: string;
  address: string;
  description: string;
}

interface ModalState {
  type: AddressType;
  name: string;       // only editable when type === 'place'
  address: string;
  description: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_MODAL: ModalState = { type: "home", name: "", address: "", description: "" };

const getModalTitle = (type: AddressType) => {
  if (type === "home") return "Add Home Address";
  if (type === "work") return "Add Work Address";
  return "Add a New Place";
};

// Fixed name for home/work; user-defined for 'place'
const resolvedName = (type: AddressType, customName: string) => {
  if (type === "home") return "Home";
  if (type === "work") return "Work";
  return customName.trim();
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SavedPlacesScreen({
  goBack,
}: {
  goBack: () => void;
  next?: () => void; // kept in signature for API compatibility, intentionally unused
}) {
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modal, setModal] = useState<ModalState>(DEFAULT_MODAL);
  const [isSaving, setIsSaving] = useState(false);

  // ── Modal helpers ────────────────────────────────────────────────────────

  const openModal = (type: AddressType) => {
    setModal({ ...DEFAULT_MODAL, type });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModal(DEFAULT_MODAL);
  };

  const updateModal = (field: keyof ModalState, value: string) =>
    setModal((prev) => ({ ...prev, [field]: value }));

  // ── Save ─────────────────────────────────────────────────────────────────

  const saveAddress = async () => {
    const name = resolvedName(modal.type, modal.name);
    if (!modal.address.trim() || (modal.type === "place" && !name)) return;

    const newAddress: SavedAddress = {
      name,
      address: modal.address.trim(),
      description: modal.description.trim(),
    };

    try {
      setIsSaving(true);
      await api.post("/users/add_save_place/", newAddress);
      setSavedAddresses((prev) => [...prev, { ...newAddress, type: modal.type, id: Date.now().toString() }]);
      closeModal();
    } catch (error) {
      console.error("Failed to save address:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  // FIX: these now work correctly because `type` is saved on each address

  const homeAddress = savedAddresses.find((a) => a.type === "home");
  const workAddress = savedAddresses.find((a) => a.type === "work");
  const otherAddresses = savedAddresses.filter((a) => a.type === "place");

  // ── Row renderers (eliminates repeated JSX) ────────────────────────────────

  const renderSavedRow = (
    place: SavedAddress,
    iconName: React.ComponentProps<typeof Ionicons>["name"]
  ) => (
    <TouchableOpacity
      key={place.id}
      style={styles.infoItem}
      onPress={() => { }} // replace with your navigation/selection logic
      activeOpacity={0.7}
    >
      <View style={styles.infoLeft}>
        <Ionicons name={iconName} size={24} color="#FEB914" style={styles.infoIcon} />
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoMain}>{place.name}</Text>
          <Text style={styles.infoSub}>{place.address}</Text>
          {!!place.description && (
            <Text style={styles.infoDesc}>{place.description}</Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#FEB914" />
    </TouchableOpacity>
  );

  const renderAddRow = (
    label: string,
    iconName: React.ComponentProps<typeof Ionicons>["name"],
    type: AddressType
  ) => (
    <TouchableOpacity
      style={styles.infoItem}
      onPress={() => openModal(type)}
      activeOpacity={0.7}
    >
      <View style={styles.infoLeft}>
        <Ionicons name={iconName} size={24} color="#FEB914" style={styles.infoIcon} />
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoMain}>{label}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#FEB914" />
    </TouchableOpacity>
  );

  // ── Save button guard ─────────────────────────────────────────────────────

  const isSaveDisabled =
    isSaving ||
    !modal.address.trim() ||
    (modal.type === "place" && !modal.name.trim());

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Places</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Favourites */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Favourites</Text>
        </View>

        <View style={styles.infoCard}>
          {homeAddress
            ? renderSavedRow(homeAddress, "home")
            : renderAddRow("Add Home", "home-outline", "home")}

          {workAddress
            ? renderSavedRow(workAddress, "business")
            : renderAddRow("Add Work", "business-outline", "work")}
        </View>

        {/* Other Places */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Other Places</Text>
          <Text style={styles.sectionSubtitle}>
            Get to your favourite destinations faster
          </Text>
        </View>

        <View style={styles.infoCard}>
          {otherAddresses.map((place) => renderSavedRow(place, "location"))}
          {renderAddRow("Add a place", "add-circle-outline", "place")}
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>{getModalTitle(modal.type)}</Text>

              {/* Name field — only for custom places */}
              {modal.type === "place" && (
                <TextInput
                  style={[styles.input, styles.inputSingle]}
                  onChangeText={(v) => updateModal("name", v)}
                  value={modal.name}
                  placeholder="Place name (e.g. Gym, School)"
                  placeholderTextColor="#9CA3AF"
                />
              )}

              <TextInput
                style={[styles.input, styles.inputSingle]}
                onChangeText={(v) => updateModal("address", v)}
                value={modal.address}
                placeholder="Enter address"
                placeholderTextColor="#9CA3AF"
              />

              {/* FIX: Description field added */}
              <TextInput
                style={[styles.input, styles.inputMulti]}
                onChangeText={(v) => updateModal("description", v)}
                value={modal.description}
                placeholder="Description (optional)"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={closeModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.saveButton,
                    isSaveDisabled && styles.saveButtonDisabled,
                  ]}
                  onPress={saveAddress}
                  disabled={isSaveDisabled}
                >
                  <Text style={styles.saveButtonText}>
                    {isSaving ? "Saving..." : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: Platform.OS === "android" ? 16 : 40,
    backgroundColor: "black",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
    marginTop: 30,
    ...Platform.select({
      android: { elevation: 4 },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
    }),
  },
  headerTitle: {
    fontSize: 20,
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  sectionHeader: {
    width: "100%",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: "white",
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  infoCard: {
    backgroundColor: "#2C2C2C",
    borderWidth: 1,
    borderColor: "#FEB914",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    minHeight: 60,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoIcon: {
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoMain: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  infoSub: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  infoDesc: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalView: {
    width: "85%",
    backgroundColor: "#2C2C2C",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FEB914",
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 15,
    color: "white",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FEB914",
  },
  inputSingle: {
    height: 50,
  },
  inputMulti: {
    minHeight: 90,
    textAlignVertical: "top",
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    borderRadius: 10,
    padding: 15,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FEB914",
  },
  saveButton: {
    backgroundColor: "#FEB914",
    marginLeft: 15,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  cancelButtonText: {
    color: "#FEB914",
    fontWeight: "bold",
  },
  saveButtonText: {
    color: "black",
    fontWeight: "bold",
  },
});