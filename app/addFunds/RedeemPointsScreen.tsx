import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type RedeemPointsScreenProps = {
  goBack: () => void;
};

const RedeemPointsScreen: React.FC<RedeemPointsScreenProps> = ({ goBack }) => {
  const [isConvertModalVisible, setIsConvertModalVisible] = useState(false);
  const [pointsToConvert, setPointsToConvert] = useState("");
  const [totalPoints, setTotalPoints] = useState(4250); // Starting points
  const [conversionResult, setConversionResult] = useState({ show: false, amount: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: "" });

  // Sample points history data
  const pointsHistory = [
    {
      id: 1,
      location: "Selldragon Hotel lekki",
      date: "Oct 30 - 14:50 Completed",
      points: "50ypts",
    },
    {
      id: 2,
      location: "Victoria Island Mall",
      date: "Oct 28 - 10:30 Completed",
      points: "75ypts",
    },
    {
      id: 3,
      location: "Lekki Conservation Centre",
      date: "Oct 25 - 16:20 Completed",
      points: "60ypts",
    },
  ];

  const handleConvertPoints = () => {
    setIsConvertModalVisible(true);
  };

  const handleConversion = () => {
    const points = parseInt(pointsToConvert);
    
    if (isNaN(points) || points <= 0) {
      setErrorModal({ show: true, message: "Please enter a valid number of points to convert." });
      return;
    }
    
    if (points > totalPoints) {
      setErrorModal({ show: true, message: "You don't have enough points to convert." });
      return;
    }
    
    // Show loading state
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const convertedAmount = points * 10; // Each point is worth 10 naira
      
      // Update total points
      setTotalPoints(totalPoints - points);
      
      // Show conversion result
      setConversionResult({ show: true, amount: convertedAmount });
      
      // Reset input and close modal
      setPointsToConvert("");
      setIsConvertModalVisible(false);
      setIsLoading(false);
    }, 1500);
  };

  const closeResultModal = () => {
    setConversionResult({ show: false, amount: 0 });
  };

  const closeErrorModal = () => {
    setErrorModal({ show: false, message: "" });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={goBack}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Loyalty & Rewards</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Points Balance Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Points Balance</Text>
          <View style={styles.sectionDivider} />
          <Text style={styles.pointsBalance}>{totalPoints.toLocaleString()}ypts</Text>
          <Text style={styles.sectionTitle}>Points earning History</Text>
          <View style={styles.sectionDivider} />
        </View>

        {/* Points History Card */}
        <View style={styles.infoCard}>
          {pointsHistory.map((item, index) => (
            <View 
              key={item.id} 
              style={[
                styles.infoItem,
                index !== pointsHistory.length - 1 && styles.infoItemBorder
              ]}
            >
              <View style={styles.infoLeft}>
                <Ionicons 
                  name="calendar" 
                  size={24} 
                  color="#FEB914" 
                  style={styles.infoIcon} 
                />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoMain}>{item.location}</Text>
                  <Text style={styles.infoSub}>{item.date}</Text>
                </View>
              </View>
              <Text style={styles.infoRightText}>{item.points}</Text>
            </View>
          ))}
        </View>

        {/* How It Works Section */}
        <View style={styles.noteSection}>
          <Text style={styles.noteTitle}>How it works:</Text>
          <Text style={styles.noteItem}>
            - Each Completed ride earns 10 points for every #1000 spent.
          </Text>
          <Text style={styles.noteItem}>
            - Points can be redeemed for discounts on future rides.
          </Text>
          <Text style={styles.noteItem}>
            - Points expire after 12 months of inactivity.
          </Text>
          <Text style={styles.noteItem}>
            - Each point is valued at 10 Naira when converted.
          </Text>
        </View>

        {/* Convert Points Button */}
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleConvertPoints}
        >
          <Text style={styles.confirmButtonText}>Convert points</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Convert Points Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isConvertModalVisible}
        onRequestClose={() => setIsConvertModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Convert Points</Text>
            
            <Text style={styles.modalText}>
              Available Points: {totalPoints.toLocaleString()}ypts
            </Text>
            
            <Text style={styles.modalInfo}>
              Each point is valued at 10 Naira
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Enter points to convert"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={pointsToConvert}
              onChangeText={setPointsToConvert}
            />
            
            {pointsToConvert && !isNaN(parseInt(pointsToConvert)) && (
              <Text style={styles.conversionPreview}>
                {pointsToConvert} points = {parseInt(pointsToConvert) * 10} Naira
              </Text>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsConvertModalVisible(false)}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.convertButton, isLoading && styles.disabledButton]}
                onPress={handleConversion}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="black" />
                ) : (
                  <Text style={styles.convertButtonText}>Convert</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Conversion Result Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={conversionResult.show}
        onRequestClose={closeResultModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" style={styles.successIcon} />
            
            <Text style={styles.modalTitle}>Conversion Successful!</Text>
            
            <Text style={styles.successText}>
              Your wallet has been credited with {conversionResult.amount} Naira
            </Text>
            
            <TouchableOpacity 
              style={styles.successButton}
              onPress={closeResultModal}
            >
              <Text style={styles.successButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={errorModal.show}
        onRequestClose={closeErrorModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Ionicons name="alert-circle" size={64} color="#FF6B6B" style={styles.errorIcon} />
            
            <Text style={styles.modalTitle}>Error</Text>
            
            <Text style={styles.errorText}>
              {errorModal.message}
            </Text>
            
            <TouchableOpacity 
              style={styles.errorButton}
              onPress={closeErrorModal}
            >
              <Text style={styles.errorButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FEB914" />
            <Text style={styles.loadingText}>Processing conversion...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 40,
    backgroundColor: "black",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
    marginTop: 30,
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      android: {
        elevation: 2,
      },
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
    alignItems: "center",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: "white",
    fontWeight: "700",
    marginTop: 8,
  },
  sectionDivider: {
    width: "80%",
    height: 1,
    backgroundColor: "#FEB914",
    marginVertical: 8,
  },
  pointsBalance: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FEB914",
    marginVertical: 16,
  },
  infoCard: {
    width: "100%",
    backgroundColor: "#2C2C2C",
    borderWidth: 1,
    borderColor: "#FEB914",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  infoItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#3d3d3d",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    marginBottom: 4,
  },
  infoSub: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  infoRightText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FEB914",
  },
  noteSection: {
    width: "100%",
    backgroundColor: "#2C2C2C",
    borderWidth: 1,
    borderColor: "#4B5563",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  noteTitle: {
    fontSize: 16,
    color: "#FEB914",
    fontWeight: "600",
    marginBottom: 12,
  },
  noteItem: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 8,
    lineHeight: 20,
  },
  confirmButton: {
    width: "100%",
    backgroundColor: "#FEB914",
    borderRadius: 30,
    padding: 16,
    alignItems: "center",
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  confirmButtonText: {
    color: "black",
    fontWeight: "700",
    fontSize: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#2C2C2C",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FEB914",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginBottom: 16,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  modalInfo: {
    fontSize: 14,
    color: "#FEB914",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#1F1F1F",
    borderRadius: 10,
    padding: 16,
    color: "white",
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#4B5563",
  },
  conversionPreview: {
    fontSize: 16,
    color: "#FEB914",
    marginBottom: 20,
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#4B5563",
  },
  convertButton: {
    backgroundColor: "#FEB914",
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "600",
  },
  convertButtonText: {
    color: "black",
    fontWeight: "600",
  },
  successIcon: {
    marginBottom: 16,
  },
  errorIcon: {
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    color: "white",
    marginBottom: 24,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "white",
    marginBottom: 24,
    textAlign: "center",
  },
  successButton: {
    backgroundColor: "#FEB914",
    padding: 16,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  errorButton: {
    backgroundColor: "#FF6B6B",
    padding: 16,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  errorButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  successButtonText: {
    color: "black",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingContainer: {
    backgroundColor: "#2C2C2C",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FEB914",
  },
  loadingText: {
    color: "white",
    marginTop: 16,
    fontSize: 16,
  },
});

export default RedeemPointsScreen;