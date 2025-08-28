import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const RedeemPointsScreen = ({ goBack, navigation }) => {
  // Sample points history data
  const pointsHistory = [
    {
      id: 1,
      location: "Selldragon Hotel lekki",
      date: "Oct 30 - 14:50 Completed",
      points: "50ypts",
    },
    {
      id: 2,
      location: "Victoria Island Mall",
      date: "Oct 28 - 10:30 Completed",
      points: "75ypts",
    },
    {
      id: 3,
      location: "Lekki Conservation Centre",
      date: "Oct 25 - 16:20 Completed",
      points: "60ypts",
    },
  ];

  const handleConvertPoints = () => {
    // Implement points conversion logic
    alert("Points conversion functionality would go here");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={goBack}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Loyalty & Rewards</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Points Balance Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Points Balance</Text>
          <View style={styles.sectionDivider} />
          <Text style={styles.pointsBalance}>4,250ypts</Text>
          <Text style={styles.sectionTitle}>Points earning History</Text>
          <View style={styles.sectionDivider} />
        </View>

        {/* Points History Card */}
        <View style={styles.infoCard}>
          {pointsHistory.map((item, index) => (
            <View 
              key={item.id} 
              style={[
                styles.infoItem,
                index !== pointsHistory.length - 1 && styles.infoItemBorder
              ]}
            >
              <View style={styles.infoLeft}>
                <Ionicons 
                  name="calendar" 
                  size={24} 
                  color="#FEB914" 
                  style={styles.infoIcon} 
                />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoMain}>{item.location}</Text>
                  <Text style={styles.infoSub}>{item.date}</Text>
                </View>
              </View>
              <Text style={styles.infoRightText}>{item.points}</Text>
            </View>
          ))}
        </View>

        {/* How It Works Section */}
        <View style={styles.noteSection}>
          <Text style={styles.noteTitle}>How it works:</Text>
          <Text style={styles.noteItem}>
            - Each Completed ride earns 10 points for every #1000 spent.
          </Text>
          <Text style={styles.noteItem}>
            - Points can be redeemed for discounts on future rides.
          </Text>
          <Text style={styles.noteItem}>
            - Points expire after 12 months of inactivity.
          </Text>
        </View>

        {/* Convert Points Button */}
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleConvertPoints}
        >
          <Text style={styles.confirmButtonText}>Convert points</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 40,
    backgroundColor: "black",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
    marginTop: 30,
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
    }),
  },
  headerTitle: {
    fontSize: 20,
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  sectionHeader: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: "white",
    fontWeight: "700",
    marginTop: 8,
  },
  sectionDivider: {
    width: "80%",
    height: 1,
    backgroundColor: "#FEB914",
    marginVertical: 8,
  },
  pointsBalance: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FEB914",
    marginVertical: 16,
  },
  infoCard: {
    width: "100%",
    backgroundColor: "#2C2C2C",
    borderWidth: 1,
    borderColor: "#FEB914",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  infoItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#3d3d3d",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  infoIcon: {
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoMain: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
    marginBottom: 4,
  },
  infoSub: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  infoRightText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FEB914",
  },
  noteSection: {
    width: "100%",
    backgroundColor: "#2C2C2C",
    borderWidth: 1,
    borderColor: "#4B5563",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  noteTitle: {
    fontSize: 16,
    color: "#FEB914",
    fontWeight: "600",
    marginBottom: 12,
  },
  noteItem: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 8,
    lineHeight: 20,
  },
  confirmButton: {
    width: "100%",
    backgroundColor: "#FEB914",
    borderRadius: 30,
    padding: 16,
    alignItems: "center",
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  confirmButtonText: {
    color: "black",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default RedeemPointsScreen;