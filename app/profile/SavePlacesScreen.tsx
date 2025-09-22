import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function SavedPlacesScreen({ goBack, next }: { goBack: () => void; next?: () => void}) {
  // State for saved addresses
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentModalType, setCurrentModalType] = useState(null); // 'home', 'work', or 'place'
  const [addressInput, setAddressInput] = useState("");

  // Function to handle back button press
  const handleBack = () => {
    if (goBack) {
      goBack();
    }
  };

  // Function to open modal
  const openModal = (type) => {
    setCurrentModalType(type);
    setAddressInput("");
    setModalVisible(true);
  };

  // Function to close modal
  const closeModal = () => {
    setModalVisible(false);
    setCurrentModalType(null);
    setAddressInput("");
  };

  // Function to save address
  const saveAddress = () => {
    if (addressInput.trim()) {
      const newAddress = {
        id: Date.now().toString(),
        type: currentModalType,
        name: currentModalType === 'home' ? 'Home' : 
              currentModalType === 'work' ? 'Work' : 'Custom Place',
        address: addressInput.trim(),
        timestamp: new Date(),
      };

      setSavedAddresses([...savedAddresses, newAddress]);
      closeModal();
    }
  };

  // Function to handle selecting a saved place
  const handleSelectPlace = (place) => {
    alert(`Selected: ${place.name}\nAddress: ${place.address}`);
  };

  // Get home and work addresses from saved addresses
  const homeAddress = savedAddresses.find(addr => addr.type === 'home');
  const workAddress = savedAddresses.find(addr => addr.type === 'work');
  const otherAddresses = savedAddresses.filter(addr => 
    addr.type !== 'home' && addr.type !== 'work'
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Places</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Favourites Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Favourites</Text>
        </View>

        <View style={styles.infoCard}>
          {homeAddress ? (
            <TouchableOpacity
              style={[styles.infoItem, styles.noHover]}
              onPress={() => handleSelectPlace(homeAddress)}
              activeOpacity={1}
            >
              <View style={styles.infoLeft}>
                <Ionicons 
                  name="home" 
                  size={24} 
                  color="#FEB914" 
                  style={styles.infoIcon} 
                />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoMain}>Home</Text>
                  <Text style={styles.infoSub}>{homeAddress.address}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FEB914" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.infoItem}
              onPress={() => openModal('home')}
              activeOpacity={0.7}
            >
              <View style={styles.infoLeft}>
                <Ionicons 
                  name="home-outline" 
                  size={24} 
                  color="#FEB914" 
                  style={styles.infoIcon} 
                />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoMain}>Add Home</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FEB914" />
            </TouchableOpacity>
          )}

          {workAddress ? (
            <TouchableOpacity
              style={[styles.infoItem, styles.noHover]}
              onPress={() => handleSelectPlace(workAddress)}
              activeOpacity={1}
            >
              <View style={styles.infoLeft}>
                <Ionicons 
                  name="business" 
                  size={24} 
                  color="#FEB914" 
                  style={styles.infoIcon} 
                />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoMain}>Work</Text>
                  <Text style={styles.infoSub}>{workAddress.address}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FEB914" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.infoItem}
              onPress={() => openModal('work')}
              activeOpacity={0.7}
            >
              <View style={styles.infoLeft}>
                <Ionicons 
                  name="business-outline" 
                  size={24} 
                  color="#FEB914" 
                  style={styles.infoIcon} 
                />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoMain}>Add Work</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FEB914" />
            </TouchableOpacity>
          )}
        </View>

        {/* Other Places Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Other Places</Text>
          <Text style={styles.sectionSubtitle}>
            Get to your Favourite destinations faster
          </Text>
        </View>

        <View style={styles.infoCard}>
          {otherAddresses.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={[styles.infoItem, styles.noHover]}
              onPress={() => handleSelectPlace(place)}
              activeOpacity={1}
            >
              <View style={styles.infoLeft}>
                <Ionicons 
                  name="location" 
                  size={24} 
                  color="#FEB914" 
                  style={styles.infoIcon} 
                />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoMain}>{place.name}</Text>
                  <Text style={styles.infoSub}>{place.address}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FEB914" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => openModal('place')}
            activeOpacity={0.7}
          >
            <View style={styles.infoLeft}>
              <Ionicons 
                name="add-circle-outline" 
                size={24} 
                color="#FEB914" 
                style={styles.infoIcon} 
              />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoMain}>Add a place</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Custom Modal for Adding Addresses */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>
                {currentModalType === 'home' && 'Add Home Address'}
                {currentModalType === 'work' && 'Add Work Address'}
                {currentModalType === 'place' && 'Add a New Place'}
              </Text>
              
              <TextInput
                style={styles.input}
                onChangeText={setAddressInput}
                value={addressInput}
                placeholder="Enter address"
                placeholderTextColor="#9CA3AF"
                multiline={true}
                numberOfLines={3}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={closeModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveAddress}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
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
    marginTop:30,
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
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: "white",
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  infoCard: {
    backgroundColor: "#2C2C2C",
    borderWidth: 1,
    borderColor: "#FEB914",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    minHeight: 60,
  },
  noHover: {
    // This will prevent the hover effect
    // In React Native, we control this via activeOpacity
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
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
  },
  infoSub: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    width: '85%',
    backgroundColor: '#2C2C2C',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FEB914',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    minHeight: 100,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
    color: 'white',
    textAlignVertical: 'top',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#FEB914',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FEB914',
  },
  saveButton: {
    backgroundColor: '#FEB914',
    marginLeft: 15,
  },
  cancelButtonText: {
    color: '#FEB914',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});