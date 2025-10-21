import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Email from "../../assets/images/email.png";
import Logo from "../../assets/images/logo.png";
import { useVerifyOtpEndPoint } from "../../services/otpVerification.service";

export default function VerifyEmailScreen({
  next,
  goRegister,
  goBack,
}: {
  next: () => void;
  goRegister: () => void;
  goBack: () => void;
}) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<TextInput[]>([]);
  const verifyOtpMutation = useVerifyOtpEndPoint();

  useEffect(() => {
    const loadEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("pendingEmail");
        if (savedEmail) {
          setEmail(savedEmail);
          console.log("📬 Loaded email from storage:", savedEmail);
        }
      } catch (error) {
        console.error("❌ Error loading email:", error);
      }
    };
    loadEmail();
  }, []);

  function handleReset() {

  }

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1);
    setOtp(newOtp);

    if (text && index < otp.length - 1) inputsRef.current[index + 1]?.focus();
    if (!text && index > 0) inputsRef.current[index - 1]?.focus();
  };

  const handleProceed = async () => {
    setIsLoading(true);
    const code = otp.join("");
    try {
      await verifyOtpMutation.mutateAsync({ email, otp: code });
      next();
    } catch (err) {
      console.error("OTP verification failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner} />

        <View style={styles.card}>
          <Image source={Logo} style={styles.Logoicon} />

          <View style={styles.envelopeContainer}>
            <Image source={Email} style={styles.envelopeIcon} />
          </View>

          <Pressable
            style={styles.backBtn}
            onPress={() => goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>

          <Text style={styles.title}>OTP Authentication</Text>
          <Text style={styles.subtitle}>
            Check your email to see the verification code
          </Text>

          <View style={styles.progressBackground}>
            <View style={styles.progressFill} />
          </View>

          {/* OTP Inputs */}
          <View style={styles.otpInputContainer}>
            {otp.map((value, index) => (
              <TextInput
                key={index}
                ref={(el) => (inputsRef.current[index] = el!)}
                style={styles.otpInput}
                value={value}
                keyboardType="number-pad"
                maxLength={1}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={({ nativeEvent }) => {
                  if (
                    nativeEvent.key === "Backspace" &&
                    !otp[index] &&
                    index > 0
                  ) {
                    inputsRef.current[index - 1]?.focus();
                  }
                }}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.proceedButton}
            onPress={handleProceed}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.proceedButtonText}>Proceed</Text>
            )}
          </TouchableOpacity>

        
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  banner: {
    height: 200,
    backgroundColor: "#fcbf24",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  card: {
    marginTop: -40,
    backgroundColor: "#000",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    width: "92%",
    alignSelf: "center",
    alignItems: "center",
  },
  Logoicon: {
    width: 130,
    height: 100,
    resizeMode: "contain",
    marginBottom: 20,
  },
  envelopeContainer: {
    backgroundColor: "#FEB91454",
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  envelopeIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  backBtn: {
    position: "absolute",
    left: 30,
    top: 30,
  },
  title: {
    fontSize: 24,
    fontFamily: "BebasNeue",
    color: "#fff",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 25,
    textAlign: "center",
    width: "80%",
  },
  progressBackground: {
    height: 6,
    backgroundColor: "#444",
    borderRadius: 3,
    width: "80%",
    marginBottom: 25,
  },
  progressFill: {
    height: 6,
    backgroundColor: "#fcbf24",
    width: "45%",
    borderRadius: 3,
  },
  otpInputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 35,
    gap: 10,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: "#ffb300",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
    color: "#fff",
  },
  proceedButton: {
    backgroundColor: "#ffb300",
    paddingVertical: 14,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  proceedButtonText: {
    color: "#000",
    fontSize: 18,
    fontFamily: "BebasNeue",
  },

});
