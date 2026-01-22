import CentralModal from "@/components/CentralModal";
import { useRide } from "@/context/RideContext";
import { useRideId } from "@/context/RideIdContext";
import { useRateRideEndPoint } from "@/services/ratings.services";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ViewMode = "summary" | "rating" | "success";

export const RideCompletionModal = () => {
  const { rideState, resetRide } = useRide();
  const { rideId } = useRideId();
  const { mutate: rateRide, isPending } = useRateRideEndPoint();
  const [viewMode, setViewMode] = useState<ViewMode>("summary");
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  const [errorModal, setErrorModal] = useState({ show: false, message: "" });

  const isVisible = rideState === "completed";

  const handleClose = async () => {
    if (isPending) return;

    await resetRide();
    setTimeout(() => {
      setViewMode("summary");
      setRating(0);
      setComment("");
    }, 300);
  };

  const handleSubmitRating = () => {
    if (!rideId) {
      setErrorModal({
        show: true,
        message: "Missing Ride ID. Cannot submit rating.",
      });
      return;
    }

    if (rating === 0) {
      Alert.alert(
        "Rating Required",
        "Please tap the stars to rate your driver.",
      );
      return;
    }

    rateRide(
      {
        rideId: rideId,
        rating: rating,
        comments: comment,
        role: "rider",
      },
      {
        onSuccess: () => {
          setViewMode("success");
        },
        onError: (error: any) => {
          const msg =
            error.response?.data?.message ||
            "Failed to submit rating. Please try again.";
          setErrorModal({ show: true, message: msg });
        },
      },
    );
  };

  const renderStars = () => (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => setRating(star)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.starText,
              star <= rating ? styles.starFilled : styles.starEmpty,
            ]}
          >
            {star <= rating ? "★" : "☆"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const getModalProps = () => {
    switch (viewMode) {
      case "summary":
        return {
          title: "Ride Completed! 🏁",
          subText: "You have arrived at your destination.",
          icon: "flag" as const,
          confirmText: "Rate your Ride",
          onConfirm: () => setViewMode("rating"),
          closeText: "End",
          showClose: true,
          themeColor: "#FEB914",
        };
      case "rating":
        return {
          title: "How was your ride?",
          subText: "",
          icon: "star" as const,
          confirmText: isPending ? "Submitting..." : "Submit Rating",
          onConfirm: handleSubmitRating,
          closeText: "Skip",
          showClose: true,
          themeColor: "#FEB914",
        };
      case "success":
        return {
          title: "Rating Submitted!",
          subText: "Thanks for your feedback.",
          icon: "checkmark-circle" as const,
          confirmText: "Done",
          onConfirm: handleClose,
          closeText: "",
          showClose: false,
          themeColor: "#4CAF50",
        };
    }
  };

  const modalConfig = getModalProps();

  return (
    <>
      {/* Main Logic Modal */}
      <CentralModal
        visible={isVisible}
        onClose={handleClose}
        title={modalConfig.title}
        subText={modalConfig.subText}
        icon={modalConfig.icon}
        themeColor={modalConfig.themeColor}
        contentMode={viewMode === "rating" ? "custom" : "default"}
        // Buttons
        onConfirm={modalConfig.onConfirm}
        confirmText={modalConfig.confirmText}
        closeText={modalConfig.closeText}
      >
        {viewMode === "rating" && (
          <View style={{ width: "100%", alignItems: "center" }}>
            {renderStars()}

            <Text style={styles.label}>Comments (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="The driver was..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
              value={comment}
              onChangeText={setComment}
            />
          </View>
        )}
      </CentralModal>

      <CentralModal
        visible={errorModal.show}
        onClose={() => setErrorModal({ show: false, message: "" })}
        title="Error"
        subText={errorModal.message}
        icon="alert-circle"
        themeColor="#FF6B6B"
        confirmText="Try Again"
        onConfirm={() => setErrorModal({ show: false, message: "" })}
        closeText="Close"
      />
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#ccc",
    marginLeft: 4,
    marginTop: 10,
  },
  starContainer: {
    flexDirection: "row",
    marginBottom: 10,
    gap: 8,
    justifyContent: "center",
  },
  starText: {
    fontSize: 42,
  },
  starFilled: {
    color: "#FEB914",
  },
  starEmpty: {
    color: "#444",
  },
  input: {
    width: "100%",
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: "white",
    marginBottom: 10,
    textAlignVertical: "top",
    minHeight: 80,
  },
});
