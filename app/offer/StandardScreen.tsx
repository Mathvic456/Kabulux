import { useBookStandard } from "@/services/bookStandard";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- Interfaces remain the same ---
interface RideData {
  name: string;
  details: string;
  price: string;
  rawPrice?: number;
  originalPrice?: string | null;
  carType: string;
  passengers: number;
  rideId: string;
  rideDetails: {
    pickup: {
      pickupLat: number;
      pickupLong: number;
    };
    destination: {
      dropoffLat: number;
      dropoffLong: number;
    };
    estimated_distance: string;
    estimated_duration: string;
    car_type: string;
    estimated_fare: number;
  };
  ride_request_id: string;
}

interface StandardScreenProps {
  goBack: () => void;
  next: () => void;
  rideData?: RideData;
}
// ------------------------------------

export default function StandardScreen({ goBack, next, rideData }: StandardScreenProps) {
  
  // --- Price Logic (Kept the functional changes from before) ---
const getBasePrice = () => {
    if (!rideData) return 0;
    
    // Force Number() here
    if (rideData.rawPrice) {
      return Number(rideData.rawPrice); 
    }
    
    // Force Number() here too
    if (rideData.rideDetails?.estimated_fare) {
      return Number(rideData.rideDetails.estimated_fare);
    }

    const extractPrice = (priceString: string) => parseFloat(priceString.replace(/[₦,]/g, '')) || 0;
    return extractPrice(rideData.price);
  };

  const basePrice = getBasePrice();
  const [riderOffer, setRiderOffer] = useState<number>(basePrice);
  const { mutate: bookStandard, isPending } = useBookStandard();

  useEffect(() => {
    setRiderOffer(basePrice);
  }, [basePrice]);

  useEffect(() => {
    console.log(riderOffer)
  }, [riderOffer])

  const handleIncreasePrice = () => {
    setRiderOffer(prev => prev + 50);
  };

  const handleDecreasePrice = () => {
    if (riderOffer > basePrice) {
      setRiderOffer(prev => {
        const newOffer = prev - 50;
        return newOffer < basePrice ? basePrice : newOffer;
      });
    }
  };

  const handleSubmitOffer = () => {
    if (riderOffer < basePrice) {
      Alert.alert(
        "Invalid Offer", 
        "Your offer cannot be lower than the estimated price."
      );
      return;
    }
    const offerToSend = riderOffer;

    bookStandard(
      { rider_offer: offerToSend }, 
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

  const formatPrice = (price: number) => {
    return `₦${Math.floor(price).toLocaleString()}`;
  };

  const canDecrease = riderOffer > basePrice;
  const isValidOffer = riderOffer >= basePrice;
  
  // Helper to format duration minutes into a cleaner format
  const formatDuration = (durationString: string) => {
    const minutes = parseFloat(durationString.split(' ')[0]);
    if (isNaN(minutes)) return durationString;
    
    if (minutes < 60) return `${Math.round(minutes)} min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    
    return `${hours} hr ${remainingMinutes} min`;
  }
  // ------------------------------------


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Ride</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Ride Details Card */}
        {rideData && (
          <View style={styles.rideCard}>
            <View style={styles.rideCardHeader}>
              <MaterialCommunityIcons name="car-multiple" size={32} color="#f6a623" />
              <View style={styles.rideCardHeaderText}>
                <Text style={styles.rideCardTitle}>{rideData.name}</Text>
                <Text style={styles.rideCardSubtitle}>
                    {rideData.carType} | Max {rideData.passengers} Passengers
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Trip Details Grid */}
            <View style={styles.detailsGrid}>
              
              {/* Distance */}
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Feather name="navigation" size={20} color="#f6a623" />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Distance</Text>
                  <Text style={styles.detailValue}>
                    {Math.round(parseFloat(rideData.rideDetails.estimated_distance.split(' ')[0]))} km
                  </Text>
                </View>
              </View>

              {/* Duration */}
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Feather name="clock" size={20} color="#f6a623" />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Estimated Time</Text>
                  <Text style={styles.detailValue}>
                    {formatDuration(rideData.rideDetails.estimated_duration)}
                  </Text>
                </View>
              </View>
            </View>
             
            <View style={{ marginTop: 20 }}>
                <Text style={styles.infoTextTitle}>Ride Details</Text>
                <Text style={styles.infoTextDescription}>
                    The price shown is the estimated fare for a **{rideData.carType}** covering approximately **{Math.round(parseFloat(rideData.rideDetails.estimated_distance.split(' ')[0]))} km**. 
                    Increasing your offer improves your chances of a faster acceptance.
                </Text>
            </View>
          </View>
        )}

        {/* Price Adjustment Section */}
        <View style={styles.priceSection}>
          <View style={styles.priceSectionHeader}>
            <Feather name="dollar-sign" size={24} color="#f6a623" />
            <Text style={styles.priceSectionTitle}>Set Your Offer</Text>
          </View>
          
          <Text style={styles.priceSectionSubtitle}>
            Base Price (Estimated): <Text style={{ color: '#fff', fontWeight: 'bold' }}>{formatPrice(basePrice)}</Text>
          </Text>

          <View style={styles.priceAdjustContainer}>
            <TouchableOpacity 
              style={[
                styles.priceButton, 
                !canDecrease && styles.priceButtonDisabled
              ]}
              onPress={handleDecreasePrice}
              disabled={!canDecrease || isPending}
            >
              <Feather 
                name="minus" 
                size={30} 
                color={canDecrease ? "white" : "#555"} 
              />
            </TouchableOpacity>

            <View style={styles.priceDisplay}>
              <Text style={styles.priceAmount}>{formatPrice(riderOffer)}</Text>
              {riderOffer > basePrice ? (
                <Text style={styles.priceIncrease}>
                  +{formatPrice(riderOffer - basePrice)} Boost
                </Text>
              ) : (
                <Text style={styles.priceIncreasePlaceholder}>
                    Base Offer
                </Text>
              )}
            </View>

            <TouchableOpacity 
              style={styles.priceButton}
              onPress={handleIncreasePrice}
              disabled={isPending}
            >
              <Feather name="plus" size={30} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={styles.incrementText}>Tap +/- to adjust offer by ₦50</Text>

          {!isValidOffer && (
            <View style={styles.warningBanner}>
              <Feather name="alert-circle" size={16} color="#ff6b6b" />
              <Text style={styles.warningText}>
                Offer cannot be lower than the estimated base price
              </Text>
            </View>
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Feather name="zap" size={18} color="#4CAF50" />
            <Text style={styles.infoText}>
              **Higher offers** are prioritized by nearby drivers.
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="check-circle" size={18} color="#4CAF50" />
            <Text style={styles.infoText}>
              You'll be notified immediately when a driver accepts your bid.
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { 
              backgroundColor: isValidOffer && !isPending ? "#f6a623" : "#555",
              opacity: isValidOffer && !isPending ? 1 : 0.7
            },
          ]}
          onPress={handleSubmitOffer}
          disabled={isPending || !isValidOffer}
        >
          {isPending ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.submitButtonText}>Sending Offer...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.submitButtonText}>Find Drivers</Text>
              <Feather name="send" size={20} color="white" style={{ marginLeft: 8 }} />
            </>
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
    borderBottomWidth: 1,
    borderBottomColor: "#2b2b2b",
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
  rideCard: {
    backgroundColor: "#1c1c1c",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2b2b2b",
  },
  rideCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  rideCardHeaderText: {
    marginLeft: 15,
    flex: 1,
  },
  rideCardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f6a623", // Highlight the title
    marginBottom: 2,
  },
  rideCardSubtitle: {
    fontSize: 14,
    color: "#aaa",
  },
  divider: {
    height: 1,
    backgroundColor: "#2b2b2b",
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    backgroundColor: "#252525",
    padding: 15,
    borderRadius: 15,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(246, 166, 35, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: "white",
    fontWeight: "700",
  },
  infoTextTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  infoTextDescription: {
    fontSize: 13,
    color: '#aaa',
    lineHeight: 18,
  },
  priceSection: {
    backgroundColor: "#1c1c1c",
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#f6a623",
  },
  priceSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  priceSectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginLeft: 10,
  },
  priceSectionSubtitle: {
    fontSize: 15,
    color: "#aaa",
    marginBottom: 25,
  },
  priceAdjustContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  priceButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#f6a623",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#f6a623",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  priceButtonDisabled: {
    backgroundColor: "#333",
    shadowOpacity: 0,
  },
  priceDisplay: {
    alignItems: "center",
    flex: 1,
  },
  priceAmount: {
    fontSize: 42,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  priceIncrease: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "700",
  },
  priceIncreasePlaceholder: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  incrementText: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 5,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 107, 0.15)",
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
  },
  warningText: {
    fontSize: 13,
    color: "#ff6b6b",
    marginLeft: 8,
    flex: 1,
  },
  infoCard: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 15,
    padding: 18,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#aaa",
    marginLeft: 10,
    flex: 1,
  },
  submitButton: {
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#f6a623",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});