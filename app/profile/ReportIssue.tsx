/* eslint-disable react/no-unescaped-entities */
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export default function ReportIssue({ goBack }: { goBack: () => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#000", paddingTop: 30, }}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: 20, justifyContent: "space-between" }}>
        <TouchableOpacity onPress={goBack} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "600" }}>Report Issue</Text>
        <View style={{ width: 32 }} /> {/* Placeholder for spacing */}
      </View>
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ color: "#fff", fontSize: 18, textAlign: "center" }}>
          We're sorry to hear that you're experiencing an issue. Please contact our support team at
          hello@kabluxe.com or call us at +2349014897035 for assistance. We're here to help and will do our best to resolve your issue as quickly as possible.
        </Text>
      </View>
    </View>
  )
}