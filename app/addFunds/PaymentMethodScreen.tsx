import CentralModal from "@/components/CentralModal";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

type Card = {
  id: string;
  last4: string;
  brand: "visa" | "mastercard";
  holder: string;
  expiry: string;
};

const STORAGE_KEY = "@saved_cards";

export default function PaymentMethodScreen({ goBack, next }: any) {
  // const [cards, setCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const [modalState, setModalState] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: "", message: "" });

  /* ---------------------------------- */
  /* Load saved cards */
  /* ---------------------------------- */
  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {


  };

  const saveCards = async (updated: Card[]) => {

  };

  const handleSaveCard = async () => {
    Keyboard.dismiss();
    return;
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={goBack}>
              <Ionicons name="arrow-back" size={20} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment Methods</Text>
            <View />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>

            {/* Saved cards */}
            <Text style={styles.sectionTitle}>Saved cards</Text>



            {/* Add new card */}
            <TouchableOpacity
              style={styles.addCardButton}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add-circle" size={22} color="#FEB914" />
              <Text style={styles.addCardText}>Add new card</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Add Card Modal */}
          <Modal transparent animationType="slide" visible={showAddModal}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Add card</Text>

                  <TextInput
                    style={styles.input}
                    placeholder="Card number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={cardNumber}
                    maxLength={19}
                    onChangeText={(text) => setCardNumber(text)}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={expiry}
                    maxLength={5}
                    onChangeText={(text) => setExpiry(text)}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="CVV"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    secureTextEntry
                    value={cvv}
                    maxLength={4}
                    onChangeText={(text) => setCvv(text.replace(/\D/g, ''))}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Name on card"
                    placeholderTextColor="#9CA3AF"
                    value={cardName}
                    onChangeText={setCardName}
                  />

                  <TouchableOpacity
                    style={[styles.saveButton, isLoading && { opacity: 0.7 }]}
                    onPress={handleSaveCard}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="black" />
                    ) : (
                      <Text style={styles.saveButtonText}>Save card</Text>
                    )}
                  </TouchableOpacity>

                  {/* Optional Cancel Button */}
                  <TouchableOpacity
                    style={{ marginTop: 15 }}
                    onPress={() => !isLoading && setShowAddModal(false)}
                  >
                    <Text style={{ color: '#9CA3AF', textAlign: 'center' }}>Cancel</Text>
                  </TouchableOpacity>

                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </SafeAreaView>
      </TouchableWithoutFeedback>
      <CentralModal
        visible={modalState.visible}
        title={modalState.title}
        subText={modalState.message}
        onClose={() => setModalState({ visible: false, title: "", message: "" })}
      />
    </>

  );
}

// Styles remain exactly the same as your code...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginTop: 25,
    justifyContent: "space-between",
  },
  backButton: {
    backgroundColor: "white",
    borderRadius: 20,
    height: 36,
    width: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "600",
    marginLeft: 16,
  },
  scrollContent: { padding: 16 },
  sectionTitle: {
    color: "#FEB914",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2C",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 12,
  },
  cardRowActive: {
    borderColor: "#FEB914",
  },
  cardText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cardSub: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  addCardButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 8,
  },
  addCardText: {
    color: "#FEB914",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#2C2C2C",
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: "#FEB914",
  },
  modalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#1E1E1E",
    borderRadius: 999,
    padding: 14,
    color: "white",
    borderWidth: 1,
    borderColor: "#FEB914",
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: "#FEB914",
    borderRadius: 999,
    padding: 16,
    marginTop: 12,
  },
  saveButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});