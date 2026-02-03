import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";

export const useForegroundNotifications = () => {
  const notificationListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    console.log("Foreground notification listener registered");

    //Listen for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(
      async (notification) => {
        console.log("[FOREGROUND] Notification received!", notification);
        console.log("[FOREGROUND] Title:", notification.request.content.title);
        console.log("[FOREGROUND] Body:", notification.request.content.body);
        console.log("[FOREGROUND] Data:", notification.request.content.data);

        // The notification is automatically displayed by the NotificationHandler
        // No need to manually schedule it
      }
    );

    return () => {
      console.log("Foreground notification listener unsubscribed");
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
    };
  }, []);
};