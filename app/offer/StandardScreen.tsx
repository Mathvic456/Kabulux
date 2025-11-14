import { useBookStandard } from "@/services/bookStandard";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface StandardScreenProps {
  goBack: () => void;
  next: () => void;
}

export default function StandardScreen({ goBack, next }: StandardScreenProps) {
  const [riderOffer, setRiderOffer] = useState<string>("");
  const { mutate: bookStandard, isPending } = useBookStandard();

  const handleSubmitOffer = () => {
    if (!riderOffer.trim()) {
      Alert.alert("Error", "Please enter an offer amount");
      return;
    }

    const offerAmount = parseFloat(riderOffer);
    if (isNaN(offerAmount) || offerAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    bookStandard(
      { rider_offer: offerAmount },
      {
        onSuccess: () => {
          Alert.alert(
            "Success",
            "Your offer has been sent to the driver!",
            [{ text: "OK", onPress: next }]
          );
        },
        onError: (error: any) => {
          Alert.alert(
            "Error",
            error.message || "Failed to submit offer. Please try again."
          );
        },
      }
    );

    
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Your Offer</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Feather name="info" size={24} color="#f6a623" />
          <Text style={styles.infoTitle}>Make Your Offer</Text>
        </View>

        {/* Offer Input Section */}
        <View style={styles.offerSection}>
          <Text style={styles.label}>Enter Your Offer Amount (₦)</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>₦</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
              value={riderOffer}
              onChangeText={setRiderOffer}
              editable={!isPending}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: riderOffer.trim() ? "#f6a623" : "#555" },
          ]}
          onPress={handleSubmitOffer}
          disabled={isPending || !riderOffer.trim()}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Send Offer</Text>
          )}
        </TouchableOpacity>



        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1c1c1c",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
    backgroundColor: "#2b2b2b",
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  infoCard: {
    backgroundColor: "#1c1c1c",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#f6a623",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 20,
  },
  offerSection: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1c",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f6a623",
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    paddingVertical: 15,
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    fontStyle: "italic",
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 30,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  tipsSection: {
    backgroundColor: "#1c1c1c",
    borderRadius: 15,
    padding: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: "#aaa",
    marginLeft: 12,
  },
});