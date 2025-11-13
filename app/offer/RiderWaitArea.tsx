import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SocketContext } from "../../context/WebSocketProvider";

interface DriverOffer {
  driver_name: string;
  offer: number;
}

const FARE_DIVISION_FACTOR = 100;

const DriverOfferCard = ({ item }: { item: DriverOffer }) => {
  const displayOffer = item.offer / FARE_DIVISION_FACTOR;
  const displayRating = "4.8";
  const displayTime = 5;

  const handleSelectDriver = () => {
    console.log(
      `Rider selected driver: ${item.driver_name} with offer ₦${displayOffer}`
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="person-circle" size={40} color="#facc15" />
        <View style={styles.driverDetails}>
          <Text style={styles.driverName}>{item.driver_name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#facc15" />
            <Text style={styles.ratingText}>{displayRating}</Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>COUNTER</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Feather name="clock" size={16} color="#999" />
        <Text style={styles.infoLabel}>Time to Pickup:</Text>
        <Text style={styles.infoValue}>{displayTime} mins</Text>
      </View>
      <View style={styles.infoRow}>
        <MaterialCommunityIcons name="car" size={16} color="#999" />
        <Text style={styles.infoLabel}>Vehicle:</Text>
        <Text style={styles.infoValue}>Standard Sedan</Text>
      </View>

      <View style={styles.fareContainer}>
        <Text style={styles.fareLabel}>Driver's Offer:</Text>
        <Text style={styles.fareValue}>₦{displayOffer.toLocaleString()}</Text>
      </View>

      <TouchableOpacity
        style={styles.selectButton}
        onPress={handleSelectDriver}
      >
        <Text style={styles.selectButtonText}>Select This Driver</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function RiderWaitArea() {
  const navigation = useNavigation();
  const { driverResponses, isConnected, clearDriverResponses } =
    useContext(SocketContext);

  const [isSearching, setIsSearching] = useState(true);

  useEffect(() => {
    if (driverResponses.length > 0) {
      setIsSearching(false);
      return;
    }
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [driverResponses.length]);

  const handleCancelRide = () => {
    clearDriverResponses();
    console.log("Ride Cancelled by Rider");
    navigation.goBack();
  };

  const DisplayList = () => {
    if (isSearching) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#facc15" />
          <Text style={styles.loadingText}>Searching for drivers...</Text>
          <Text style={styles.subText}>Waiting for counter offers.</Text>
        </View>
      );
    }

    if (driverResponses.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#999" />
          <Text style={styles.noOffersText}>No Driver Responses Yet</Text>
          <Text style={styles.subText}>
            Try increasing your offer or waiting a bit longer.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={driverResponses}
        keyExtractor={(item) => item.driver_name}
        renderItem={({ item }) => <DriverOfferCard item={item} />}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Responses</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.statusSection}>
        <View
          style={[
            styles.statusDot,
            isConnected ? styles.onlineDot : styles.offlineDot,
          ]}
        />
        <Text style={styles.statusInfo}>
          {isConnected ? "Connected to server" : "Reconnecting..."}
        </Text>
        {driverResponses.length > 0 && (
          <Text style={styles.responseCount}>
            {driverResponses.length} Responses
          </Text>
        )}
      </View>

      <DisplayList />

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={handleCancelRide}
        disabled={false}
      >
        <Text style={styles.cancelButtonText}>Cancel Ride</Text>
      </TouchableOpacity>
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
  statusSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#111",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  onlineDot: {
    backgroundColor: "#4CAF50",
  },
  offlineDot: {
    backgroundColor: "#f44336",
  },
  statusInfo: {
    color: "#aaa",
    fontSize: 14,
    flex: 1,
  },
  responseCount: {
    color: "#facc15",
    fontSize: 14,
    fontWeight: "bold",
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#1c1c1c",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#333",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  driverDetails: {
    marginLeft: 15,
    flex: 1,
  },
  driverName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    color: "#facc15",
    fontSize: 14,
    marginLeft: 4,
    fontWeight: "600",
  },
  statusBadge: {
    backgroundColor: "#f6a623",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    color: "black",
    fontSize: 12,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
    marginVertical: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    color: "#999",
    fontSize: 14,
    marginLeft: 8,
    marginRight: 4,
  },
  infoValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  fareContainer: {
    marginTop: 15,
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  fareLabel: {
    color: "#999",
    fontSize: 14,
    marginBottom: 4,
  },
  fareValue: {
    color: "#4CAF50",
    fontSize: 24,
    fontWeight: "bold",
  },
  selectButton: {
    backgroundColor: "#facc15",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 15,
  },
  selectButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#d32f2f",
    paddingVertical: 18,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
  },
  noOffersText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
  },
  subText: {
    color: "#666",
    fontSize: 14,
    marginTop: 5,
  },
});
