import { Ride, RideCard } from "@/components/RideCard";
import { RideHistoryAPIItem, useRideHistory } from "@/services/rides.service";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface BookingsScreenProps {
  setScreen: (screen: string) => void;
  setSelectedRide: (ride: any) => void;
}

const BookingsScreen: React.FC<BookingsScreenProps> = ({ setScreen, setSelectedRide }) => {
  const [activeTab, setActiveTab] = useState<"ride" | "delivery">("ride");

  const { data: rideHistoryData, isLoading, refetch, isRefetching } = useRideHistory(true);

  const transformRides = (results: RideHistoryAPIItem[]): Ride[] => {
    if (!results || !Array.isArray(results)) return [];

    return results.map((item, index) => ({
      // Use index as ID fallback since API log shows no 'id' field in results
      id: index, 
      car: "Kablux Ride", 
      date: item.start_time, // Mapping snake_case from API
      driver: item.driver,
      rating: 5, // Default
      type: "ride",
      status: item.status || "completed",
      pickupAddress: item.pickup_address, // Mapping snake_case
      dropoffAddress: item.dropoff_address, // Mapping snake_case
      fare: item.fare,
    }));
  };

  const onRefresh = () => refetch();

  // Handle data extraction safely
  const rides = rideHistoryData?.results ? transformRides(rideHistoryData.results) : [];
  
  // Filter
  const filteredRides = rides.filter((ride) => ride.type === activeTab);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f7b731" />
        <Text style={styles.loadingText}>Loading your rides...</Text>
      </View>
    );
  }

  const renderEmptyState = () => {
    const isRide = activeTab === "ride";
    return (
      <View style={styles.emptyContainer}>
        {isRide ? (
          <Ionicons name="car-outline" size={80} color="#333" />
        ) : (
          <MaterialIcons name="local-shipping" size={80} color="#333" />
        )}
        
        <Text style={styles.emptyTitle}>
          {isRide ? "No rides found" : "No deliveries found"}
        </Text>
        <Text style={styles.emptySubtitle}>
          {isRide ? "Take a trip with Kablux today" : "Send your packages with Kablux"}
        </Text>

        <TouchableOpacity 
          onPress={() => setScreen("dashboard")}
          style={styles.ctaButton}
        >
          <Text style={styles.ctaText}>
            {isRide ? "Book a Ride" : "Make a Request"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>My Activity</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab("ride")}
          style={[styles.tab, activeTab === "ride" && styles.activeTab]}
        >
          <Ionicons name="car" size={16} color={activeTab === "ride" ? "#000" : "#fff"} />
          <Text style={[styles.tabText, activeTab === "ride" && styles.activeTabText]}> Rides</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("delivery")}
          style={[styles.tab, activeTab === "delivery" && styles.activeTab]}
        >
          <MaterialIcons name="local-shipping" size={16} color={activeTab === "delivery" ? "#000" : "#fff"} />
          <Text style={[styles.tabText, activeTab === "delivery" && styles.activeTabText]}> Delivery</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor="#f7b731"
          />
        }
      >
        {filteredRides.length > 0 ? (
          filteredRides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              onPress={() => {
                setSelectedRide(ride);
                setScreen("rideDetails");
              }}
              // Removed onBookAgain logic if not strictly needed, or re-add logic here
            />
          ))
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 50,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginLeft: 20,
    marginBottom: 20,
  },
  loadingText: {
    color: "#666",
    marginTop: 15,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#111",
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#f7b731",
  },
  tabText: {
    color: "#fff",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
  },
  emptySubtitle: {
    color: "#666",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 30,
  },
  ctaButton: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    backgroundColor: "#f7b731",
    borderRadius: 25,
  },
  ctaText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default BookingsScreen;