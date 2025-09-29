import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
// import { api } from ""; // Adjust the import path
import { api } from "@/services/api";


interface Ride {
  id: number;
  car: string;
  date: string;
  driver: string;
  rating: number;
  image: any;
  type: "ride" | "delivery";
  status: string;
  // Add other fields that match your backend response
}

interface RideCardProps {
  ride: Ride;
  setScreen: (screen: string) => void;
  setSelectedRide: (ride: Ride) => void;
}

const RideCard: React.FC<RideCardProps> = ({ ride, setScreen, setSelectedRide }) => {
  return (
    <TouchableOpacity
      onPress={() => {
        setSelectedRide(ride);
        setScreen("rideDetails");
      }}
      activeOpacity={0.8}
    >
      <View
        style={{
          backgroundColor: "#111",
          marginHorizontal: 15,
          marginVertical: 8,
          padding: 12,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: "#FFD700",
        }}
      >
        {/* Top Row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <View
            style={{
              backgroundColor: "#000",
              paddingHorizontal: 12,
              paddingVertical: 3,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#FFD700",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12 }}>
              {ride.status || "completed"}
            </Text>
          </View>
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons name="autorenew" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, marginLeft: 5 }}>Book again</Text>
          </TouchableOpacity>
        </View>

        {/* Middle Row */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={ride.image || require("../../assets/images/car1.png")}
            style={{ width: 100, height: 60, resizeMode: "contain", marginRight: 10 }}
          />

          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontWeight: "bold", marginBottom: 5 }}>
              {ride.car}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
              <Ionicons name="calendar-outline" size={14} color="#fff" style={{ marginRight: 5 }} />
              <Text style={{ color: "#aaa", fontSize: 12 }}>
                {formatDate(ride.date)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="person-outline" size={14} color="#fff" style={{ marginRight: 5 }} />
              <Text style={{ color: "#aaa", fontSize: 12 }}>{ride.driver}</Text>
            </View>
          </View>

          {/* Rating */}
          <View style={{ flexDirection: "row" }}>
            {[...Array(ride.rating || 5)].map((_, i) => (
              <FontAwesome key={i} name="star" size={16} color="#FFD700" />
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface BookingsScreenProps {
  setScreen: (screen: string) => void;
  setSelectedRide: (ride: any) => void;
}

const BookingsScreen: React.FC<BookingsScreenProps> = ({ setScreen, setSelectedRide }) => {
  const [activeTab, setActiveTab] = useState<"ride" | "delivery">("ride");
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date not available";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Fetch rides from backend
  const fetchRides = async () => {
    try {
      setIsLoading(true);
      
      // Adjust endpoint based on your backend API
      const response = await api.get('/rides/history/');
      
      if (response.data && Array.isArray(response.data)) {
        // Transform backend data to match your frontend structure
        const transformedRides = response.data.map((ride: any) => ({
          id: ride.id || ride._id,
          car: ride.vehicle?.model || ride.carDetails || "Vehicle information",
          date: ride.createdAt || ride.bookingDate || ride.date,
          driver: ride.driver?.name || ride.driverName || "Driver information",
          rating: ride.rating || ride.driverRating || 5,
          type: ride.type === "delivery" ? "delivery" : "ride", // Default to ride
          status: ride.status || "completed",
          image: getCarImage(ride.vehicle?.type), // Helper function to get appropriate image
          // Add other fields as needed
        }));
        
        setRides(transformedRides);
      } else {
        setRides([]);
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
      Alert.alert("Error", "Failed to load ride history");
      setRides([]); // Fallback to empty array
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Helper function to get car image based on vehicle type
  const getCarImage = (vehicleType: string) => {
    // Adjust based on your available images and vehicle types
    switch (vehicleType?.toLowerCase()) { 
      case 'sedan':
        return require("../../assets/images/car1.png");
      case 'suv':
        return require("../../assets/images/car1.png");
      case 'truck':
        return require("../../assets/images/car1.png");
      case 'delivery':
        return require("../../assets/images/car1.png");
      default:
        return require("../../assets/images/car1.png");
    }
  };

  // Pull to refresh function
  const onRefresh = () => {
    setRefreshing(true);
    fetchRides();
  };

  // Initial data fetch
  useEffect(() => {
    fetchRides();
  }, []);

  // Filter rides based on active tab
  const filteredRides = rides.filter((ride) => ride.type === activeTab);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={{ color: "#fff", marginTop: 15 }}>Loading your rides...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000", paddingTop: 20 }}>
      <Text style={{ color: "#fff", fontSize: 22, fontWeight: "600", margin: 20 }}>
        My Rides
      </Text>

      {/* Toggle Buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        {/* Rides Tab */}
        <TouchableOpacity
          onPress={() => setActiveTab("ride")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: activeTab === "ride" ? "#111" : "#000",
            borderTopLeftRadius: 40,
            borderBottomLeftRadius: 40,
            paddingVertical: 12,
            paddingHorizontal: 28,
            borderWidth: 1,
            borderColor: activeTab === "ride" ? "#FFD700" : "#fff",
          }}
        >
          <Ionicons
            name="car"
            size={18}
            color={activeTab === "ride" ? "#FFD700" : "#fff"}
            style={{ marginRight: 8 }}
          />
          <Text
            style={{
              color: activeTab === "ride" ? "#FFD700" : "#fff",
              fontWeight: "bold",
              fontSize: 15,
            }}
          >
            Rides
          </Text>
        </TouchableOpacity>

        {/* Delivery Tab */}
        <TouchableOpacity
          onPress={() => setActiveTab("delivery")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: activeTab === "delivery" ? "#111" : "#000",
            borderTopRightRadius: 40,
            borderBottomRightRadius: 40,
            paddingVertical: 12,
            paddingHorizontal: 28,
            borderWidth: 1,
            borderColor: activeTab === "delivery" ? "#FFD700" : "#fff",
          }}
        >
          <MaterialIcons
            name="local-shipping"
            size={18}
            color={activeTab === "delivery" ? "#FFD700" : "#fff"}
            style={{ marginRight: 8 }}
          />
          <Text
            style={{
              color: activeTab === "delivery" ? "#FFD700" : "#fff",
              fontWeight: "bold",
              fontSize: 15,
            }}
          >
            Delivery
          </Text>
        </TouchableOpacity>
      </View>

      {/* Ride History Label */}
      <Text style={{ color: "#fff", fontSize: 16, textAlign: "center", marginBottom: 15 }}>
        {activeTab === "ride" ? "Ride History" : "Delivery History"}
      </Text>

      {/* Scrollable Ride List with Pull to Refresh */}
      <ScrollView 
        contentContainerStyle={{ 
          paddingBottom: 100,
          flex: filteredRides.length === 0 ? 1 : 0 // Allow empty state to center
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFD700"
            colors={["#FFD700"]}
          />
        }
      >
        {filteredRides.length > 0 ? (
          filteredRides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              setScreen={setScreen}
              setSelectedRide={setSelectedRide}
            />
          ))
        ) : (
          // Empty state
          <View style={{ 
            flex: 1, 
            justifyContent: "center", 
            alignItems: "center",
            paddingVertical: 100 
          }}>
            <Ionicons name="car-outline" size={60} color="#666" />
            <Text style={{ color: "#666", fontSize: 16, marginTop: 15, textAlign: "center" }}>
              No {activeTab === "ride" ? "rides" : "deliveries"} found
            </Text>
            <Text style={{ color: "#444", fontSize: 14, marginTop: 5, textAlign: "center" }}>
              Your {activeTab === "ride" ? "ride" : "delivery"} history will appear here
            </Text>
            <TouchableOpacity 
              onPress={fetchRides}
              style={{
                marginTop: 20,
                paddingHorizontal: 20,
                paddingVertical: 10,
                backgroundColor: "#FFD700",
                borderRadius: 20
              }}
            >
              <Text style={{ color: "#000", fontWeight: "bold" }}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          padding: 15,
          backgroundColor: "#111",
        }}
      >
        <TouchableOpacity onPress={() => setScreen("dashboard")}>
          <Ionicons name="home-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="book-outline" size={24} color="#FFD700" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="wallet-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setScreen("profile")}>
          <Ionicons name="person-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BookingsScreen;