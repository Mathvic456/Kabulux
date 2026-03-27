import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
// import { AboutUsScreen } from './ExtraScreens'

export default function AboutUs({ goBack }: { goBack: () => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#000", paddingTop: 30 }}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: 20, justifyContent: "space-between" }}>
        <TouchableOpacity onPress={goBack} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "600" }}>About Us</Text>
        <View style={{ width: 32 }} /> {/* Placeholder for spacing */}
      </View>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: "#fff", fontSize: 18, textAlign: "center" }}>
          Kablux Drive is a leading ride-hailing service committed to providing safe, reliable, and affordable transportation solutions. Our mission is to connect riders with drivers seamlessly while prioritizing safety and customer satisfaction. With a user-friendly app and a fleet of professional drivers, we strive to make every ride a pleasant experience for our customers.
        </Text>
      </View>
    </View>
  )
}