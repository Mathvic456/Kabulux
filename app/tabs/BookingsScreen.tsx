import { Ride, RideCard } from "@/components/RideCard";
import { RideHistoryAPIItem, useRideHistory } from "@/services/rides.service";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface BookingsScreenProps {
  setScreen: (screen: string) => void;
  setSelectedRide: (ride: any) => void;
  next: () => void;
}

type FilterType = "all" | "today" | "week" | "month";
type TabType = "ride" | "delivery";

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
];

const ITEMS_PER_PAGE = 10;

const BookingsScreen: React.FC<BookingsScreenProps> = ({
  setScreen,
  setSelectedRide,
  next,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("ride");
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Ride | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const { data: rideHistoryData, isLoading, refetch, isRefetching } =
    useRideHistory(true);

  // ── Transform ──────────────────────────────────────────────
  const transformRides = (results: RideHistoryAPIItem[]): Ride[] => {
    if (!Array.isArray(results)) return [];
    return results.map((item) => ({
      id: item.id,
      car: "Kablux Ride",
      date: item.start_time || item.end_time || "",
      driver: item.driver_name || item.driver || "Unknown Driver",
      rating: 5,
      image: null,
      type: "ride" as const,
      status: item.status || "completed",
      pickupAddress: item.pickup_address || "Unknown Location",
      dropoffAddress: item.dropoff_address || "Unknown Location",
      fare: Number(item.fare) || 0,
    }));
  };

  // ── Date filter ────────────────────────────────────────────
  const filterRidesByDate = (rides: Ride[], filterType: FilterType): Ride[] => {
    if (filterType === "all") return rides;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return rides.filter((ride) => {
      if (!ride.date) return false;
      const rideDate = new Date(ride.date);
      if (isNaN(rideDate.getTime())) return false;

      if (filterType === "today") {
        const d = new Date(rideDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      }
      if (filterType === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return rideDate >= weekAgo;
      }
      if (filterType === "month") {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return rideDate >= monthAgo;
      }
      return true;
    });
  };

  // ── Derived data ───────────────────────────────────────────
  const allRides = rideHistoryData?.results
    ? transformRides(rideHistoryData.results)
    : [];
  // console.log('all rides======', allRides)

  const tabFiltered = allRides.filter((r) => r.type === activeTab);
  const dateFiltered = filterRidesByDate(tabFiltered, filter);
  const totalPages = Math.max(1, Math.ceil(dateFiltered.length / ITEMS_PER_PAGE));
  const paginatedRides = dateFiltered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleFilterChange = (f: FilterType) => {
    setFilter(f);
    setCurrentPage(1);
    setShowFilterMenu(false);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // ── Formatters ─────────────────────────────────────────────
  const formatDate = (dateString: string): string => {
    if (!dateString) return "Date not available";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date not available";
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number | undefined | null): string => {
    const value = Number(amount);
    if (!amount || isNaN(value)) return "₦0";
    return "₦" + value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // ── Receipt PDF ────────────────────────────────────────────
  const generateReceiptHTML = (ride: Ride): string => `
    <!DOCTYPE html><html><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; line-height:1.6; color:#333; padding:20px; background:#f5f5f5; }
      .wrap { max-width:600px; margin:0 auto; background:#fff; border-radius:12px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,.1); }
      .header { text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:2px solid #f0f0f0; }
      .header h1 { color:#000; font-size:28px; font-weight:bold; margin-bottom:8px; }
      .header h2 { color:#f7b731; font-size:20px; font-weight:600; }
      .receipt-id { color:#666; font-size:14px; margin-top:10px; }
      .badge { display:inline-block; padding:6px 12px; border-radius:8px; font-size:12px; font-weight:700; text-transform:uppercase; margin-top:10px; background:${ride.status === "completed" ? "#4CAF50" : "#f7b731"}; color:#fff; }
      .row { display:flex; justify-content:space-between; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid #eee; }
      .label { color:#666; font-weight:500; }
      .value { color:#000; font-weight:600; text-align:right; max-width:60%; }
      .total { background:#f8f9fa; padding:20px; border-radius:8px; margin:30px 0; display:flex; justify-content:space-between; font-size:20px; font-weight:bold; }
      .total-amount { color:#f7b731; }
      .footer { text-align:center; margin-top:30px; padding-top:20px; border-top:2px solid #f0f0f0; color:#666; font-size:14px; }
      .footer b { color:#000; display:block; margin-bottom:6px; }
    </style></head>
    <body><div class="wrap">
      <div class="header">
        <h1>KABLUX</h1><h2>Ride Receipt</h2>
        <div class="receipt-id">Receipt #${ride.id}</div>
        <div class="badge">${ride.status}</div>
      </div>
      <div class="row"><span class="label">Date & Time</span><span class="value">${formatDate(ride.date)}</span></div>
      <div class="row"><span class="label">Pickup</span><span class="value">${ride.pickupAddress || "N/A"}</span></div>
      <div class="row"><span class="label">Drop-off</span><span class="value">${ride.dropoffAddress || "N/A"}</span></div>
      <div class="row"><span class="label">Driver</span><span class="value">${ride.driver}</span></div>
      <div class="row"><span class="label">Service</span><span class="value">${ride.car}</span></div>
      <div class="total"><span>TOTAL FARE</span><span class="total-amount">${formatCurrency(ride.fare)}</span></div>
      <div class="footer"><b>Thank you for riding with Kablux!</b>Need help? Contact Hello@kabluxe.com</div>
    </div></body></html>`;

  const downloadReceipt = async (ride: Ride) => {
    try {
      setIsDownloading(true);
      const { uri } = await Print.printToFileAsync({
        html: generateReceiptHTML(ride),
        base64: false,
      });
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert("Error", "Sharing not available on this device.");
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Download Kablux Receipt",
        UTI: "com.adobe.pdf",
      });
    } catch {
      Alert.alert("Error", "Could not download receipt.");
    } finally {
      setIsDownloading(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f7b731" />
        <Text style={styles.loadingText}>Loading your rides...</Text>
      </View>
    );
  }

  // ── Empty state ────────────────────────────────────────────
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      {activeTab === "ride" ? (
        <Ionicons name="car-outline" size={80} color="#333" />
      ) : (
        <MaterialIcons name="local-shipping" size={80} color="#333" />
      )}
      <Text style={styles.emptyTitle}>
        {activeTab === "ride" ? "No rides found" : "No deliveries found"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === "ride"
          ? "Take a trip with Kablux today"
          : "Send your packages with Kablux"}
      </Text>
    </View>
  );

  // ── Pagination controls ────────────────────────────────────
  const Pagination = () => {
    if (totalPages <= 1) return null;
    return (
      <View style={styles.pagination}>
        <TouchableOpacity
          style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
          onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          <Ionicons name="chevron-back" size={18} color={currentPage === 1 ? "#444" : "#fff"} />
        </TouchableOpacity>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <TouchableOpacity
            key={page}
            style={[styles.pageNum, currentPage === page && styles.pageNumActive]}
            onPress={() => setCurrentPage(page)}
          >
            <Text style={[styles.pageNumText, currentPage === page && styles.pageNumTextActive]}>
              {page}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
          onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          <Ionicons name="chevron-forward" size={18} color={currentPage === totalPages ? "#444" : "#fff"} />
        </TouchableOpacity>
      </View>
    );
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>My Activity</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {(["ride", "delivery"] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => handleTabChange(tab)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            {tab === "ride" ? (
              <Ionicons name="car" size={16} color={activeTab === tab ? "#000" : "#fff"} />
            ) : (
              <MaterialIcons name="local-shipping" size={16} color={activeTab === tab ? "#000" : "#fff"} />
            )}
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {" "}{tab === "ride" ? "Rides" : "Delivery"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter dropdown */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterMenu((v) => !v)}
        >
          <Ionicons name="filter" size={16} color="#FEB914" />
          <Text style={styles.filterButtonText}>
            {FILTERS.find((f) => f.value === filter)?.label}
          </Text>
          <Ionicons
            name={showFilterMenu ? "chevron-up" : "chevron-down"}
            size={14}
            color="#FEB914"
          />
        </TouchableOpacity>

        {showFilterMenu && (
          <View style={styles.filterMenu}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={[styles.filterMenuItem, filter === f.value && styles.filterMenuItemActive]}
                onPress={() => handleFilterChange(f.value)}
              >
                <Text style={[styles.filterMenuText, filter === f.value && styles.filterMenuTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.resultCount}>
          {dateFiltered.length} {dateFiltered.length === 1 ? "ride" : "rides"}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => { refetch(); setCurrentPage(1); }}
            tintColor="#f7b731"
            colors={["#f7b731"]}
          />
        }
      >
        {paginatedRides.length > 0
          ? paginatedRides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              onPress={() => {
                setSelectedReceipt(ride);
                setShowReceiptModal(true);
              }}
            />
          ))
          : <EmptyState />}

        <Pagination />
      </ScrollView>

      {/* Receipt Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={showReceiptModal}
        onRequestClose={() => setShowReceiptModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedReceipt && (
              <>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Ride Receipt</Text>
                  <TouchableOpacity onPress={() => setShowReceiptModal(false)}>
                    <Ionicons name="close" size={28} color="#fff" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.receiptScroll} showsVerticalScrollIndicator={false}>
                  <View style={styles.receiptDetail}>

                    {/* Receipt ID + Status */}
                    <View style={styles.receiptHeader}>
                      <Text style={styles.receiptId}>
                        Receipt #{String(selectedReceipt.id).slice(0, 8).toUpperCase()}
                      </Text>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: selectedReceipt.status === "completed" ? "#4CAF50" : "#f7b731" },
                      ]}>
                        <Text style={styles.statusText}>
                          {selectedReceipt.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {/* Detail Rows */}
                    {[
                      { label: "Date & Time", value: formatDate(selectedReceipt.date) },
                      { label: "Pickup", value: selectedReceipt.pickupAddress || "N/A" },
                      { label: "Drop-off", value: selectedReceipt.dropoffAddress || "N/A" },
                      { label: "Driver", value: selectedReceipt.driver },
                      { label: "Service", value: selectedReceipt.car },
                    ].map(({ label, value }) => (
                      <View key={label} style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{label}</Text>
                        <Text style={styles.detailValue}>{value}</Text>
                      </View>
                    ))}

                    {/* Total */}
                    <View style={styles.totalSection}>
                      <Text style={styles.totalLabel}>TOTAL FARE</Text>
                      <Text style={styles.totalValue}>
                        {formatCurrency(selectedReceipt.fare)}
                      </Text>
                    </View>

                    {/* Footer note */}
                    <View style={styles.receiptFooter}>
                      <Text style={styles.thankYou}>Thank you for riding with Kablux!</Text>
                      <Text style={styles.supportText}>Need help? Contact Hello@kabluxe.com</Text>
                    </View>

                    {/* ── PDF Preview Card ── */}
                    <View style={styles.previewCard}>
                      {/* Preview header */}
                      <View style={styles.previewHeader}>
                        <View>
                          <Text style={styles.previewBrand}>KABLUX</Text>
                          <Text style={styles.previewSubtitle}>PDF Receipt Preview</Text>
                        </View>
                        <View style={[
                          styles.previewBadge,
                          { backgroundColor: selectedReceipt.status === "completed" ? "#4CAF50" : "#f7b731" },
                        ]}>
                          <Text style={styles.previewBadgeText}>
                            {selectedReceipt.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.previewDivider} />

                      {/* Preview rows */}
                      {[
                        { emoji: "📍", label: "From", value: selectedReceipt.pickupAddress || "N/A" },
                        { emoji: "🏁", label: "To", value: selectedReceipt.dropoffAddress || "N/A" },
                        { emoji: "👤", label: "Driver", value: selectedReceipt.driver },
                        { emoji: "🕐", label: "Date", value: formatDate(selectedReceipt.date) },
                      ].map(({ emoji, label, value }) => (
                        <View key={label} style={styles.previewRow}>
                          <Text style={styles.previewLabel}>{emoji} {label}</Text>
                          <Text style={styles.previewValue} numberOfLines={2}>{value}</Text>
                        </View>
                      ))}

                      <View style={styles.previewDivider} />

                      {/* Fare */}
                      <View style={styles.previewFareRow}>
                        <Text style={styles.previewFareLabel}>TOTAL FARE</Text>
                        <Text style={styles.previewFareAmount}>
                          {formatCurrency(selectedReceipt.fare)}
                        </Text>
                      </View>

                      <Text style={styles.previewFooterText}>
                        This is a preview of your downloadable PDF receipt
                      </Text>
                    </View>

                  </View>
                </ScrollView>

                {/* Download Button */}
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => downloadReceipt(selectedReceipt)}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <ActivityIndicator color="#000" size="small" />
                  ) : (
                    <>
                      <Ionicons name="download-outline" size={20} color="#000" />
                      <Text style={styles.downloadButtonText}>Download Receipt</Text>
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
  container: { flex: 1, backgroundColor: "#000", paddingTop: 50 },
  centerContainer: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "700", marginLeft: 20, marginBottom: 20 },
  loadingText: { color: "#666", marginTop: 15 },

  // Tabs
  tabContainer: { flexDirection: "row", backgroundColor: "#111", marginHorizontal: 20, borderRadius: 25, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: "#333" },
  tab: { flex: 1, flexDirection: "row", paddingVertical: 10, justifyContent: "center", alignItems: "center", borderRadius: 20 },
  activeTab: { backgroundColor: "#f7b731" },
  tabText: { color: "#fff", fontWeight: "600" },
  activeTabText: { color: "#000", fontWeight: "bold" },

  // Filter
  filterRow: { paddingHorizontal: 20, marginBottom: 15, flexDirection: "row", alignItems: "center", zIndex: 10 },
  filterButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#111", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "#FEB914", gap: 6 },
  filterButtonText: { color: "#FEB914", fontSize: 14, fontWeight: "600" },
  filterMenu: { position: "absolute", top: 36, left: 20, backgroundColor: "#1a1a1a", borderRadius: 12, borderWidth: 1, borderColor: "#333", overflow: "hidden", zIndex: 20, minWidth: 140 },
  filterMenuItem: { paddingHorizontal: 16, paddingVertical: 12 },
  filterMenuItemActive: { backgroundColor: "#FEB91422" },
  filterMenuText: { color: "#888", fontSize: 14 },
  filterMenuTextActive: { color: "#FEB914", fontWeight: "700" },
  resultCount: { color: "#555", fontSize: 13, marginLeft: "auto" },

  // List
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  emptyTitle: { color: "#fff", fontSize: 20, fontWeight: "bold", marginTop: 20 },
  emptySubtitle: { color: "#666", fontSize: 14, marginTop: 8, marginBottom: 30 },

  // Pagination
  pagination: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 20, gap: 6 },
  pageBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#111", borderWidth: 1, borderColor: "#333", justifyContent: "center", alignItems: "center" },
  pageBtnDisabled: { borderColor: "#222" },
  pageNum: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#111", borderWidth: 1, borderColor: "#333", justifyContent: "center", alignItems: "center" },
  pageNumActive: { backgroundColor: "#f7b731", borderColor: "#f7b731" },
  pageNumText: { color: "#888", fontSize: 14, fontWeight: "600" },
  pageNumTextActive: { color: "#000" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { width: "95%", maxHeight: "90%", backgroundColor: "#1a1a1a", borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "#333" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, backgroundColor: "#111", borderBottomWidth: 1, borderBottomColor: "#333" },
  modalTitle: { fontSize: 22, fontWeight: "700", color: "#fff" },
  receiptScroll: { flex: 1 },
  receiptDetail: { padding: 20 },
  receiptHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: "#333" },
  receiptId: { color: "#888", fontSize: 14, fontWeight: "600" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#222" },
  detailLabel: { color: "#888", fontSize: 13, fontWeight: "500" },
  detailValue: { color: "#fff", fontSize: 15, fontWeight: "600", textAlign: "right", flex: 1, flexWrap: "wrap", marginLeft: 10 },
  totalSection: { backgroundColor: "#f7b731", borderRadius: 16, padding: 20, marginTop: 20, marginBottom: 20 },
  totalLabel: { color: "#000", fontSize: 14, fontWeight: "700", marginBottom: 8 },
  totalValue: { color: "#000", fontSize: 28, fontWeight: "800" },
  receiptFooter: { alignItems: "center", paddingTop: 20, borderTopWidth: 2, borderTopColor: "#333" },
  thankYou: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 8 },
  supportText: { color: "#888", fontSize: 13 },

  // PDF Preview Card
  previewCard: { marginTop: 24, backgroundColor: "#0d0d0d", borderRadius: 16, borderWidth: 1, borderColor: "#2a2a2a", padding: 20, marginBottom: 8 },
  previewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  previewBrand: { color: "#f7b731", fontSize: 20, fontWeight: "800", letterSpacing: 2 },
  previewSubtitle: { color: "#555", fontSize: 12, marginTop: 2 },
  previewBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  previewBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  previewDivider: { height: 1, backgroundColor: "#1f1f1f", marginVertical: 14 },
  previewRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  previewLabel: { color: "#555", fontSize: 12, width: 80 },
  previewValue: { color: "#ccc", fontSize: 12, fontWeight: "500", flex: 1, textAlign: "right" },
  previewFareRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  previewFareLabel: { color: "#555", fontSize: 13, fontWeight: "700", letterSpacing: 1 },
  previewFareAmount: { color: "#f7b731", fontSize: 24, fontWeight: "800" },
  previewFooterText: { color: "#333", fontSize: 11, textAlign: "center", marginTop: 16 },

  // Download button
  downloadButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#f7b731", padding: 18, margin: 20, marginTop: 12, borderRadius: 16, gap: 10 },
  downloadButtonText: { color: "#000", fontWeight: "700", fontSize: 16 },
});

export default BookingsScreen;