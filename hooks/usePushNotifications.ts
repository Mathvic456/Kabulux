import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // ✅ Added
    shouldShowList: true,   // ✅ Added
  }),
});

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();

  // Fixed: Provide null as initial value
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  async function registerForPushNotificationsAsync(): Promise<string | null> {
    try {
      if (Platform.OS === "android") {
        try {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
            sound: 'kablux-sound.mp3',
            enableVibrate: true,
          });
        } catch (channelError) {
          console.error("❌ Failed to set Android notification channel:", channelError);
        }
      }

      if (!Device.isDevice) {
        console.log("Must use physical device for Push Notifications");
        return null;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("❌ Push notification permission denied");
        return null;
      }

      console.log("✅ Push notification permission granted");

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId, // Get this from app.json or expo.dev
      });

      const token = tokenData.data;
      console.log("🔔 Expo Push Token:", token);
      setExpoPushToken(token);

      return token;
    } catch (error) {
      console.error("Error getting push token:", error);
      return null;
    }
  }

  useEffect(() => {
    // Register for push notifications on mount
    registerForPushNotificationsAsync();

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("📬 Notification received:", notification);
        setNotification(notification);
      }
    );

    // Listen for notification interactions
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("👆 Notification tapped:", response);
        // Handle notification tap here
      }
    );

    // ✅ Fixed: Use .remove() instead of removeNotificationSubscription
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
    registerForPushNotificationsAsync,
  };
};