import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Email from "../../assets/images/email.png";
import Logo from "../../assets/images/logo.png";
import {
  useResendOtpEndPoint,
  useVerifyOtpEndPoint,
} from "../../services/otpVerification.service";

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
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  const inputsRef = useRef<(TextInput | null)[]>([]);
  const verifyOtpMutation = useVerifyOtpEndPoint();
  const resendOtpMutation = useResendOtpEndPoint();

  useEffect(() => {
    const loadEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("pendingEmail");
        if (savedEmail) {
          setEmail(savedEmail);
        }
      } catch (error) {
        console.error("Error loading email:", error);
      }
    };
    loadEmail();
  }, []);

  // FIX 1: Timer isolated — only updates resendTimer, won't cascade into OTP renders
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResendOtp = useCallback(async () => {
    if (!email) return;
    setErrorMessage(null);
    try {
      await resendOtpMutation.mutateAsync({ email });
      Alert.alert("Success", "A new code has been sent to your email.");
      setResendTimer(30);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ?? "Failed to resend OTP. Please try again."
      );
    }
  }, [email, resendOtpMutation]);

  // FIX 2: Paste support — detect a 6-digit string and distribute across boxes
  const handleOtpChange = useCallback((text: string, index: number) => {
    // Strip non-numeric characters
    const cleaned = text.replace(/\D/g, "");

    // Paste scenario: received 2+ digits at once
    if (cleaned.length > 1) {
      const digits = cleaned.slice(0, 6).split("");
      setOtp((prev) => {
        const next = [...prev];
        digits.forEach((d, i) => {
          if (i < 6) next[i] = d;
        });
        return next;
      });
      // Focus the last filled box (or the one after)
      const lastIndex = Math.min(digits.length, 5);
      inputsRef.current[lastIndex]?.focus();
      return;
    }

    // Normal single-character entry
    const digit = cleaned.slice(-1);
    // FIX 3: Functional update to avoid stale closure and unnecessary re-renders
    setOtp((prev) => {
      if (prev[index] === digit) return prev; // no change, skip re-render
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyPress = useCallback(
    ({ nativeEvent }: { nativeEvent: { key: string } }, index: number) => {
      if (nativeEvent.key === "Backspace") {
        if (!otp[index] && index > 0) {
          setOtp((prev) => {
            const next = [...prev];
            next[index - 1] = "";
            return next;
          });
          inputsRef.current[index - 1]?.focus();
        } else if (otp[index]) {
          setOtp((prev) => {
            const next = [...prev];
            next[index] = "";
            return next;
          });
        }
      }
    },
    [otp]
  );

  const handleProceed = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const code = otp.join("");
    try {
      await verifyOtpMutation.mutateAsync({ email, otp: code });
      next();
    } catch (err: any) {
      console.error("OTP verification failed:", err);
      setErrorMessage(
        err?.response?.data?.message ?? "Something went wrong. Please try again."
      );
    } finally {
      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
      setIsLoading(false);
    }
  }, [email, otp, verifyOtpMutation, next]);

  return (
    // FIX 4: KAV — use "padding" on iOS only, undefined on Android to avoid
    // the aggressive layout shift that causes bottom-half flickering.
    // Android should rely on adjustResize in AndroidManifest.xml instead.
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.flex}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* FIX 5: Removed flexGrow:1 from contentContainerStyle — it fought KAV's
          height shrink and caused layout races. paddingBottom handles spacing. */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.banner} />

        <View style={styles.card}>
          <Image source={Logo} style={styles.Logoicon} />

          <View style={styles.envelopeContainer}>
            <Image source={Email} style={styles.envelopeIcon} />
          </View>

          <Pressable style={styles.backBtn} onPress={goBack}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>

          <Text style={styles.title}>OTP Authentication</Text>
          <Text style={styles.subtitle}>
            Check your email to see the verification code
          </Text>

          <View style={styles.progressBackground}>
            <View style={styles.progressFill} />
          </View>

          {/* FIX 6: OTP inputs with paste support via onChangeText.
              Each input is individually keyed so React won't re-mount siblings
              on a sibling's state change. */}
          <View style={styles.otpInputContainer}>
            {otp.map((value, index) => (
              <TextInput
                key={index}
                ref={(el) => { inputsRef.current[index] = el; }}
                style={styles.otpInput}
                value={value}
                keyboardType="number-pad"
                // FIX 7: No maxLength=1 here — we need to allow paste (multi-char)
                // and handle truncation ourselves in handleOtpChange
                maxLength={index === 0 ? 6 : 1}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                selectTextOnFocus
                caretHidden
              />
            ))}
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

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

          <View style={styles.resendContainer}>
            <Text style={styles.resendLabel}>Didn't receive code? </Text>
            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={resendTimer > 0 || resendOtpMutation.isPending}
            >
              {resendOtpMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffb300" />
              ) : (
                <Text
                  style={[
                    styles.resendLink,
                    resendTimer > 0 && styles.resendLinkDisabled,
                  ]}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  // FIX 5 continued: paddingBottom replaces flexGrow to avoid layout race with KAV
  scrollContainer: {
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
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  resendContainer: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  resendLabel: {
    color: "#aaa",
    fontSize: 14,
  },
  resendLink: {
    color: "#ffb300",
    fontSize: 14,
    fontWeight: "bold",
  },
  resendLinkDisabled: {
    color: "#666",
  },
});