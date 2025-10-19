import { WebSocketProvider } from "@/context/WebSocketProvider";
import { useColorScheme } from "@/hooks/useColorScheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import "react-native-reanimated";
import MainNavigator from "./MainNavigator";
const queryClient = new QueryClient();
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <WebSocketProvider>
    <QueryClientProvider client={queryClient}>
      <MainNavigator />
    </QueryClientProvider>
    </WebSocketProvider>
  );
}
