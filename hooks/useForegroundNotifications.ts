import messaging from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

export const useForegroundNotifications = () => {
  useEffect(() => {
    console.log("🔔 Foreground notification listener registered");

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log("🔔 [FOREGROUND] Message received!", remoteMessage);
      console.log("🔔 [FOREGROUND] Notification:", remoteMessage.notification);
      console.log("🔔 [FOREGROUND] Data:", remoteMessage.data);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification?.title || "No title",
          body: remoteMessage.notification?.body || "No body",
          data: remoteMessage.data,
        },
        trigger: null,
      });

      console.log("🔔 [FOREGROUND] Local notification scheduled");
    });

    return () => {
      console.log("🔔 Foreground notification listener unsubscribed");
      unsubscribe();
    };
  }, []);
};
