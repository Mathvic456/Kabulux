import { navigateTo } from "@/app/navigationRef";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const globalLogout = async () => {
  console.log("🚪 [globalLogout] Starting logout process...");
  
  try {
    await AsyncStorage.multiRemove(["token", "refreshToken", "rememberedEmail"]);
    console.log("✅ [globalLogout] Storage cleared");
  } catch (error) {
    console.error("❌ [globalLogout] Failed to clear storage:", error);
  }
  
  // Check if navigation ref is ready
  try {
    navigateTo("login");
    console.log("✅ [globalLogout] Navigated to login");
  } catch (error) {
    console.error("❌ [globalLogout] Navigation failed (ref might not be ready):", error);
  }
};