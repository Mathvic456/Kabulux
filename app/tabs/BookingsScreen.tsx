import { Ride, RideCard } from "@/components/RideCard";
import { RideHistoryAPIItem, useRideHistory } from "@/services/rides.service";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert, // <--- Added Alert Import
  Modal,
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
  next: () => void;
}

const BookingsScreen: React.FC<BookingsScreenProps> = ({
  setScreen,
  setSelectedRide,
  next,
}) => {
  const [activeTab, setActiveTab] = useState<"ride" | "delivery">("ride");
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Ride | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [filter, setFilter] = useState<"all" | "today" | "week" | "month">(
    "all",
  );

  const {
    data: rideHistoryData,
    isLoading,
    refetch,
    isRefetching,
  } = useRideHistory(true);

  const transformRides = (results: RideHistoryAPIItem[]): Ride[] => {
    if (!results || !Array.isArray(results)) return [];

    return results.map((item, index) => ({
      id: String(index),
      car: "Kablux Ride",
      date: item.start_time,
      driver: item.driver || "Unknown Driver",
      rating: 5,
      type: "ride" as const,
      status: item.status || "completed",
      pickupAddress: item.pickup_address || "Unknown Location",
      dropoffAddress: item.dropoff_address || "Unknown Location",
      fare: item.fare || 0,
    }));
  };

  const filterRidesByDate = (rides: Ride[], filterType: typeof filter) => {
    if (filterType === "all") return rides;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return rides.filter((ride) => {
      const rideDate = new Date(ride.date);

      switch (filterType) {
        case "today":
          const rideDay = new Date(
            rideDate.getFullYear(),
            rideDate.getMonth(),
            rideDate.getDate(),
          );
          return rideDay.getTime() === today.getTime();

        case "week":
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return rideDate >= weekAgo;

        case "month":
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return rideDate >= monthAgo;

        default:
          return true;
      }
    });
  };

  const onRefresh = () => refetch();

  const rides = rideHistoryData?.results
    ? transformRides(rideHistoryData.results)
    : [];
  const filteredRides = filterRidesByDate(
    rides.filter((ride) => ride.type === activeTab),
    filter,
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date not available";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";

      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return "₦0";
    const value = amount / 100;
    return "₦" + value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const generateReceiptHTML = (ride: Ride) => {
    const formattedDate = formatDate(ride.date);
    const formattedFare = formatCurrency(ride.fare || 0);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ride Receipt - ${ride.id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; padding: 20px; background-color: #f5f5f5; }
          .receipt-container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0; }
          .header h1 { color: #000; font-size: 28px; font-weight: bold; margin-bottom: 8px; }
          .header h2 { color: #f7b731; font-size: 20px; font-weight: 600; }
          .receipt-id { color: #666; font-size: 14px; margin-top: 10px; }
          .info-section { margin-bottom: 25px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #eee; }
          .info-label { color: #666; font-weight: 500; }
          .info-value { color: #000; font-weight: 600; text-align: right; max-width: 60%; }
          .total-section { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; }
          .total-row { display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; }
          .total-label { color: #000; }
          .total-amount { color: #f7b731; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #f0f0f0; color: #666; font-size: 14px; }
          .thank-you { color: #000; font-weight: bold; margin-bottom: 10px; }
          .status-badge { display: inline-block; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 20px; background-color: ${ride.status === "completed" ? "#4CAF50" : "#f7b731"}; color: white; }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>KABLUX</h1>
            <h2>Ride Receipt</h2>
            <div class="receipt-id">Receipt #${ride.id}</div>
            <div class="status-badge">${ride.status}</div>
          </div>
          
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">Date & Time</span>
              <span class="info-value">${formattedDate}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Pickup Location</span>
              <span class="info-value">${ride.pickupAddress || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Drop-off Location</span>
              <span class="info-value">${ride.dropoffAddress || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Driver</span>
              <span class="info-value">${ride.driver}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Service Type</span>
              <span class="info-value">${ride.car}</span>
            </div>
          </div>
          
          <div class="total-section">
            <div class="total-row">
              <span class="total-label">TOTAL FARE</span>
              <span class="total-amount">${formattedFare}</span>
            </div>
          </div>
          
          <div class="footer">
            <div class="thank-you">Thank you for riding with Kablux!</div>
            <div>Need help? Contact Hello@kabluxe.com</div>
            <div>This is an official receipt for your ride</div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const downloadReceipt = async (ride: Ride) => {
    if (!ride) return;

    try {
      setIsDownloading(true);

      const html = generateReceiptHTML(ride);

      const safeId = String(ride.id || Date.now()).replace(
        /[^a-zA-Z0-9]/g,
        "_"
      );

      // 1️⃣ Generate PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // 2️⃣ Open system save/share sheet directly
      const available = await Sharing.isAvailableAsync();

      if (!available) {
        Alert.alert("Error", "Sharing not available on this device.");
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `Download Kablux Receipt`,
        UTI: "com.adobe.pdf",
      });

    } catch (error) {
      console.error("Receipt error:", error);
      Alert.alert("Error", "Could not download receipt.");
    } finally {
      setIsDownloading(false);
    }
  };

  const openReceiptModal = (ride: Ride) => {
    console.log("Opening modal with ride:", ride);
    setSelectedReceipt(ride);
    setShowReceiptModal(true);
  };

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
        <Text style={[styles.emptySubtitle]}>
          {isRide
            ? "Take a trip with Kablux today"
            : "Send your packages with Kablux"}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>My Activity</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab("ride")}
          style={[styles.tab, activeTab === "ride" && styles.activeTab]}
        >
          <Ionicons
            name="car"
            size={16}
            color={activeTab === "ride" ? "#000" : "#fff"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "ride" && styles.activeTabText,
            ]}
          >
            {" "}
            Rides
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("delivery")}
          style={[styles.tab, activeTab === "delivery" && styles.activeTab]}
        >
          <MaterialIcons
            name="local-shipping"
            size={16}
            color={activeTab === "delivery" ? "#000" : "#fff"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "delivery" && styles.activeTabText,
            ]}
          >
            {" "}
            Delivery
          </Text>
        </TouchableOpacity>
      </View>
      {/* Filter Button */}
      <View style={{ paddingHorizontal: 20, marginBottom: 15 }}>
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
            alignSelf: "flex-start",
          }}
          onPress={() => {
            const filters = ["all", "today", "week", "month"];
            const currentIndex = filters.indexOf(filter);
            const nextIndex = (currentIndex + 1) % filters.length;
            setFilter(filters[nextIndex] as typeof filter);
          }}
        >
          <Ionicons name="filter" size={16} color="#FEB914" />
          <Text
            style={{
              color: "#FEB914",
              marginLeft: 6,
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor="#f7b731"
            colors={["#f7b731"]}
          />
        }
      >
        {filteredRides.length > 0
          ? filteredRides.map((ride, index) => (
            <RideCard
              key={`${ride.id}-${index}`}
              ride={ride}
              onPress={() => openReceiptModal(ride)}
            />
          ))
          : renderEmptyState()}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showReceiptModal}
        onRequestClose={() => setShowReceiptModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedReceipt && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Ride Receipt</Text>
                  <TouchableOpacity onPress={() => setShowReceiptModal(false)}>
                    <Ionicons name="close" size={28} color="#fff" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.receiptScroll}>
                  <View style={styles.receiptDetail}>
                    <View style={styles.receiptHeader}>
                      <Text style={styles.receiptId}>
                        Receipt #{selectedReceipt.id}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              selectedReceipt.status === "completed"
                                ? "#4CAF50"
                                : "#f7b731",
                          },
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {(selectedReceipt.status || "unknown").toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date & Time</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(selectedReceipt.date)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Pickup Location</Text>
                      <Text style={styles.detailValue}>
                        {selectedReceipt.pickupAddress || "N/A"}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Drop-off Location</Text>
                      <Text style={styles.detailValue}>
                        {selectedReceipt.dropoffAddress || "N/A"}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Driver</Text>
                      <Text style={styles.detailValue}>
                        {selectedReceipt.driver}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Service Type</Text>
                      <Text style={styles.detailValue}>
                        {selectedReceipt.car}
                      </Text>
                    </View>

                    <View style={styles.totalSection}>
                      <Text style={styles.totalLabel}>TOTAL FARE</Text>
                      <Text style={styles.totalValue}>
                        {formatCurrency(selectedReceipt.fare)}
                      </Text>
                    </View>

                    <View style={styles.receiptFooter}>
                      <Text style={styles.thankYou}>
                        Thank you for riding with Kablux!
                      </Text>
                      <Text style={styles.supportText}>
                        Need help? Contact Hello@kabluxe.com
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => downloadReceipt(selectedReceipt)}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <ActivityIndicator color="#000" size="small" />
                  ) : (
                    <>
                      <Ionicons name="download" size={20} color="#000" />
                      <Text style={styles.downloadButtonText}>
                        Download Receipt
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "95%",
    maxHeight: "85%",
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#111",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  receiptScroll: {
    flex: 1,
  },
  receiptDetail: {
    padding: 20,
  },
  receiptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#333",
  },
  receiptId: {
    color: "#888",
    fontSize: 14,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  detailLabel: {
    color: "#888",
    fontSize: 13,
    fontWeight: "500",
  },
  detailValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    flexWrap: "wrap",
    marginLeft: 10,
  },
  totalSection: {
    backgroundColor: "#f7b731",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  totalLabel: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  totalValue: {
    color: "#000",
    fontSize: 28,
    fontWeight: "800",
  },
  receiptFooter: {
    alignItems: "center",
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: "#333",
  },
  thankYou: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  supportText: {
    color: "#888",
    fontSize: 13,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7b731",
    padding: 18,
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    gap: 10,
  },
  downloadButtonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default BookingsScreen;
