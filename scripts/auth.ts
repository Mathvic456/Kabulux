import { navigateTo } from "@/app/navigationRef";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const globalLogout = async () => {
  await AsyncStorage.multiRemove(["token", "refreshToken", "rememberedEmail"]);
  navigateTo("login");
};