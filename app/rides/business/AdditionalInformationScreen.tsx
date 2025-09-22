import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const vehicleTypes = [
  "SUV",
  "Jeep",
  "Honda",
  "Benz",
  "Escort Van",
  "Police Van",
];

export default function AdditionalInformationScreen({
  setScreen,
  goBack,
  rideOptions,
  setRideOptions,
}: {
  setScreen: (screen: string) => void;
  goBack: () => void;
  rideOptions: any;
  setRideOptions: (options: any) => void;
}) {
  const [securityChosen, setSecurityChosen] = useState(false);
  const [escortChosen, setEscortChosen] = useState(false);

  const [securityCount, setSecurityCount] = useState<number | null>(null);
  const [armsOption, setArmsOption] = useState<string | null>(null);

  const [escortCount, setEscortCount] = useState<number | null>(null);
  const [vehicleType, setVehicleType] = useState<string | null>(null);

  const renderOption = (
    label: string,
    selected: string | null,
    setSelected: (value: string) => void
  ) => (
    <TouchableOpacity
      style={[styles.optionButton, selected === label && styles.optionSelected]}
      onPress={() => setSelected(label)}
    >
      <Text
        style={[
          styles.optionText,
          selected === label && styles.optionTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const continueButton = () => {
    setRideOptions({
    securityChosen,
    securityCount,
    armsOption,
    escortChosen,
    escortCount,
    vehicleType,
  });

  // pass along with screen change
  setScreen("specialServices");
  };

  const renderNumberSelector = (
    label: string,
    selected: number | null,
    setSelected: (value: number) => void
  ) => (
    <View style={{ marginBottom: 15 }}>
      <Text style={styles.subLabel}>{label}</Text>
      <View style={styles.optionRow}>
        {[1, 2, 3, 4, 5].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.optionButton,
              selected === num && styles.optionSelected,
            ]}
            onPress={() => setSelected(num)}
          >
            <Text
              style={[
                styles.optionText,
                selected === num && styles.optionTextSelected,
              ]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.kabluxText}>
          Kablux <Text style={styles.businessText}>Business</Text>
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.contentContainer}>
        <Text style={styles.title}>Additional Information</Text>
        <Text style={styles.subtitle}>
          Choose from this list of our premium package to be added to your ride
          or other services
        </Text>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <TouchableOpacity
            style={[
              styles.optionButton,
              securityChosen && styles.optionSelected,
            ]}
            onPress={() => setSecurityChosen(!securityChosen)}
          >
            <Text
              style={[
                styles.optionText,
                securityChosen && styles.optionTextSelected,
              ]}
            >
              {securityChosen ? "Remove Security" : "Add Security"}
            </Text>
          </TouchableOpacity>

          {securityChosen && (
            <>
              {renderNumberSelector(
                "Number of Personnel",
                securityCount,
                setSecurityCount
              )}

              <Text style={styles.subLabel}>Arms Option</Text>
              <View style={styles.optionRow}>
                {renderOption("With Arms", armsOption, setArmsOption)}
                {renderOption("Without Arms", armsOption, setArmsOption)}
              </View>
            </>
          )}
        </View>

        {/* Vehicle Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Escort</Text>
          <TouchableOpacity
            style={[
              styles.optionButton,
              escortChosen && styles.optionSelected,
            ]}
            onPress={() => setEscortChosen(!escortChosen)}
          >
            <Text
              style={[
                styles.optionText,
                escortChosen && styles.optionTextSelected,
              ]}
            >
              {escortChosen ? "Remove Escort" : "Add Escort"}
            </Text>
          </TouchableOpacity>

          {escortChosen && (
            <>
              {renderNumberSelector(
                "Number of Escorts",
                escortCount,
                setEscortCount
              )}

              <Text style={styles.vehicleTypeTitle}>Vehicle Type</Text>
              <View style={styles.vehicleTypeContainer}>
                {vehicleTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.vehicleTypeButton,
                      vehicleType === type && styles.selectedVehicleType,
                    ]}
                    onPress={() => setVehicleType(type)}
                  >
                    <Text
                      style={[
                        styles.vehicleTypeText,
                        vehicleType === type && styles.vehicleTypeTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={continueButton}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: { marginRight: 10 },
  kabluxText: { fontSize: 22, fontWeight: "bold", color: "white" },
  businessText: { fontSize: 16, color: "#f6a623" },

  contentContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
  },
  section: {
    backgroundColor: "#1c1c1c",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  optionButton: {
    flex: 1,
    backgroundColor: "#2b2b2b",
    borderRadius: 10,
    paddingVertical: 12,
    marginHorizontal: 5,
    alignItems: "center",
  },
  optionSelected: { backgroundColor: "#f6a623" },
  optionText: { color: "white", fontSize: 14 },
  optionTextSelected: { color: "#000", fontWeight: "bold" },

  subLabel: {
    fontSize: 14,
    color: "#bbb",
    marginBottom: 8,
    marginTop: 10,
  },

  vehicleTypeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginTop: 10,
    marginBottom: 10,
  },
  vehicleTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  vehicleTypeButton: {
    backgroundColor: "#2b2b2b",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    margin: 5,
  },
  selectedVehicleType: { backgroundColor: "#f6a623" },
  vehicleTypeText: { color: "white", fontSize: 14 },
  vehicleTypeTextSelected: { color: "#000", fontWeight: "bold" },

  nextButton: {
    backgroundColor: "#f6a623",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    marginHorizontal: 20,
  },
  nextButtonText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
});
