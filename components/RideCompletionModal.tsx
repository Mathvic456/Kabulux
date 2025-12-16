import { useRateRideEndPoint } from '@/services/ratings.services';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useRide } from '../context/RideContext';
type ViewMode = 'summary' | 'rating';
export const RideCompletionModal = () => {
  const { rideState, resetRide, rideId } = useRide();
  const { mutate: rateRide, isPending } = useRateRideEndPoint();
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const isVisible = rideState === "completed";
  const handleEndWithoutRating = async () => {
    await resetRide();
    setViewMode('summary');
    setRating(0);
    setComment('');
  };
  const handleSubmitRating = () => {
    if (!rideId) {
      Alert.alert("Error", "Missing Ride ID");
      return handleEndWithoutRating();
    }
    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a star rating.");
      return;
    }
    // Call the API Hook
    rateRide(
      {
        rideId: rideId,
        rating: rating,
        comments: comment,
        role: 'rider',
      },
      {
        onSuccess: async () => {
          await handleEndWithoutRating();
        },
      }
    );
  };
  const renderStars = () => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            activeOpacity={0.7}
          >
            <Text style={[styles.starText, star <= rating ? styles.starFilled : styles.starEmpty]}>
              {star <= rating ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  return (
    <Modal visible={isVisible} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.alertBox}>
          
          {viewMode === 'summary' && (
            <>
              <Text style={styles.alertTitle}>Ride Completed! 🏁</Text>
              <Text style={styles.alertMessage}>You have arrived at your destination.</Text>
              
              <TouchableOpacity
                style={[styles.primaryButton, { marginBottom: 15 }]}
                onPress={() => setViewMode('rating')}
              >
                <Text style={styles.primaryButtonText}>Rate your Ride</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleEndWithoutRating}
              >
                <Text style={styles.secondaryButtonText}>End</Text>
              </TouchableOpacity>
            </>
          )}
          {viewMode === 'rating' && (
            <>
              <Text style={styles.alertTitle}>How was your ride?</Text>
              
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
              <TouchableOpacity
                style={[styles.primaryButton, { marginBottom: 15 }]}
                onPress={handleSubmitRating}
                disabled={isPending}
              >
                {isPending ? (
                  <ActivityIndicator color="black" />
                ) : (
                  <Text style={styles.primaryButtonText}>Confirm Rate</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleEndWithoutRating}
                style={styles.linkButton}
                disabled={isPending}
              >
                <Text style={styles.linkText}>Skip Rating</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Containers
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    backgroundColor: "#1a1a1a",
    borderRadius: 15,
    padding: 30,
    width: "85%",
    alignItems: "center",
  },
  
  // Text
  alertTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textAlign: 'center',
  },
  alertMessage: {
    color: "#ccc",
    textAlign: "center",
    marginBottom: 25,
    fontSize: 16,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#ccc',
    marginLeft: 4,
  },
  // Buttons
  primaryButton: {
    backgroundColor: "#facc15",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: "100%",
  },
  primaryButtonText: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "#333",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: "100%",
  },
  secondaryButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  
  linkButton: {
    marginTop: 5,
    padding: 10,
  },
  linkText: {
    color: "#999",
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  // Stars
  starContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  starText: {
    fontSize: 42,
  },
  starFilled: {
    color: '#facc15',
  },
  starEmpty: {
    color: '#444',
  },
  // Inputs
  input: {
    width: '100%',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: 'white',
    marginBottom: 20,
    textAlignVertical: 'top',
    minHeight: 80,
  }
});