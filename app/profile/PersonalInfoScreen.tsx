import { useProfile } from "@/services/profile.service";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ActivityIndicator, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PersonalInfoScreenProps = {
  goBack: () => void;
};

export default function PersonalInfoScreen({
  goBack,
}: PersonalInfoScreenProps) {
  const { data: profile, isLoading } = useProfile();

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "Not set";
    const digits = phone.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 11)}`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FEB914" />
        <Text style={styles.loadingText}>Loading your information...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Info</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Email Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="email" size={24} color="#FEB914" />
          <Text style={styles.cardLabel}>Email</Text>
        </View>
        <Text style={styles.cardValue}>{profile?.email || "Not set"}</Text>
      </View>

      {/* Phone Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="call" size={24} color="#FEB914" />
          <Text style={styles.cardLabel}>Phone Number</Text>
        </View>
        <Text style={styles.cardValue}>{formatPhoneNumber(profile?.phone_number || "")}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    marginTop: 20,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    marginTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    color: "white",
    fontWeight: "700",
  },
  headerSpacer: {
    width: 40,
  },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardLabel: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 36,
  },
});
