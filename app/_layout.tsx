import { RideCompletionModal } from "@/components/RideCompletionModal";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { RideProvider } from "@/context/RideContext";
import { RideIdProvider } from "@/context/RideIdContext";
import { WebSocketProvider } from "@/context/WebSocketProvider";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useForegroundNotifications } from "@/hooks/useForegroundNotifications";
import { globalLogout } from "@/scripts/auth";
import { setAuthTokenGetter, setGlobalLogout } from "@/services/api";
import messaging from "@react-native-firebase/messaging";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import Notifications from "expo-notifications";
import React, { useEffect } from "react";
import "react-native-reanimated";
import MainNavigator from "./MainNavigator";

const queryClient = new QueryClient();

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("Background notification received:", remoteMessage);
  // Process data, update local storage, etc.
});

useEffect(() => {
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log("App opened from notification:", remoteMessage);
        // Navigate to appropriate screen based on remoteMessage.data
      }
    });
}, []);

useEffect(() => {
  const unsubscribe = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log("Notification tapped:", response);
      // Navigate based on response.notification.request.content.data
    },
  );

  return () => unsubscribe.remove();
}, []);

function ApiAuthConnector() {
  const { getValidToken, clearTokens } = useAuth();
  useForegroundNotifications();

  useEffect(() => {
    setAuthTokenGetter(getValidToken);
    console.log("[App] API layer connected to AuthContext");

    setGlobalLogout(async () => {
      console.log("🚪 [App] Global logout triggered via API Interceptor");
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

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ApiAuthConnector />
      <RideIdProvider>
        {" "}
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
