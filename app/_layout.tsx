import { RideCompletionModal } from "@/components/RideCompletionModal";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { RideProvider } from "@/context/RideContext";
import { RideIdProvider } from "@/context/RideIdContext";
import { WebSocketProvider } from "@/context/WebSocketProvider";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useForegroundNotifications } from "@/hooks/useForegroundNotifications";
import { globalLogout } from "@/scripts/auth";
import { setAuthTokenGetter, setGlobalLogout } from "@/services/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import React, { useEffect } from "react";
import "react-native-reanimated";
import MainNavigator from "./MainNavigator";

const queryClient = new QueryClient();

// Set notification handler at module level
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const checkPermissions = async () => {
  const settings = await Notifications.getPermissionsAsync();
  console.log("Notification permissions:", settings);
};

function ApiAuthConnector() {
  const { getValidToken, clearTokens } = useAuth();
  useForegroundNotifications();

  useEffect(() => {
    setAuthTokenGetter(getValidToken);
    console.log("[App] API layer connected to AuthContext");

    setGlobalLogout(async () => {
      console.log("[App] Global logout triggered via API Interceptor");
      if (clearTokens) {
        await clearTokens();
      }
      await globalLogout();
    });

    console.log("[App] Global logout registered");
  }, [getValidToken, clearTokens]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    checkPermissions();

    // ✅ Handle notification when app is opened from a notification
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        console.log("App opened from notification:", response);
        // Navigate to appropriate screen based on response.notification.request.content.data
      }
    });

    // ✅ Listen for notification taps while app is running
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("Notification tapped:", response);
        // Handle navigation based on response.notification.request.content.data
      }
    );

    return () => subscription.remove();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ApiAuthConnector />
      <RideIdProvider>
        <WebSocketProvider>
          <RideProvider>
            <QueryClientProvider client={queryClient}>
              <MainNavigator />
              <RideCompletionModal />
            </QueryClientProvider>
          </RideProvider>
        </WebSocketProvider>
      </RideIdProvider>
    </AuthProvider>
  );
}