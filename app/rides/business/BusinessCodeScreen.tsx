import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function BusinessCodeScreen({ goBack, setScreen }: { goBack: () => void; setScreen: (screen: string) => void }) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (code.length !== 8) {
      // You could add validation feedback here
      return;
    }

    // Start loading
    setIsLoading(true);

    // Simulate API call or validation process
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      
      // After successful validation, navigate to the next screen
      setScreen("businessRideSelect"); // Replace with your target screen name
    } catch (error) {
      console.error("Error validating code:", error);
      // Handle error (show message, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          <Text style={{ color: "#FEB914" }}>KabLux</Text>{" "}
          <Text style={{ color: "#fff" }}>Business</Text>
        </Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Enter your KabLux business code</Text>
      <View style={styles.divider} />

      {/* Input */}
      <View style={styles.inputContainer}>
        <Feather name="lock" size={18} color="#fff" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Enter your 8 digit code"
          placeholderTextColor="#aaa"
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
          maxLength={8}
          editable={!isLoading}
        />
      </View>

      {/* How it works */}
      <View style={styles.infoSection}>
        <Text style={styles.infoHeader}>How it works:</Text>
        <Text style={styles.infoText}>
          • Each employee is given a special code linked to special wallet
        </Text>
        <Text style={styles.infoText}>
          • Mileage is calculated and summed at the end of the month
        </Text>
      </View>

      {/* Confirm Button */}
      <TouchableOpacity 
        style={[
          styles.confirmButton, 
          (isLoading || code.length !== 8) && styles.confirmButtonDisabled
        ]}
        onPress={handleConfirm}
        disabled={isLoading || code.length !== 8}
      >
        {isLoading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.confirmText}>Confirm</Text>
        )}
      </TouchableOpacity>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FEB914" />
            <Text style={styles.loadingText}>Verifying your code...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 50,
    paddingHorizontal: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  title: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  divider: {
    // height: 2,
    // backgroundColor: "#FEB914",
    // marginHorizontal: 40,
    // marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    paddingVertical: 10,
  },
  infoSection: {
    marginBottom: 40,
  },
  infoHeader: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },
  infoText: {
    color: "#aaa",
    fontSize: 13,
    marginBottom: 5,
  },
  confirmButton: {
    backgroundColor: "#FEB914",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#666",
    opacity: 0.7,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  // Loading styles
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingContainer: {
    backgroundColor: "#1c1c1c",
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 15,
  },
});