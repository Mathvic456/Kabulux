import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import BookingsScreen from "./BookingsScreen";
import HomeScreen from "./HomeScreen";
import ProfileScreen from "./ProfileScreen";
import WalletScreen from "./WalletScreen";

const Tab = createBottomTabNavigator();

<<<<<<< HEAD

export default function TabNavigator({ setScreen, setSelectedRide }) {
=======
type TabNavigatorProps = {
  setScreen: (screen: string) => void;
  setSelectedRide: (ride: any) => void;
};

export default function TabNavigator({ setScreen, setSelectedRide }: TabNavigatorProps) {
>>>>>>> b17ea38803b3ce506dc0ab1b208f894776b83738
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#FEB914",
        tabBarInactiveTintColor: "white",
        tabBarStyle: {
          backgroundColor: "#2C2C2C",
          borderTopWidth: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: "absolute",
          overflow: "hidden",
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarIcon: ({ color }) => {
          if (route.name === "Home") {
            return <AntDesign name="home" size={20} color={color} />;
          } else if (route.name === "Bookings") {
            return <FontAwesome6 name="clock-rotate-left" size={20} color={color} />;
          } else if (route.name === "Wallet") {
            return <Ionicons name="wallet" size={20} color={color} />;
          } else if (route.name === "Profile") {
            return <FontAwesome5 name="user-circle" size={20} color={color} />;
          }
        },
      })}
    >
      {/* Pass setScreen and setSelectedRide to HomeScreen using render function */}
      <Tab.Screen name="Home">
        {() => <HomeScreen setScreen={setScreen} />}
      </Tab.Screen>
      
      <Tab.Screen name="Bookings">
       {() => <BookingsScreen setScreen={setScreen} setSelectedRide={setSelectedRide}/>}
      </Tab.Screen>

      {/* Pass setScreen down to WalletScreen */}
      <Tab.Screen name="Wallet">
        {() => <WalletScreen setScreen={setScreen} />}
      </Tab.Screen>

      <Tab.Screen name="Profile">
        {() => <ProfileScreen setScreen={setScreen} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}