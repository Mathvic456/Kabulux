import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface Ride {
  id: number;
  car: string;
  date: string;
  driver: string;
  rating: number;
  image: any;
  type: "ride" | "delivery";
  status: string;
}

interface RideCardProps {
  ride: Ride;
  setScreen: (screen: string) => void;
  setSelectedRide: (ride: Ride) => void;
}

const RideCard: React.FC<RideCardProps> = ({ ride, setScreen, setSelectedRide }) => {
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
          borderColor: "#f7b731",
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
              borderColor: "#f7b731",
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
              <FontAwesome key={i} name="star" size={16} color="#f7b731" />
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

  // Empty mock data - no rides or deliveries
  const mockRides: Ride[] = [];

  // Simulate API call with empty data
  const fetchRides = async () => {
    try {
      setIsLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Use empty mock data
      setRides(mockRides);
      
    } catch (error) {
      console.error('Error fetching rides:', error);
      Alert.alert("Error", "Failed to load ride history");
      setRides([]); // Fallback to empty array
    } finally {
      setIsLoading(false);
      setRefreshing(false);
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

  // Filter rides based on active tab (will always be empty)
  const filteredRides = rides.filter((ride) => ride.type === activeTab);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#f7b731" />
        <Text style={{ color: "#fff", marginTop: 15 }}>Loading your rides...</Text>
      </View>
    );
  }

  // Empty state content based on active tab
  const renderEmptyState = () => {
    if (activeTab === "ride") {
      return (
        <>
          <Ionicons name="car-outline" size={80} color="#666" />
          <Text style={{ 
            color: "#fff", 
            fontSize: 20, 
            fontWeight: "bold", 
            marginTop: 20, 
            textAlign: "center",
            marginBottom: 10
          }}>
            You currently have not placed any rides yet
          </Text>
          <Text style={{ 
            color: "#f7b731", 
            fontSize: 16, 
            textAlign: "center",
            marginBottom: 30
          }}>
            Take a trip with kablux today
          </Text>
          <TouchableOpacity 
            onPress={() => setScreen("dashboard")}
            style={{
              paddingHorizontal: 30,
              paddingVertical: 15,
              backgroundColor: "#f7b731",
              borderRadius: 25,
              borderWidth: 1,
              borderColor: "#f7b731"
            }}
          >
            <Text style={{ 
              color: "#000", 
              fontWeight: "bold", 
              fontSize: 16 
            }}>
              Book a Ride
            </Text>
          </TouchableOpacity>
        </>
      );
    } else {
      return (
        <>
          <MaterialIcons name="local-shipping" size={80} color="#666" />
          <Text style={{ 
            color: "#fff", 
            fontSize: 20, 
            fontWeight: "bold", 
            marginTop: 20, 
            textAlign: "center",
            marginBottom: 10
          }}>
            You have no deliveries with kablux yet
          </Text>
          <Text style={{ 
            color: "#f7b731", 
            fontSize: 16, 
            textAlign: "center",
            marginBottom: 30
          }}>
            Send your packages with kablux today
          </Text>
          <TouchableOpacity 
            onPress={() => setScreen("dashboard")}
            style={{
              paddingHorizontal: 30,
              paddingVertical: 15,
              backgroundColor: "#f7b731",
              borderRadius: 25,
              borderWidth: 1,
              borderColor: "#f7b731"
            }}
          >
            <Text style={{ 
              color: "#000", 
              fontWeight: "bold", 
              fontSize: 16 
            }}>
              Make a Delivery Request
            </Text>
          </TouchableOpacity>
        </>
      );
    }
  };

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
            borderColor: activeTab === "ride" ? "#f7b731" : "#fff",
          }}
        >
          <Ionicons
            name="car"
            size={18}
            color={activeTab === "ride" ? "#f7b731" : "#fff"}
            style={{ marginRight: 8 }}
          />
          <Text
            style={{
              color: activeTab === "ride" ? "#f7b731" : "#fff",
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
            borderColor: activeTab === "delivery" ? "#f7b731" : "#fff",
          }}
        >
          <MaterialIcons
            name="local-shipping"
            size={18}
            color={activeTab === "delivery" ? "#f7b731" : "#fff"}
            style={{ marginRight: 8 }}
          />
          <Text
            style={{
              color: activeTab === "delivery" ? "#f7b731" : "#fff",
              fontWeight: "bold",
              fontSize: 15,
            }}
          >
            Delivery
          </Text>
        </TouchableOpacity>
      </View>

      {/* Empty State Message */}
      <View style={{ 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center",
        paddingHorizontal: 40
      }}>
        {renderEmptyState()}
      </View>

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
          <Ionicons name="book-outline" size={24} color="#f7b731" />
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