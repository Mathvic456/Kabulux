import {
  useFundWalletEndPoint,
  useGetMyBalance,
  useGetMyTransactions,
} from "@/services/funding.service";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const WalletScreen = ({ setScreen } :
  {setScreen: (screen: string, checkoutUrl?: string) => void}
) => {
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("card");
  const [filter, setFilter] = useState<string>("all"); // "all", "today", "week", "month"
  
  const fundWallet = useFundWalletEndPoint();
  const { data: balanceData, isLoading } = useGetMyBalance();
  const { data: transactionsData, isLoading: transactionsLoading } = useGetMyTransactions();
  
  const handleFundWallet = () => {
    fundWallet.mutate(
      { amount: 20000, channel: selectedPaymentMethod },
      {
        onSuccess: (res) => {
          const checkoutUrl = res.data?.data?.authorization_url;
          if (checkoutUrl) {
            setScreen("paystack", checkoutUrl)
          }
        },
      }
    );
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    setShowPaymentMethodsModal(false);
  };

  // Filter transactions based on selected filter
  const getFilteredTransactions = () => {
    if (!transactionsData?.results) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(today.getMonth() - 1);

    return transactionsData.results.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      
      switch(filter) {
        case "today":
          return transactionDate.getTime() === today.getTime();
        case "week":
          return transactionDate >= weekAgo;
        case "month":
          return transactionDate >= monthAgo;
        default:
          return true; // "all"
      }
    });
  };

  // Group transactions by month
  const groupTransactionsByMonth = (transactions: any[]) => {
    const grouped: {[key: string]: any[]} = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(transaction);
    });
    
    return grouped;
  };

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${month} ${day} - ${time}`;
  };

  const filteredTransactions = getFilteredTransactions();
  const groupedTransactions = groupTransactionsByMonth(filteredTransactions);

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
            {isLoading
              ? "Loading..."
              : `₦${balanceData?.balance?.toLocaleString() ?? 0}`}
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
              onPress={handleFundWallet}
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
              onPress={() => setScreen("redeemPoints")}
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
            onPress={() => setShowPaymentMethodsModal(true)}
          >
            <Text style={{ color: "#fff", flex: 1 }}>
              Manage Payment Methods
            </Text>
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

        {/* Transaction History Header with Filter */}
        <View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginHorizontal: 20,
          marginBottom: 10,
        }}>
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "bold",
            }}
          >
            Transaction History
          </Text>
          
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#111",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#FEB914",
            }}
            onPress={() => {
              // Cycle through filters
              const filters = ["all", "today", "week", "month"];
              const currentIndex = filters.indexOf(filter);
              const nextIndex = (currentIndex + 1) % filters.length;
              setFilter(filters[nextIndex]);
            }}
          >
            <Ionicons name="filter" size={16} color="#FEB914" />
            <Text style={{
              color: "#FEB914",
              marginLeft: 6,
              fontSize: 14,
              fontWeight: "600",
            }}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        {transactionsLoading ? (
          <View
            style={{
              backgroundColor: "#111",
              marginHorizontal: 20,
              borderRadius: 12,
              padding: 30,
              borderWidth: 1,
              borderColor: "#FEB914",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <ActivityIndicator size="large" color="#FEB914" />
            <Text style={{ color: "#fff", fontSize: 14, marginTop: 10, textAlign: "center" }}>
              Loading transactions...
            </Text>
          </View>
        ) : Object.entries(groupedTransactions).length > 0 ? (
          Object.entries(groupedTransactions).map(([monthYear, transactions]) => (
            <View
              key={monthYear}
              style={{
                backgroundColor: "#111",
                marginHorizontal: 20,
                borderRadius: 12,
                padding: 15,
                borderWidth: 1,
                borderColor: "#FEB914",
                marginBottom: 20,
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
                <Text style={{ color: "#FEB914", fontWeight: "600" }}>{monthYear}</Text>
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
                    {tx.description || tx.type}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 5,
                    }}
                  >
                    <Ionicons name="calendar-outline" size={14} color="#FEB914" />
                    <Text style={{ color: "#aaa", marginLeft: 6 }}>
                      {formatDisplayDate(tx.date)}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: tx.type === "credit" ? "#4CAF50" : "#fff",
                      fontSize: 16,
                      fontWeight: "bold",
                      marginTop: 5,
                      textAlign: "right",
                    }}
                  >
                    {tx.type === "credit" ? "+" : "-"}₦{tx.amount.toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          ))
        ) : (
          <View
            style={{
              backgroundColor: "#111",
              marginHorizontal: 20,
              borderRadius: 12,
              padding: 30,
              borderWidth: 1,
              borderColor: "#FEB914",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Ionicons name="receipt-outline" size={48} color="#FEB914" />
            <Text style={{ color: "#fff", fontSize: 16, marginTop: 10, textAlign: "center" }}>
              No transactions found for {filter} filter
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Payment Methods Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPaymentMethodsModal}
        onRequestClose={() => setShowPaymentMethodsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Payment Method</Text>
              <TouchableOpacity onPress={() => setShowPaymentMethodsModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.paymentMethodsContainer}>
              <TouchableOpacity
                style={[
                  styles.paymentMethodItem,
                  selectedPaymentMethod === "card" && styles.selectedPaymentMethod
                ]}
                onPress={() => handlePaymentMethodSelect("card")}
              >
                <View style={styles.paymentMethodLeft}>
                  <Ionicons 
                    name="card-outline" 
                    size={24} 
                    color={selectedPaymentMethod === "card" ? "#000" : "#FEB914"} 
                  />
                  <Text style={[
                    styles.paymentMethodText,
                    selectedPaymentMethod === "card" && styles.selectedPaymentMethodText
                  ]}>
                    Card
                  </Text>
                </View>
                {selectedPaymentMethod === "card" && (
                  <Ionicons name="checkmark-circle" size={24} color="#FEB914" />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.paymentMethodItem,
                  selectedPaymentMethod === "cash" && styles.selectedPaymentMethod
                ]}
                onPress={() => handlePaymentMethodSelect("cash")}
              >
                <View style={styles.paymentMethodLeft}>
                  <Ionicons 
                    name="cash-outline" 
                    size={24} 
                    color={selectedPaymentMethod === "cash" ? "#000" : "#FEB914"} 
                  />
                  <Text style={[
                    styles.paymentMethodText,
                    selectedPaymentMethod === "cash" && styles.selectedPaymentMethodText
                  ]}>
                    Cash
                  </Text>
                </View>
                {selectedPaymentMethod === "cash" && (
                  <Ionicons name="checkmark-circle" size={24} color="#FEB914" />
                )}
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => setShowPaymentMethodsModal(false)}
            >
              <Text style={styles.confirmButtonText}>Confirm Selection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginBottom: 50,
          paddingVertical: 15,
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#111",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#FEB914",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  paymentMethodsContainer: {
    marginBottom: 25,
  },
  paymentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#222",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedPaymentMethod: {
    backgroundColor: "#FEB914",
    borderColor: "#FEB914",
  },
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethodText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 15,
  },
  selectedPaymentMethodText: {
    color: "#000",
    fontWeight: "bold",
  },
  confirmButton: {
    backgroundColor: "#FEB914",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default WalletScreen;