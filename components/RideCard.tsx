import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

// The shape the UI expects
export interface Ride {
  id: number | string;
  car: string;
  date: string;
  driver: string;
  rating: number;
  image: any;
  type: "ride" | "delivery";
  status: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  fare?: number;
}

interface RideCardProps {
  ride: Ride;
  onPress: () => void;
  onBookAgain?: () => void;
}

export const RideCard: React.FC<RideCardProps> = ({ ride, onPress, onBookAgain }) => {
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date not available";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    // Assuming backend returns Kobo/Cents (e.g. 93200 -> 932.00)
    // Adjust logic if backend returns actual Naira
    const value = amount; 
    return `₦${value.toLocaleString('en-NG', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#f7b731';
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={{
        backgroundColor: "#111",
        marginHorizontal: 15,
        marginVertical: 8,
        padding: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#333", // Subtle border
      }}>
        {/* Top Row: Status & Fare */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <View style={{
            backgroundColor: getStatusColor(ride.status) + '20', // 20% opacity background
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: getStatusColor(ride.status),
          }}>
            <Text style={{ color: getStatusColor(ride.status), fontSize: 10, fontWeight: "700", textTransform: "uppercase" }}>
              {ride.status}
            </Text>
          </View>
          
          {ride.fare !== undefined && (
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
              {formatCurrency(ride.fare)}
            </Text>
          )}
        </View>

        {/* Middle Row: Car & Date */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
          <View>
            <Text style={{ color: "#f7b731", fontWeight: "bold", fontSize: 16, marginBottom: 4 }}>
              {ride.car}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="time-outline" size={12} color="#888" style={{ marginRight: 4 }} />
              <Text style={{ color: "#888", fontSize: 12 }}>{formatDate(ride.date)}</Text>
            </View>
          </View>
          
          {/* Driver ID/Name (Truncated if UUID) */}
          <View style={{ alignItems: 'flex-end' }}>
             <View style={{ flexDirection: "row" }}>
              {[...Array(ride.rating)].map((_, i) => (
                <FontAwesome key={i} name="star" size={12} color="#f7b731" style={{ marginLeft: 2 }} />
              ))}
            </View>
            <Text style={{ color: "#666", fontSize: 10, marginTop: 4 }}>
               Driver: {ride.driver.length > 10 ? ride.driver.substring(0,8) + '...' : ride.driver}
            </Text>
          </View>
        </View>

        {/* Location Info */}
        <View style={{ paddingTop: 12, borderTopWidth: 1, borderTopColor: "#222" }}>
          {ride.pickupAddress && (
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#4CAF50", marginRight: 8 }} />
              <Text style={{ color: "#ccc", fontSize: 12, flex: 1 }} numberOfLines={1}>
                {ride.pickupAddress}
              </Text>
            </View>
          )}
          {ride.dropoffAddress && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#F44336", marginRight: 8 }} />
              <Text style={{ color: "#ccc", fontSize: 12, flex: 1 }} numberOfLines={1}>
                {ride.dropoffAddress}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};