import { RideCompletionModal } from '@/components/RideCompletionModal';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { RideProvider } from '@/context/RideContext';
import { WebSocketProvider } from "@/context/WebSocketProvider";
import { useColorScheme } from "@/hooks/useColorScheme";
import { globalLogout } from '@/scripts/auth';
import { setAuthTokenGetter, setGlobalLogout } from '@/services/api';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import React, { useEffect } from 'react';
import "react-native-reanimated";
import MainNavigator from "./MainNavigator";


const queryClient = new QueryClient();

// This component acts as the bridge between React Context and the Non-React API file
function ApiAuthConnector() {
  const { getValidToken, clearTokens } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(getValidToken);
    console.log("✅ [App] API layer connected to AuthContext");

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
        <RideProvider>
        <QueryClientProvider client={queryClient}>
          <MainNavigator />
          <RideCompletionModal />
        </QueryClientProvider>
        </RideProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}