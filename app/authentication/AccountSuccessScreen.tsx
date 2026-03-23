import CustomButton from "@/components/ui/CustomButton";
import { useAuth } from "@/context/AuthContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useLoginEndPoint } from "@/services/authentication.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Logo from '../../assets/images/logo.png';
import Success from '../../assets/images/success.png';


export default function AccountSuccessScreen({ next }: { next: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  // ✅ All hooks at the top level of the component
  const { setTokens } = useAuth();
  const { expoPushToken } = usePushNotifications();
  const { mutate: login } = useLoginEndPoint(setTokens, true);

  // ✅ Single, clean handleProceed — no hooks inside
  const handleProceed = async () => {
    setIsLoading(true);

    try {
      const email = await AsyncStorage.getItem("pendingEmail");
      const password = await AsyncStorage.getItem("pendingPassword");

      if (email && password) {
        const fcmToken = expoPushToken || "";

        login(
          { email, password, role: "rider", fcm_token: fcmToken, type: "iPhone" },
          {
            onSuccess: async () => {
              await AsyncStorage.removeItem("pendingEmail");
              await AsyncStorage.removeItem("pendingPassword");
              next();
            },
            onError: async () => {
              await AsyncStorage.removeItem("pendingEmail");
              await AsyncStorage.removeItem("pendingPassword");
              next();
            },
            onSettled: () => setIsLoading(false),
          }
        );
      } else {
        await AsyncStorage.removeItem("pendingEmail");
        await AsyncStorage.removeItem("pendingPassword");
        next();
        setIsLoading(false);
      }
    } catch {
      await AsyncStorage.removeItem("pendingEmail");
      await AsyncStorage.removeItem("pendingPassword");
      next();
      setIsLoading(false);
    }
  };

  // ✅ JSX returned directly from the component
  return (
    <View style={styles.container}>

      {/* Top Banner */}
      <View style={styles.banner} />

      {/* Card */}
      <View style={styles.card}>

        <View style={styles.LogoContainer}>
          <Image
            source={Logo}
            style={styles.Logoicon}
          />
        </View>

        <View style={styles.envelopeContainer}>
          <Image
            source={Success}
            style={styles.envelopeIcon}
          />
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.title}>Your Account is Successfully Created</Text>

          <CustomButton
            title="Proceed"
            onPress={handleProceed}
            loading={isLoading}
          />
        </View>

      </View>

    </View>
  );
}

// ✅ Styles outside the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  banner: {
    height: 200,
    backgroundColor: "#fcbf24",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  card: {
    flex: 1,
    marginTop: -40,
    backgroundColor: "#000",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    width: '95%',
    alignSelf: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fcbf24",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: 'white',
    marginTop: 0,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    height: 50,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#fcbf24",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#fcbf24",
  },
  checkboxLabel: {
    color: "#fff",
    fontSize: 12,
  },
  forgot: {
    color: "#fcbf24",
    fontSize: 12,
  },
  progressBackground: {
    height: 6,
    backgroundColor: "#444",
    borderRadius: 3,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'white',
  },
  progressFill: {
    height: 6,
    backgroundColor: "#fcbf24",
    width: "75%",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'white',
  },
  proceedBtn: {
    backgroundColor: "#fcbf24",
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 10,
    width: 90,
  },
  proceedText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#444",
  },
  dividerText: {
    color: "#aaa",
    marginHorizontal: 10,
  },
  googleBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#fcbf24",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 30,
  },
  googleText: {
    color: "#fff",
    marginLeft: 8,
  },
  footerText: {
    textAlign: "center",
    color: "#888",
    fontSize: 12,
  },
  signup: {
    color: "#fcbf24",
    fontWeight: "bold",
  },
  envelopeIcon: {
    width: '80%',
    height: '90%',
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  envelopeContainer: {
    borderRadius: 50,
    marginTop: 30,
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  bottomSection: {
    flex: 0.6,
    backgroundColor: '#000',
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 30,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 30,
    gap: 10,
  },
  otpInput: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#ffb300',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    color: '#fff',
  },
  proceedButton: {
    backgroundColor: '#ffb300',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  proceedButtonText: {
    color: '#000',
    fontSize: 18,
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  resendText: {
    color: '#aaa',
    marginRight: 5,
  },
  resendLink: {
    color: '#ffb300',
    fontWeight: 'bold',
  },
  LogoContainer: {},
  Logoicon: {
    width: 130,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
});