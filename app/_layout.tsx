import { AuthProvider, useAuth } from '@/context/AuthContext';
import { WebSocketProvider } from "@/context/WebSocketProvider";
import { useColorScheme } from "@/hooks/useColorScheme";
import { globalLogout } from '@/scripts/auth'; // <--- IMPORT THE LOGOUT FUNCTION
import { setAuthTokenGetter, setGlobalLogout } from '@/services/api';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import React, { useEffect } from 'react';
import "react-native-reanimated";
import MainNavigator from "./MainNavigator"; // Assuming this is your navigation stack

const queryClient = new QueryClient();

// This component acts as the bridge between React Context and the Non-React API file
function ApiAuthConnector() {
  const { getValidToken, clearTokens } = useAuth();

  useEffect(() => {
    // 1. Wire the Token Getter
    setAuthTokenGetter(getValidToken);
    console.log("✅ [App] API layer connected to AuthContext");

    // 2. Wire the Global Logout
    setGlobalLogout(async () => {
      console.log("🚪 [App] Global logout triggered via API Interceptor");
      if (clearTokens) {
          await clearTokens(); 
      }
      await globalLogout();
    });
    
    console.log("✅ [App] Global logout registered");
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
      <WebSocketProvider>
        <QueryClientProvider client={queryClient}>
          <MainNavigator />
        </QueryClientProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}