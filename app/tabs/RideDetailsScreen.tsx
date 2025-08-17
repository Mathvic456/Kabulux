import { Ionicons } from "@expo/vector-icons"; // or react-native-vector-icons
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const RideDetailsScreen = ({ ride, goBack }: { ride: any; goBack: () => void }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Ride Image */}
        <Image source={ride.image} style={styles.carImage} />

        {/* Ride Info */}
        <View style={styles.card}>
          <Text style={styles.label}>Car</Text>
          <Text style={styles.value}>{ride.car}</Text>

          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{ride.date}</Text>

          <Text style={styles.label}>Driver</Text>
          <Text style={styles.value}>{ride.driver}</Text>

          <Text style={styles.label}>Status</Text>
          <Text style={styles.status}>Completed</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            {[...Array(ride.rating)].map((_, i) => (
              <Ionicons key={i} name="star" size={20} color="gold" />
            ))}
          </View>
        </View>

        {/* Book Again Button */}
        <TouchableOpacity style={styles.bookButton}>
          <Ionicons name="refresh" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.bookButtonText}>Book Again</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default RideDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#111",
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  scrollContent: {
    alignItems: "center",
    padding: 20,
  },
  carImage: {
    width: 200,
    height: 120,
    resizeMode: "contain",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFD70033",
  },
  label: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 8,
  },
  value: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  status: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  bookButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});
