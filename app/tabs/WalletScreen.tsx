import {
  Transaction,
  useFundWalletEndPoint,
  useGetMyBalance,
  useGetMyTransactions,
} from "@/services/funding.service";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ComingSoonModal } from "./HomeScreen";

const PAGE_SIZE = 10;

interface CleanTransaction {
  id: string;
  amount: number;
  date: Date;
  type: "credit" | "debit" | "pending";
  description: string;
  status: string;
}

type FilterType = "all" | "today" | "week" | "month";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
];

const WalletScreen = ({
  setScreen,
}: {
  setScreen: (screen: string, checkoutUrl?: string) => void;
}) => {
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("card");
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const fundWallet = useFundWalletEndPoint();
  const {
    data: balanceData,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useGetMyBalance();

  const {
    data: transactionsResponse,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = useGetMyTransactions({ page, page_size: PAGE_SIZE });

  const allCleaned: CleanTransaction[] = useMemo(() => {
    const rawData = transactionsResponse?.data;
    if (!rawData || !Array.isArray(rawData)) return [];

    return rawData.map((item: Transaction, index) => {
      const dateObj = item.created_at ? new Date(item.created_at) : new Date();
      if (!item.created_at) dateObj.setMinutes(dateObj.getMinutes() - index * 30);

      const cleanAmount = item.amount ? parseFloat(item.amount) : 0;

      let description = "Transaction";
      if (item.channel) description = `Wallet ${item.channel}`;
      if (item.type) description = item.type;

      let type: "credit" | "debit" | "pending" = "pending";
      if (item.direction === "credit") type = "credit";
      else if (item.direction === "debit") type = "debit";
      else if (item.status === "pending") type = "pending";

      return { id: item.id, amount: cleanAmount, date: dateObj, type, description, status: item.status };
    });
  }, [transactionsResponse]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(todayStart);
    weekAgo.setDate(todayStart.getDate() - 7);
    const monthAgo = new Date(todayStart);
    monthAgo.setMonth(todayStart.getMonth() - 1);

    return allCleaned.filter((tx) => {
      const txDay = new Date(tx.date.getFullYear(), tx.date.getMonth(), tx.date.getDate());
      switch (filter) {
        case "today": return txDay.getTime() === todayStart.getTime();
        case "week": return tx.date >= weekAgo;
        case "month": return tx.date >= monthAgo;
        default: return true;
      }
    });
  }, [allCleaned, filter]);

  const totalFiltered = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const paginatedTransactions = filteredTransactions.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const groupedTransactions = useMemo(() => {
    const grouped: { [key: string]: CleanTransaction[] } = {};
    paginatedTransactions.forEach((tx) => {
      const key = tx.date.toLocaleString("default", { month: "long", year: "numeric" });
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(tx);
    });
    return grouped;
  }, [paginatedTransactions]);

  const handleFilterChange = (f: FilterType) => {
    setFilter(f);
    setPage(1);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchBalance(), refetchTransactions()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFundWallet = () => {
    fundWallet.mutate(
      { amount: 20000, channel: selectedPaymentMethod },
      {
        onSuccess: (res) => {
          const checkoutUrl = res.data.authorization_url;
          if (checkoutUrl) setScreen("paystack", checkoutUrl);
        },
      }
    );
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    setShowPaymentMethodsModal(false);
  };

  const formatDisplayDate = (date: Date) => {
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return `${month} ${day} - ${time}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FEB914"
            colors={["#FEB914"]}
            progressBackgroundColor="#111"
          />
        }
      >
        {/* Header */}
        <View style={{ marginTop: 40, marginLeft: 20 }}>
          <Text style={{ color: "#FEB914", fontSize: 20, fontWeight: "700" }}>
            Yellow <Text style={{ color: "#fff" }}>Wallet</Text>
          </Text>
        </View>

        {/* Balance Card */}
        <View style={{ backgroundColor: "#111", margin: 20, borderRadius: 20, padding: 25 }}>
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
            {balanceLoading
              ? "Loading..."
              : `₦${balanceData?.balance?.toLocaleString() ?? "0.00"}`}
          </Text>

          <View style={{ height: 1, backgroundColor: "#FEB914", opacity: 0.4, marginVertical: 15 }} />

          <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginTop: 10 }}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FEB914",
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 30,
              }}
              onPress={handleFundWallet}
            >
              <Ionicons name="add" size={18} color="#000" />
              <Text style={{ marginLeft: 8, fontWeight: "600", color: "#000" }}>Add funds</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#fff",
                paddingVertical: 10,
                paddingHorizontal: 15,
                borderRadius: 30,
              }}
              onPress={() => setScreen("redeemPoints")}
            >
              <Ionicons name="gift-outline" size={18} color="#FEB914" />
              <Text style={{ color: "#000", fontWeight: "600" }}>Redeem points</Text>
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
            <Text style={{ color: "#fff", flex: 1 }}>Manage Payment Methods</Text>
            <Ionicons name="chevron-forward" size={20} color="#FEB914" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", padding: 18 }}
            onPress={() => setScreen("loyalty")}
          >
            <Text style={{ color: "#fff", flex: 1 }}>Loyalty & Rewards</Text>
            <Ionicons name="chevron-forward" size={20} color="#FEB914" />
          </TouchableOpacity>
        </View>

        {/* Transaction History Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginHorizontal: 20,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
            Transaction History
          </Text>
        </View>

        {/* Filter Tabs */}
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 20,
            marginBottom: 12,
            backgroundColor: "#111",
            borderRadius: 10,
            padding: 4,
            borderWidth: 1,
            borderColor: "#FEB91433",
          }}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={{
                flex: 1,
                paddingVertical: 8,
                alignItems: "center",
                borderRadius: 8,
                backgroundColor: filter === f.key ? "#FEB914" : "transparent",
              }}
              onPress={() => handleFilterChange(f.key)}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: filter === f.key ? "#000" : "#888",
                }}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transaction List */}
        {transactionsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FEB914" />
            <Text style={{ color: "#fff", fontSize: 14, marginTop: 10, textAlign: "center" }}>
              Loading transactions...
            </Text>
          </View>
        ) : Object.entries(groupedTransactions).length > 0 ? (
          Object.entries(groupedTransactions).map(([monthYear, transactions]) => (
            <View key={monthYear} style={styles.monthGroupContainer}>
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
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 16,
                        fontWeight: "500",
                        textTransform: "capitalize",
                      }}
                    >
                      {tx.description}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: tx.status === "success" ? "#4CAF50" : "#FEB914",
                        borderWidth: 1,
                        borderColor: tx.status === "success" ? "#4CAF50" : "#FEB914",
                        paddingHorizontal: 6,
                        borderRadius: 4,
                        alignSelf: "center",
                      }}
                    >
                      {tx.status}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 5,
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="calendar-outline" size={14} color="#FEB914" />
                      <Text style={{ color: "#aaa", marginLeft: 6, fontSize: 12 }}>
                        {formatDisplayDate(tx.date)}
                      </Text>
                    </View>

                    <Text
                      style={{
                        color:
                          tx.type === "credit"
                            ? "#4CAF50"
                            : tx.type === "debit"
                              ? "#F44336"
                              : "#aaa",
                        fontSize: 16,
                        fontWeight: "bold",
                        textAlign: "right",
                      }}
                    >
                      {tx.type === "credit" ? "+" : tx.type === "debit" ? "-" : ""}₦
                      {tx.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#FEB914" />
            <Text style={{ color: "#fff", fontSize: 16, marginTop: 10, textAlign: "center" }}>
              No transactions found for {filter === "all" ? "any period" : `the ${filter} filter`}
            </Text>
          </View>
        )}

        {/* Pagination */}
        {!transactionsLoading && totalPages > 1 && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              paddingVertical: 12,
              marginHorizontal: 20,
              marginBottom: 8,
            }}
          >
            <TouchableOpacity
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                borderWidth: 1,
                borderColor: page === 1 ? "#333" : "#FEB914",
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: page === 1 ? "#333" : "#FEB914", fontWeight: "600" }}>
                Prev
              </Text>
            </TouchableOpacity>

            <Text style={{ color: "#aaa", fontSize: 13 }}>
              Page{" "}
              <Text style={{ color: "#fff", fontWeight: "700" }}>{page}</Text>
              {" "}of{" "}
              <Text style={{ color: "#fff", fontWeight: "700" }}>{totalPages}</Text>
            </Text>

            <TouchableOpacity
              onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                borderWidth: 1,
                borderColor: page === totalPages ? "#333" : "#FEB914",
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: page === totalPages ? "#333" : "#FEB914", fontWeight: "600" }}>
                Next
              </Text>
            </TouchableOpacity>
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
                  selectedPaymentMethod === "card" && styles.selectedPaymentMethod,
                ]}
                onPress={() => handlePaymentMethodSelect("card")}
              >
                <View style={styles.paymentMethodLeft}>
                  <Ionicons
                    name="card-outline"
                    size={24}
                    color={selectedPaymentMethod === "card" ? "#000" : "#FEB914"}
                  />
                  <Text
                    style={[
                      styles.paymentMethodText,
                      selectedPaymentMethod === "card" && styles.selectedPaymentMethodText,
                    ]}
                  >
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
                  selectedPaymentMethod === "cash" && styles.selectedPaymentMethod,
                ]}
                onPress={() => handlePaymentMethodSelect("cash")}
              >
                <View style={styles.paymentMethodLeft}>
                  <Ionicons
                    name="cash-outline"
                    size={24}
                    color={selectedPaymentMethod === "cash" ? "#000" : "#FEB914"}
                  />
                  <Text
                    style={[
                      styles.paymentMethodText,
                      selectedPaymentMethod === "cash" && styles.selectedPaymentMethodText,
                    ]}
                  >
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

      <ComingSoonModal
        isVisible={showComingSoonModal}
        onClose={() => setShowComingSoonModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    backgroundColor: "#111",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 30,
    borderWidth: 1,
    borderColor: "#FEB914",
    alignItems: "center",
    marginBottom: 20,
  },
  monthGroupContainer: {
    backgroundColor: "#111",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#FEB914",
    marginBottom: 20,
  },
  emptyContainer: {
    backgroundColor: "#111",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 30,
    borderWidth: 1,
    borderColor: "#FEB914",
    alignItems: "center",
    marginBottom: 20,
  },
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
  modalTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  paymentMethodsContainer: { marginBottom: 25 },
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
  selectedPaymentMethod: { backgroundColor: "#FEB914", borderColor: "#FEB914" },
  paymentMethodLeft: { flexDirection: "row", alignItems: "center" },
  paymentMethodText: { color: "#fff", fontSize: 16, fontWeight: "500", marginLeft: 15 },
  selectedPaymentMethodText: { color: "#000", fontWeight: "bold" },
  confirmButton: {
    backgroundColor: "#FEB914",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  confirmButtonText: { color: "#000", fontSize: 16, fontWeight: "bold" },
});

export default WalletScreen;