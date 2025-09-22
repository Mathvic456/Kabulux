import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SpecialServicesScreen({
  setScreen,
  goBack,
  rideOptions,
  goNext,
}: {
  setScreen: (screen: string) => void;
  goBack: () => void;
  rideOptions: any;
  goNext: () => void;
}) {
  // pull values from screen one
  const {
    securityChosen,
    securityCount,
    armsOption,
    escortChosen,
    escortCount,
    vehicleType,
  } = rideOptions || {};

  const [escortSelected, setEscortSelected] = useState(escortCount || 4);
  const [seatSelected, setSeatSelected] = useState(2);
  const [request, setRequest] = useState("");

  const escortOptions = [4, 6, 8, 10];
  const seatOptions = [2, 3, 4, 5];

  const continueButton = () => {
    setScreen("modifyRide");
  }

  const handleSaveCard = () => {
    // Log the final ride options
    console.log("Final ride options:", {
      ...rideOptions,
      escortSelected,
      seatSelected,
      request, 
    });
    
    // Navigate to the next screen using setScreen
    setScreen("modifyRide"); // Replace "nextScreen" with your desired screen name
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Special Services</Text>
      </View>

      {/* Escort Services */}
      {escortChosen && (
        <View style={styles.section}>
          <Text style={styles.subHeader}>Escort Services</Text>
          <Text style={styles.note}>Minimum 4 Personnels</Text>

          <View style={styles.optionsRow}>
            {escortOptions.map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.optionButton,
                  escortSelected === num && styles.optionSelected,
                ]}
                onPress={() => setEscortSelected(num)}
              >
                <Ionicons
                  name="person"
                  size={16}
                  color={escortSelected === num ? "#000" : "#FFD700"}
                />
                <Text
                  style={[
                    styles.optionText,
                    escortSelected === num && { color: "#000" },
                  ]}
                >
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Security (just showing summary) */}
      {securityChosen && (
        <View style={styles.section}>
          <Text style={styles.subHeader}>Security Selected</Text>
          <Text style={styles.bodyText}>
            {securityCount} Personnel, {armsOption}
          </Text>
        </View>
      )}

      {/* Vehicle Type (summary) */}
      {escortChosen && vehicleType && (
        <View style={styles.section}>
          <Text style={styles.subHeader}>Escort Vehicle</Text>
          <Text style={styles.bodyText}>{vehicleType}</Text>
        </View>
      )}

      {/* Seats */}
      <View style={styles.section}>
        <Text style={styles.subHeader}>Number of seats</Text>
        <View style={styles.optionsRow}>
          {seatOptions.map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.optionButton,
                seatSelected === num && styles.optionSelected,
              ]
              }
              onPress={() => setSeatSelected(num)}
            >
              <Ionicons
                name="person"
                size={16}
                color={seatSelected === num ? "#000" : "#FFD700"}
              />
              <Text
                style={[
                  styles.optionText,
                  seatSelected === num && { color: "#000" },
                ]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Request Input */}
      <Text style={styles.subHeader}>
        Request or changes to be made to ride.....
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Type your request..."
        placeholderTextColor="#999"
        value={request}
        onChangeText={setRequest}
      />

      {/* Buttons */}
      <TouchableOpacity style={styles.editButton} onPress={goBack}>
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveCard}
      >
        <Text style={styles.saveText}>Save card</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", paddingTop: 40, paddingHorizontal: 20   },
  headerContainer: { alignItems: "center", marginBottom: 20 },
  header: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  section: {
    backgroundColor: "black",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  subHeader: { fontSize: 16, fontWeight: "600", color: "#fff" },
  note: { fontSize: 12, color: "#bbb", marginBottom: 10 },
  bodyText: { fontSize: 13, color: "#ccc", marginVertical: 8 },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#1c1c1c",
    margin: 5,
  },
  optionSelected: { backgroundColor: "#FEB914", borderColor: "#FFD700" },
  optionText: { fontSize: 14, marginLeft: 5, color: "white" },
  input: {
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    marginVertical: 10,
    backgroundColor: "#1c1c1c",
  },
  editButton: {
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    alignItems: "center",
  },
  editText: { color: "#fff", fontSize: 14 },
  saveButton: {
    backgroundColor: "#FEB914",
    borderRadius: 10,
    padding: 14,
    marginTop: 15,
    marginBottom: 20,
    alignItems: "center",
  },
  saveText: { color: "#000", fontSize: 15, fontWeight: "bold" },
});