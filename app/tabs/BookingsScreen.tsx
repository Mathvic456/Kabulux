import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const rides = [
  {
    id: 1,
    car: "25 Toyota road chevy",
    date: "Oct 30 - 14:50",
    driver: "Fagbohun sam",
    rating: 5,
    image: require("../../assets/images/car1.png"),
    type: "ride",
  },
  {
    id: 2,
    car: "25 Toyota road chevy",
    date: "Oct 31 - 16:20",
    driver: "Fagbohun sam",
    rating: 5,
    image: require("../../assets/images/car1.png"),
    type: "delivery",
  },
  {
    id: 3,
    car: "25 Toyota road chevy",
    date: "Nov 1 - 12:10",
    driver: "Fagbohun sam",
    rating: 4,
    image: require("../../assets/images/car1.png"),
    type: "ride",
  },
];

const RideCard = ({ ride, setScreen, setSelectedRide }) => {
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
            <Text style={{ color: "#fff", fontSize: 12 }}>completed</Text>
          </View>
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons name="autorenew" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, marginLeft: 5 }}>Book again</Text>
          </TouchableOpacity>
        </View>

        {/* Middle Row */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={ride.image}
            style={{ width: 100, height: 60, resizeMode: "contain", marginRight: 10 }}
          />

          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontWeight: "bold", marginBottom: 5 }}>
              {ride.car}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
              <Ionicons name="calendar-outline" size={14} color="#fff" style={{ marginRight: 5 }} />
              <Text style={{ color: "#aaa", fontSize: 12 }}>{ride.date}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="person-outline" size={14} color="#fff" style={{ marginRight: 5 }} />
              <Text style={{ color: "#aaa", fontSize: 12 }}>{ride.driver}</Text>
            </View>
          </View>

          {/* Rating */}
          <View style={{ flexDirection: "row" }}>
            {[...Array(ride.rating)].map((_, i) => (
              <FontAwesome key={i} name="star" size={16} color="#FFD700" />
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const BookingsScreen = ({ setScreen, setSelectedRide }) => {
  const [activeTab, setActiveTab] = useState("ride");

  const filteredRides = rides.filter((ride) => ride.type === activeTab);

  return (
    <View style={{ flex: 1, backgroundColor: "#000",paddingTop:20 }}>
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

      {/* Scrollable Ride List */}
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {filteredRides.map((ride) => (
          <RideCard
            key={ride.id}
            ride={ride}
            setScreen={setScreen}
            setSelectedRide={setSelectedRide}
          />
        ))}
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
