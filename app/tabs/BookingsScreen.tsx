import { useRideHistory } from "@/services/rideHistory.service";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
<<<<<<< HEAD
  Image,
  RefreshControl,
  ScrollView,
=======
  Alert,
  Image,
>>>>>>> b17ea38803b3ce506dc0ab1b208f894776b83738
  Text,
  TouchableOpacity,
  View
} from "react-native";
<<<<<<< HEAD

=======
>>>>>>> b17ea38803b3ce506dc0ab1b208f894776b83738

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
<<<<<<< HEAD

   const formatDate = (dateString: string) => {
=======
  const formatDate = (dateString: string) => {
>>>>>>> b17ea38803b3ce506dc0ab1b208f894776b83738
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

<<<<<<< HEAD
  
=======
>>>>>>> b17ea38803b3ce506dc0ab1b208f894776b83738
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

  // Integrate React Query for data fetching
  const { data: rideHistoryData, isLoading, refetch, isRefetching } = useRideHistory(true);

<<<<<<< HEAD
  // Format date function
 

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

  // Transform backend data to match frontend structure
  const transformRides = (results: any[]): Ride[] => {
    if (!results || !Array.isArray(results)) return [];

    return results.map((ride: any) => ({
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
=======
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
>>>>>>> b17ea38803b3ce506dc0ab1b208f894776b83738
  };

  const checkToken = async () => {
  const token = await AsyncStorage.getItem("token");
  console.log("Stored token:", token);
};
  useEffect(() => {
    checkToken();
  })

<<<<<<< HEAD

  // Pull to refresh function
  const onRefresh = () => {
    refetch();
  };

  // Get transformed rides
  const rides = rideHistoryData?.results ? transformRides(rideHistoryData.results) : [];
  // Filter rides based on active tab
=======
  // Filter rides based on active tab (will always be empty)
>>>>>>> b17ea38803b3ce506dc0ab1b208f894776b83738
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

<<<<<<< HEAD
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
            refreshing={isRefetching}
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
              onPress={onRefresh}
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
=======
      {/* Empty State Message */}
      <View style={{ 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center",
        paddingHorizontal: 40
      }}>
        {renderEmptyState()}
      </View>
>>>>>>> b17ea38803b3ce506dc0ab1b208f894776b83738

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