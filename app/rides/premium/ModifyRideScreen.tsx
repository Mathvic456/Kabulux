import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Driver from '../../../assets/images/driver.png';

export default function ModifyRideScreen({setScreen, goBack}: {setScreen: (screen: string) => void; goBack: () => void}) {
  const [showPickupOverlay, setShowPickupOverlay] = useState(false);
  const [showForMeOverlay, setShowForMeOverlay] = useState(false);
  const [showAddStopOverlay, setShowAddStopOverlay] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState("Today at 4:30");
  const [selectedForMe, setSelectedForMe] = useState("For Me");
  const [stops, setStops] = useState<string[]>([]);
  const [newStop, setNewStop] = useState("");
  
  const pickupOptions = ["Today at 4:30", "Today at 5:00", "Today at 5:30", "Tomorrow at 9:00"];
  const forMeOptions = ["For Me", "For Someone Else", "For Business"];
  
  const togglePickupOverlay = () => {
    setShowPickupOverlay(!showPickupOverlay);
    setShowForMeOverlay(false);
    setShowAddStopOverlay(false);
  };
  
  const toggleForMeOverlay = () => {
    setShowForMeOverlay(!showForMeOverlay);
    setShowPickupOverlay(false);
    setShowAddStopOverlay(false);
  };
  
  const toggleAddStopOverlay = () => {
    setShowAddStopOverlay(!showAddStopOverlay);
    setShowPickupOverlay(false);
    setShowForMeOverlay(false);
  };
  
  const selectPickupOption = (option: string) => {
    setSelectedPickup(option);
    setShowPickupOverlay(false);
  };
  
  const selectForMeOption = (option: string) => {
    setSelectedForMe(option);
    setShowForMeOverlay(false);
  };

  const addStop = () => {
    if (newStop.trim()) {
      setStops([...stops, newStop.trim()]);
      setNewStop("");
      setShowAddStopOverlay(false);
    }
  };

  const removeStop = (index: number) => {
    const updatedStops = [...stops];
    updatedStops.splice(index, 1);
    setStops(updatedStops);
  };

  return (
    <View style={styles.fullScreenContainer}>
      {/* Simulated Map Background */}
      <View style={styles.mapBackground}>
        <Image
          source={{ uri: 'https://placehold.co/1000x1000/000/fff?text=Map+Placeholder' }}
          style={styles.mapImage}
        />
      </View>

      {/* Main Content Overlay */}
      <ScrollView style={styles.overlayContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Modify Ride</Text>
        </View>

        {/* Ride Details Section */}
        <View style={styles.rideDetails}>
          <Text style={styles.carName}>Mustang Shelby GT</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#f7b731" />
            <Text style={styles.ratingText}>4.9 (531 reviews)</Text>
          </View>
          <Image
            source={{ uri: 'https://placehold.co/300x200/500/FFF?text=Mustang' }}
            style={styles.carImage}
          />
        </View>

        {/* Pickup and Destination */}
        <View style={styles.scheduleContainer}>
          <TouchableOpacity style={styles.scheduleButton} onPress={togglePickupOverlay}>
            <Feather name="clock" size={18} color="#fff" />
            <Text style={styles.scheduleText}>{selectedPickup}</Text>
            <Feather name="chevron-down" size={18} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.scheduleButton} onPress={toggleForMeOverlay}>
            <Feather name="user" size={18} color="#fff" />
            <Text style={styles.scheduleText}>{selectedForMe}</Text>
            <Feather name="chevron-down" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Address Container with Stops */}
        <View style={styles.addressContainer}>
          <View style={styles.addressLine}>
            <View style={styles.dot} />
            <View style={styles.line} />
            
            {/* Render dots for stops */}
            {stops.map((_, index) => (
              <View key={index}>
                <View style={styles.smallDot} />
                <View style={styles.line} />
              </View>
            ))}
            
            <View style={styles.dot} />
          </View>
          
          <View style={styles.addressTextContainer}>
            <Text style={styles.addressText}>
              Plot 9898, obasanjor way the bells,ota,ogun satate
            </Text>
            
            {/* Render stops */}
            {stops.map((stop, index) => (
              <View key={index} style={styles.stopContainer}>
                <Text style={styles.stopText}>{stop}</Text>
                <TouchableOpacity onPress={() => removeStop(index)}>
                  <Feather name="x-circle" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity style={styles.addStopContainer} onPress={toggleAddStopOverlay}>
              <Feather name="plus-circle" size={20} color="#f7b731" />
              <Text style={styles.addStopText}>Add Stop</Text>
            </TouchableOpacity>
            
            <Text style={styles.addressText}>
              Plot 9898, obasanjor way the bells,ota,ogun satate
            </Text>
          </View>
        </View>

        {/* Pickup Options Overlay */}
        {showPickupOverlay && (
          <View style={styles.overlay}>
            <View style={styles.overlayContent}>
              <Text style={styles.overlayTitle}>Select Pickup Time</Text>
              {pickupOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    selectedPickup === option && styles.selectedOption
                  ]}
                  onPress={() => selectPickupOption(option)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedPickup === option && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                  {selectedPickup === option && (
                    <Feather name="check" size={20} color="#FEB914" />
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity 
                style={styles.closeOverlayButton}
                onPress={() => setShowPickupOverlay(false)}
              >
                <Text style={styles.closeOverlayText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* For Me Options Overlay */}
        {showForMeOverlay && (
          <View style={styles.overlay}>
            <View style={styles.overlayContent}>
              <Text style={styles.overlayTitle}>Select Ride For</Text>
              {forMeOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    selectedForMe === option && styles.selectedOption
                  ]}
                  onPress={() => selectForMeOption(option)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedForMe === option && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                  {selectedForMe === option && (
                    <Feather name="check" size={20} color="#FEB914" />
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity 
                style={styles.closeOverlayButton}
                onPress={() => setShowForMeOverlay(false)}
              >
                <Text style={styles.closeOverlayText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Add Stop Overlay */}
        {showAddStopOverlay && (
          <View style={styles.overlay}>
            <View style={styles.overlayContent}>
              <Text style={styles.overlayTitle}>Add a Stop</Text>
              
              <TextInput
                style={styles.stopInput}
                placeholder="Enter stop location"
                placeholderTextColor="#999"
                value={newStop}
                onChangeText={setNewStop}
                autoFocus={true}
              />
              
              <View style={styles.addStopButtons}>
                <TouchableOpacity 
                  style={[styles.addStopButton, styles.cancelButton]}
                  onPress={() => setShowAddStopOverlay(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.addStopButton, styles.addButton]}
                  onPress={addStop}
                  disabled={!newStop.trim()}
                >
                  <Text style={styles.addButtonText}>Add Stop</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Driver and Contact Info */}
        <View style={styles.driverContainer}>
          <View style={styles.contactButtons}>
            <View>
              <TouchableOpacity style={styles.ButtonHouse}>
                <Image
                  source={Driver}
                  style={{width:40, height:40, borderRadius:20}}
                />
              </TouchableOpacity>
              <Text style={{color:'white', textAlign:'center', marginTop:5}}>Azeez</Text>
            </View>

            <View>
              <TouchableOpacity style={styles.ButtonHouse}>
                <Ionicons name="call-outline" size={20} color="#FEC400" />
              </TouchableOpacity>
              <Text style={{color:'white', textAlign:'center', marginTop:5}}>Contact Driver</Text>
            </View>

            <View>
              <TouchableOpacity style={styles.ButtonHouse}>
                <Ionicons name="chatbubble-ellipses-outline" size={24} color="#FEC400" />
              </TouchableOpacity>
              <Text style={{color:'white', textAlign:'center', marginTop:5}}>Contact Driver</Text>
            </View>

            <View>
              <TouchableOpacity style={styles.ButtonHouse}>
                <Ionicons name="share-social-outline" size={24} color="#FEC400" />
              </TouchableOpacity>
              <Text style={{color:'white', textAlign:'center', marginTop:5}}>Contact Driver</Text>
            </View>
          </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Share ride info</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.3,
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: '#181818',
    padding: 20,
    marginTop: '45%', 
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 20,
  },
  rideDetails: {
    alignItems: 'center',
    marginBottom: 20,
  },
  carName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
  },
  carImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    resizeMode: 'contain',
    backgroundColor: 'transparent',
  },
  scheduleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flex: 1,
    marginHorizontal: 5,
  },
  scheduleText: {
    color: '#fff',
    fontSize: 14,
    marginHorizontal: 10,
    flex: 1,
  },
  addressContainer: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1c',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FEB914',
  },
  addressLine: {
    alignItems: 'center',
    marginRight: 10,
    width: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FEB914',
  },
  smallDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FEB914',
    marginVertical: 2,
  },
  line: {
    // width: 2,
    height: 50,
    backgroundColor: '#FEB914',
    marginVertical: 5,
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: '#FEB914',
  },

  
  addressTextContainer: {
    flex: 1,
  },
  addressText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 20,
  },
  stopContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  stopText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  addStopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  addStopText: {
    color: '#FEB914',
    fontSize: 16,
    marginLeft: 10,
  },
  driverContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  ButtonHouse: { 
    borderWidth: 2, 
    borderColor: '#FEC400',
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: '#1F212A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    backgroundColor: '#FEC400',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  shareButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Overlay styles
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  overlayContent: {
    backgroundColor: '#1c1c1c',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  overlayTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectedOption: {
    backgroundColor: '#2a2a2a',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedOptionText: {
    color: '#FEB914',
    fontWeight: 'bold',
  },
  closeOverlayButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FEB914',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeOverlayText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Add stop overlay styles
  stopInput: {
    borderWidth: 1,
    borderColor: '#FEB914',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    backgroundColor: '#2a2a2a',
    marginBottom: 20,
  },
  addStopButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addStopButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#444',
  },
  addButton: {
    backgroundColor: '#FEB914',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});