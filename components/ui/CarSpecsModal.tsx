import { Feather } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CarSpecsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Specifications</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Click to go back</Text>
            </TouchableOpacity>
          </View>

          {/* Specification cards */}
          <View style={styles.specsRow}>
            <View style={styles.specCard}>
              <Feather name="zap" size={20} color="#fff" />
              <Text style={styles.specTitle}>Max. power</Text>
              <Text style={styles.specValue}>2500hp</Text>
            </View>

            <View style={styles.specCard}>
              <Feather name="droplet" size={20} color="#fff" />
              <Text style={styles.specTitle}>Fuel</Text>
              <Text style={styles.specValue}>10km per litre</Text>
            </View>
          </View>

          <View style={styles.specsRow}>
            <View style={styles.specCard}>
              <Feather name="trending-up" size={20} color="#fff" />
              <Text style={styles.specTitle}>Max. speed</Text>
              <Text style={styles.specValue}>230kph</Text>
            </View>

            <View style={styles.specCard}>
              <Feather name="activity" size={20} color="#fff" />
              <Text style={styles.specTitle}>0–60mph</Text>
              <Text style={styles.specValue}>2.5sec</Text>
            </View>
          </View>

          {/* Car Features */}
          <Text style={styles.subHeader}>Car features</Text>
          <View style={styles.featureBox}><Text style={styles.featureText}>Model: GT5000</Text></View>
          <View style={styles.featureBox}><Text style={styles.featureText}>Capacity: 760hp</Text></View>
          <View style={styles.featureBox}><Text style={styles.featureText}>Color: Red</Text></View>
          <View style={styles.featureBox}><Text style={styles.featureText}>Fuel type: Octane</Text></View>
          <View style={styles.featureBox}><Text style={styles.featureText}>Gear type: Automatic</Text></View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "90%", backgroundColor: "#181818", borderRadius: 15, padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 18, fontWeight: "bold", color: "white" },
  closeText: { color: "#f6a623" },
  specsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  specCard: { backgroundColor: "#1c1c1c", padding: 15, borderRadius: 10, alignItems: "center", flex: 1, marginHorizontal: 5 },
  specTitle: { color: "#aaa", fontSize: 12, marginTop: 5 },
  specValue: { color: "#fff", fontWeight: "bold", marginTop: 3 },
  subHeader: { fontSize: 16, fontWeight: "bold", color: "white", marginTop: 15, marginBottom: 10 },
  featureBox: { backgroundColor: "#1c1c1c", padding: 12, borderRadius: 8, marginBottom: 10 },
  featureText: { color: "white" },
});
