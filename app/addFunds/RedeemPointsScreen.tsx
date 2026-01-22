import CentralModal from "@/components/CentralModal";
import { useRedeemRewards, useRiderAnalytics } from "@/services/riderAnalytics.service";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RedeemPointsScreenProps = {
  goBack: () => void;
};

const RedeemPointsScreen: React.FC<RedeemPointsScreenProps> = ({ goBack }) => {
  const [isConvertModalVisible, setIsConvertModalVisible] = useState(false);
  const [pointsToConvert, setPointsToConvert] = useState("");
  const [conversionResult, setConversionResult] = useState({
    show: false,
    amount: 0,
  });
  const [errorModal, setErrorModal] = useState({ show: false, message: "" });

  const {
    data: riderAnalyticsData,
    isLoading: analyticsIsLoading,
    isError,
  } = useRiderAnalytics();
  const { mutate: redeem, isPending: redeemIsLoading } = useRedeemRewards();

  const totalPoints = riderAnalyticsData?.total_points || 0;

  const handleConvertPoints = () => {
    setIsConvertModalVisible(true);
  };

  const handleConversion = () => {
    // 1. Trigger the mutation
    redeem(undefined, {
      onSuccess: (response) => {
        setIsConvertModalVisible(false);

        setConversionResult({
          show: true,
          amount: response?.converted_amount || totalPoints * 10,
        });
      },
      onError: (error: any) => {
        setIsConvertModalVisible(false);
        const serverMessage =
          error.response?.data?.message ||
          "Failed to convert points. Please try again.";
        setErrorModal({ show: true, message: serverMessage });
      },
    });
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
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
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
          <Text style={styles.pointsBalance}>
            {analyticsIsLoading ? 0 : totalPoints.toLocaleString()} points
          </Text>
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

      <CentralModal
        visible={isConvertModalVisible}
        onClose={() => setIsConvertModalVisible(false)}
        title="Convert Points"
        subText={`Available Points: ${totalPoints.toLocaleString()} points`}
        icon="swap-horizontal"
        contentMode="custom"
        onConfirm={handleConversion}
        confirmText={redeemIsLoading ? "Converting..." : "Convert"}
        closeText="Cancel"
        themeColor="#FEB914"
      >
        <Text
          style={{
            fontSize: 14,
            color: "#aaa",
            textAlign: "center",
            marginTop: 10,
          }}
        >
          You are about to convert all your loyalty points into wallet credit.
        </Text>
      </CentralModal>

      {/* 2. Success Modal */}
      <CentralModal
        visible={conversionResult.show}
        onClose={closeResultModal}
        title="Conversion Successful!"
        subText={`You have successfully converted your points into ₦${conversionResult.amount.toLocaleString()}.`}
        icon="checkmark-circle"
        themeColor="#4BB543" // Success Green
        confirmText="Great!"
        onConfirm={closeResultModal}
      />

      {/* 3. Error Modal */}
      <CentralModal
        visible={errorModal.show}
        onClose={closeErrorModal}
        title="Conversion Failed"
        subText={errorModal.message}
        icon="alert-circle"
        themeColor="#FF6B6B" // Error Red
        confirmText="Try Again"
        onConfirm={closeErrorModal}
      />
    </SafeAreaView>
  );
};

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
    paddingTop: Platform.OS === "android" ? 16 : 40,
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
