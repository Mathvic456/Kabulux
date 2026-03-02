import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Ride = {
  id: string;
  driver: string;
  pickup_address: string;
  dropoff_address: string;
  start_time: string | null;
  end_time: string | null;
  fare: string;
  status: "completed" | "cancelled" | string;
  rider: string;
};

const PAGE_SIZE = 5;

export function RideReceiptsScreen({ goBack }: { goBack: () => void }) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const fetchRideHistory = async (page: number) => {
    setLoading(true);
    try {
      const response = await api.get(`rides/history/`, {
        params: { page, page_size: PAGE_SIZE },
      });
      const data = response.data;
      setRides(data.results);
      setTotalCount(data.count);
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", "Could not fetch ride history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRideHistory(currentPage);
  }, [currentPage]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFare = (fare: string) =>
    `₦${parseFloat(fare).toLocaleString("en-NG")}`;

  const viewDetails = (ride: Ride) => {
    setSelectedRide(ride);
    setShowDetailModal(true);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Receipts</Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FEB914" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {rides.length === 0 ? (
            <Text style={styles.emptyText}>No rides found.</Text>
          ) : (
            rides.map((ride) => (
              <TouchableOpacity
                key={ride.id}
                style={[
                  styles.receiptCard,
                  ride.status === "cancelled" && styles.receiptCardCancelled,
                ]}
                onPress={() => viewDetails(ride)}
              >
                <View style={styles.receiptHeader}>
                  <Text style={styles.receiptDate}>
                    {formatDate(ride.start_time || ride.end_time)}
                  </Text>
                  <View style={styles.fareRow}>
                    <Text style={styles.receiptFare}>{formatFare(ride.fare)}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        ride.status === "completed"
                          ? styles.statusCompleted
                          : styles.statusCancelled,
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.receiptRoute}>
                  <View style={styles.routeRow}>
                    <Ionicons name="radio-button-on" size={14} color="#FEB914" />
                    <Text style={styles.routeText} numberOfLines={1}>
                      {ride.pickup_address}
                    </Text>
                  </View>
                  <View style={styles.routeDivider} />
                  <View style={styles.routeRow}>
                    <Ionicons name="location" size={14} color="#FEB914" />
                    <Text style={styles.routeText} numberOfLines={1}>
                      {ride.dropoff_address}
                    </Text>
                  </View>
                </View>

                <View style={styles.receiptFooter}>
                  <Text style={styles.receiptTime}>
                    {formatTime(ride.start_time)}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[
                  styles.pageButton,
                  currentPage === 1 && styles.pageButtonDisabled,
                ]}
                onPress={goToPreviousPage}
                disabled={currentPage === 1}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={currentPage === 1 ? "#555" : "#FEB914"}
                />
              </TouchableOpacity>

              <Text style={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </Text>

              <TouchableOpacity
                style={[
                  styles.pageButton,
                  currentPage === totalPages && styles.pageButtonDisabled,
                ]}
                onPress={goToNextPage}
                disabled={currentPage === totalPages}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={currentPage === totalPages ? "#555" : "#FEB914"}
                />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Receipt Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDetailModal}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            {selectedRide && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Ride Receipt</Text>
                  <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>
                </View>

                <ScrollView>
                  <View style={styles.receiptDetail}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          selectedRide.status === "completed"
                            ? styles.statusCompleted
                            : styles.statusCancelled,
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {selectedRide.status.charAt(0).toUpperCase() +
                            selectedRide.status.slice(1)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(selectedRide.start_time || selectedRide.end_time)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Time</Text>
                      <Text style={styles.detailValue}>
                        {formatTime(selectedRide.start_time)}
                        {selectedRide.end_time
                          ? ` – ${formatTime(selectedRide.end_time)}`
                          : ""}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Pickup</Text>
                      <Text style={[styles.detailValue, { flex: 1, marginLeft: 16 }]}>
                        {selectedRide.pickup_address}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Dropoff</Text>
                      <Text style={[styles.detailValue, { flex: 1, marginLeft: 16 }]}>
                        {selectedRide.dropoff_address}
                      </Text>
                    </View>

                    <View style={[styles.detailRow, styles.totalRow]}>
                      <Text style={styles.totalLabel}>Total Fare</Text>
                      <Text style={styles.totalValue}>
                        {formatFare(selectedRide.fare)}
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 10 : 40,
    backgroundColor: "black",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    position: "relative",
    marginTop: 20,
  },
  backButton: {
    position: "absolute",
    left: 20,
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "white",
  },
  receiptCard: {
    backgroundColor: "#2C2C2C",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FEB914",
  },
  receiptCardCancelled: {
    borderLeftColor: "#6B7280",
  },
  receiptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  fareRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  receiptDate: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  receiptFare: {
    color: "#FEB914",
    fontSize: 18,
    fontWeight: "700",
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusCompleted: {
    backgroundColor: "rgba(74, 222, 128, 0.15)",
  },
  statusCancelled: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  receiptRoute: {
    marginBottom: 10,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  routeDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#374151",
    marginLeft: 7,
    marginVertical: 2,
  },
  routeText: {
    color: "white",
    fontSize: 14,
    flex: 1,
  },
  receiptFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  receiptTime: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 20,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2C2C2C",
    justifyContent: "center",
    alignItems: "center",
  },
  pageButtonDisabled: {
    opacity: 0.4,
  },
  pageInfo: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  detailModalContent: {
    width: "90%",
    backgroundColor: "#2C2C2C",
    borderRadius: 16,
    padding: 0,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  receiptDetail: {
    padding: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  detailLabel: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  detailValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "right",
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: "#374151",
  },
  totalLabel: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  totalValue: {
    color: "#FEB914",
    fontSize: 18,
    fontWeight: "700",
  },
});