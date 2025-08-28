import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const WalletScreen = ({ setScreen }) => {
  const transactions = [
    {
      id: 1,
      title: "Selldragons Hotel lekki",
      date: "Oct 30 - 14:50",
      amount: "₦26,000",
    },
    {
      id: 2,
      title: "Selldragons Hotel lekki",
      date: "Oct 30 - 14:50",
      amount: "₦26,000",
    },
    {
      id: 3,
      title: "Selldragons Hotel lekki",
      date: "Oct 30 - 14:50",
      amount: "₦26,000",
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={{ marginTop: 40, marginLeft: 20 }}>
          <Text style={{ color: "#FEB914", fontSize: 20, fontWeight: "700" }}>
            Yellow <Text style={{ color: "#fff" }}>Wallet</Text>
          </Text>
        </View>

        {/* Balance Card */}
        <View
          style={{
            backgroundColor: "#111",
            margin: 20,
            borderRadius: 20,
            padding: 25,
          }}
        >
          <Text style={{ color: "#bbb", fontSize: 14, textAlign: "center" }}>
            Current Balance
          </Text>
          <Text
            style={{
              color: "#fff",
              fontSize: 32,
              fontWeight: "bold",
              textAlign: "center",
              marginVertical: 10,
            }}
          >
            ₦425,000
          </Text>

          <View
            style={{
              height: 1,
              backgroundColor: "#FEB914",
              opacity: 0.4,
              marginVertical: 15,
            }}
          />

          {/* Actions */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              marginTop: 10,
            }}
          >
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FEB914",
                paddingVertical: 10,
                paddingHorizontal: 25,
                borderRadius: 30,
              }}

              onPress={() => setScreen("addFunds")}   // 👈 navigate to AddFundsScreen

            >
              <Ionicons name="add" size={18} color="#000" />
              <Text
                style={{
                  marginLeft: 8,
                  fontWeight: "600",
                  color: "#000",
                }}
              >
                Add funds
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#fff",
                paddingVertical: 10,
                paddingHorizontal: 25,
                borderRadius: 30,
              }}

              onPress={() => setScreen("redeemPoints")}   // 👈 navigate to AddFundsScreen

            >
              <Ionicons name="gift-outline" size={18} color="#FEB914" />
              <Text
                style={{
                  marginLeft: 8,
                  color: "#000",
                  fontWeight: "600",
                }}
              >
                Redeem points
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Methods Section */}
        <View
          style={{
            backgroundColor: "#111",
            marginHorizontal: 20,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#FEB914",
            marginBottom: 20,
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 18,
              borderBottomWidth: 1,
              borderBottomColor: "#FEB91433",
            }}
          >
            <Text style={{ color: "#fff", flex: 1 }}>Manage Payment Methods</Text>
            <Ionicons name="chevron-forward" size={20} color="#FEB914" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 18,
            }}
          >
            <Text style={{ color: "#fff", flex: 1 }}>Loyalty & Rewards</Text>
            <Ionicons name="chevron-forward" size={20} color="#FEB914" />
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <Text
          style={{
            color: "#fff",
            fontSize: 18,
            fontWeight: "bold",
            marginLeft: 20,
            marginBottom: 10,
          }}
        >
          Transaction History
        </Text>

        <View
          style={{
            backgroundColor: "#111",
            marginHorizontal: 20,
            borderRadius: 12,
            padding: 15,
            borderWidth: 1,
            borderColor: "#FEB914",
          }}
        >
          {/* Month Label */}
          <View
            style={{
              alignSelf: "flex-end",
              backgroundColor: "#000",
              paddingHorizontal: 10,
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "#FEB914", fontWeight: "600" }}>October</Text>
          </View>

          {transactions.map((tx, index) => (
            <View
              key={tx.id}
              style={{
                borderBottomWidth: index !== transactions.length - 1 ? 1 : 0,
                borderBottomColor: "#FEB91433",
                paddingVertical: 12,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "500" }}>
                {tx.title}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 5,
                }}
              >
                <Ionicons name="calendar-outline" size={14} color="#FEB914" />
                <Text style={{ color: "#aaa", marginLeft: 6 }}>{tx.date}</Text>
              </View>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "bold",
                  marginTop: 5,
                  textAlign: "right",
                }}
              >
                {tx.amount}
              </Text>
            </View>
          ))}
        </View>
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
        <TouchableOpacity onPress={() => setScreen("bookings")}>
          <Ionicons name="book-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="wallet-outline" size={24} color="#FEB914" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setScreen("profile")}>
          <Ionicons name="person-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WalletScreen;
