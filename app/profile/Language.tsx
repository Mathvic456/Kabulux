import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
// import { LanguageScreen } from './ExtraScreens'

const LanguageScreen = ({ goBack }: { goBack: () => void }) => {
  return (
    <View style={{ flex: 1, backgroundColor: "#000", paddingTop: 30 }}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: 20, justifyContent: "space-between" }}>
        <TouchableOpacity onPress={goBack} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "600" }}>Language</Text>
        <View style={{ width: 32 }} />
      </View>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: "#fff", fontSize: 18, textAlign: "center" }}>
          Language selection is currently unavailable. We are working to add this feature in a future update. Please check back later.
        </Text>
      </View>
    </View>
  )
}

export default LanguageScreen