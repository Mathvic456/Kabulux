import CentralModal from "@/components/CentralModal";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const [cards, setCards] = useState<Card[]>([]);
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
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      setCards(parsed);
      if (parsed.length) setSelectedCardId(parsed[0].id);
    } else {
      // Dummy cards logic (kept same as your code)
      const dummy: Card[] = [
        {
          id: "1",
          last4: "4242",
          brand: "visa",
          holder: "Victor Matthew",
          expiry: "09/26",
        },
        {
          id: "2",
          last4: "8842",
          brand: "mastercard",
          holder: "Victor Matthew",
          expiry: "11/25",
        },
      ];
      setCards(dummy);
      setSelectedCardId(dummy[0].id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dummy));
    }
  };

  const saveCards = async (updated: Card[]) => {
    setCards(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  /* ---------------------------------- */
  /* Card Validation Helpers */
  /* ---------------------------------- */
  const luhnCheck = (cardNum: string): boolean => {
    const digits = cardNum.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;

    let sum = 0;
    let isEven = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  const isExpiryValid = (expiryStr: string): boolean => {
    const match = expiryStr.match(/^(0[1-9]|1[0-2])\/?(\d{2})$/);
    if (!match) return false;

    const month = parseInt(match[1], 10);
    const year = parseInt(match[2], 10) + 2000;
    const now = new Date();
    const expiryDate = new Date(year, month); // First day of the month after expiry
    return expiryDate > now;
  };

  const formatCardNumber = (text: string): string => {
    const digits = text.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (text: string): string => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2);
    }
    return digits;
  };

  /* ---------------------------------- */
  /* Add new card */
  /* ---------------------------------- */
  const handleSaveCard = async () => {
    Keyboard.dismiss();

    // 1. Basic Validation
    if (!cardNumber || !expiry || !cvv || !cardName) {
      setModalState({
        visible: true,
        title: "Missing Details",
        message: "Please fill in all card information."
      });
      return;
    }

    const cleaned = cardNumber.replace(/\D/g, "");

    // 2. Luhn check
    if (!luhnCheck(cleaned)) {
      setModalState({
        visible: true,
        title: "Invalid Card",
        message: "Please enter a valid card number."
      });
      return;
    }

    // 3. Expiry format and not-expired check
    if (!isExpiryValid(expiry)) {
      setModalState({
        visible: true,
        title: "Invalid Expiry",
        message: "Card is expired or expiry format is invalid. Use MM/YY."
      });
      return;
    }

    // 4. CVV validation (3-4 digits)
    const cvvCleaned = cvv.replace(/\D/g, '');
    if (cvvCleaned.length < 3 || cvvCleaned.length > 4) {
      setModalState({
        visible: true,
        title: "Invalid CVV",
        message: "CVV must be 3 or 4 digits."
      });
      return;
    }

    // 5. Cardholder name validation
    if (cardName.trim().length < 2) {
      setModalState({
        visible: true,
        title: "Invalid Name",
        message: "Please enter the name as shown on your card."
      });
      return;
    }

    setIsLoading(true);

    try {
      const newCard: Card = {
        id: Date.now().toString(),
        last4: cleaned.slice(-4),
        brand: cleaned.startsWith("5") ? "mastercard" : "visa",
        holder: cardName.trim(),
        expiry,
      };

      // Save card locally (card tokenization happens at payment time via Paystack)
      const updated = [...cards, newCard];
      await saveCards(updated);

      setSelectedCardId(newCard.id);
      setShowAddModal(false);

      // Reset form
      setCardNumber("");
      setExpiry("");
      setCvv("");
      setCardName("");

      setModalState({
        visible: true,
        title: "Success",
        message: "Payment method added successfully."
      });

    } catch (error: any) {
      setModalState({
        visible: true,
        title: "Error",
        message: error.message || "Could not add card."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={goBack}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment Methods</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>

            {/* Saved cards */}
            <Text style={styles.sectionTitle}>Saved cards</Text>

            {cards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.cardRow,
                  selectedCardId === card.id && styles.cardRowActive,
                ]}
                onPress={() => setSelectedCardId(card.id)}
              >
                <Ionicons
                  name={card.brand === "visa" ? "card" : "card"}
                  size={28}
                  color="#FEB914"
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.cardText}>
                    •••• {card.last4}
                  </Text>
                  <Text style={styles.cardSub}>
                    {card.holder} · {card.expiry}
                  </Text>
                </View>
                {selectedCardId === card.id && (
                  <Ionicons name="checkmark-circle" size={22} color="#FEB914" />
                )}
              </TouchableOpacity>
            ))}

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
                    onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={expiry}
                    maxLength={5}
                    onChangeText={(text) => setExpiry(formatExpiry(text))}
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