/* eslint-disable react/no-unescaped-entities */
import { usePasswordReset, useResendOTP } from "@/services/passwordReset.service";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Logo from "../../assets/images/logo.png";

export default function ResetCredentialsScreen({
  next,
  back,
}: {
  next: () => void;
  back: () => void;
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [errors, setErrors] = useState({
    otp: "",
    password: "",
    confirmPassword: "",
    general: "",
  });

  const otpRefs = useRef<(TextInput | null)[]>([]);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { mutateAsync: resetPassword } = usePasswordReset();
  const { mutateAsync: resendOtp } = useResendOTP();

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const validateOtp = useCallback(() => {
    const otpString = otp.join("");
    if (otpString.length !== 6) return "OTP must be 6 digits";
    if (!/^\d+$/.test(otpString)) return "OTP must contain only numbers";
    return "";
  }, [otp]);

  const validatePassword = useCallback(() => {
    const minLength = 12;
    if (password.length < minLength) return `Password must be at least ${minLength} characters`;
    if (!/[A-Z]/.test(password)) return "Must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Must contain at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Must contain at least one number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Must contain at least one special character";
    return "";
  }, [password]);

  const validateConfirmPassword = useCallback(() => {
    if (password !== confirmPassword) return "Passwords do not match";
    return "";
  }, [password, confirmPassword]);

  const handleOtpChange = useCallback((text: string, index: number) => {
    const numericText = text.replace(/[^0-9]/g, "").slice(0, 1);
    setOtp((prev) => {
      const newOtp = [...prev];
      newOtp[index] = numericText;
      return newOtp;
    });
    if (numericText && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    setErrors((prev) => prev.otp ? { ...prev, otp: "" } : prev);
  }, []);

  const handleOtpKeyPress = useCallback((e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handleResendOtp = useCallback(async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      const email = await AsyncStorage.getItem("forgotPasswordEmail");
      if (!email) {
        setErrors((prev) => ({ ...prev, general: "Email not found. Please start over." }));
        return;
      }
      // Call your resend OTP service here, e.g.: await resendOtp({ email });
      const res = await resendOtp({ email });
      console.log("res from resend otp", res)

      // Start 60s countdown
      let remaining = 60;
      setResendCooldown(remaining);
      cooldownRef.current = setInterval(() => {
        remaining -= 1;
        setResendCooldown(remaining);
        if (remaining <= 0 && cooldownRef.current) {
          clearInterval(cooldownRef.current);
          cooldownRef.current = null;
        }
      }, 1000);
    } catch {
      setErrors((prev) => ({ ...prev, general: "Failed to resend OTP. Try again." }));
    } finally {
      setIsResending(false);
    }
  }, [resendCooldown, isResending]);

  const handleProceed = useCallback(async () => {
    const otpError = validateOtp();
    const passwordError = validatePassword();
    const confirmPasswordError = validateConfirmPassword();

    setErrors({ otp: otpError, password: passwordError, confirmPassword: confirmPasswordError, general: "" });

    if (otpError || passwordError || confirmPasswordError) return;

    setIsLoading(true);
    try {
      const email = await AsyncStorage.getItem("forgotPasswordEmail");
      if (!email) {
        setErrors((prev) => ({ ...prev, general: "Email not found. Please try again." }));
        return;
      }
      await resetPassword({ new_password: password, email, otp: otp.join("") });
      setShowSuccessModal(true);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.new_password?.[0] ||
        error?.response?.data?.otp?.[0] ||
        error?.response?.data?.email?.[0] ||
        error?.message ||
        "Password reset failed. Please try again.";
      setErrors((prev) => ({ ...prev, general: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  }, [validateOtp, validatePassword, validateConfirmPassword, password, otp, resetPassword]);

  const handleModalContinue = useCallback(() => {
    setShowSuccessModal(false);
    next();
  }, [next]);

  const isFormValid = useCallback(() => {
    const otpValid = otp.join("").length === 6;
    const passwordValid = validatePassword() === "";
    const confirmPasswordValid = password === confirmPassword && confirmPassword !== "";
    return otpValid && passwordValid && confirmPasswordValid;
  }, [otp, password, confirmPassword, validatePassword]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.banner} />
          <View style={styles.card}>
            <TouchableOpacity style={styles.backButton} onPress={back}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <Image source={Logo} style={styles.logo} />
            </View>

            <View style={styles.iconContainer}>
              <FontAwesome name="lock" size={24} color="#fcbf24" />
            </View>

            <View style={styles.bottomSection}>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>Enter OTP and set your new password</Text>

              {/* OTP Input */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Verification Code</Text>
                <View style={styles.otpInputsContainer}>
                  {otp.map((value, index) => (
                    <TextInput
                      key={index}
                      ref={(el) => { otpRefs.current[index] = el; }}
                      style={[styles.otpInput, errors.otp && styles.inputError]}
                      value={value}
                      keyboardType="number-pad"
                      maxLength={1}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      onKeyPress={(e) => handleOtpKeyPress(e, index)}
                      editable={!isLoading}
                    />
                  ))}
                </View>
                {errors.otp ? (
                  <Text style={styles.errorText}>{errors.otp}</Text>
                ) : null}

                {/* Resend OTP — sits directly below OTP boxes, right-aligned */}
                <View style={styles.resendRow}>
                  <Text style={styles.resendLabel}>Didn't receive the code? </Text>
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={resendCooldown > 0 || isResending || isLoading}
                    activeOpacity={0.7}
                  >
                    {isResending ? (
                      <ActivityIndicator size="small" color="#fcbf24" />
                    ) : (
                      <Text
                        style={[
                          styles.resendText,
                          (resendCooldown > 0 || isLoading) && styles.resendDisabled,
                        ]}
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View style={[styles.fieldContainer, { marginTop: 4 }]}>
                <Text style={styles.fieldLabel}>New Password</Text>
                <View style={[styles.inputContainer, errors.password && styles.inputContainerError]}>
                  <FontAwesome name="lock" size={20} color="#aaa" style={styles.inputIcon} />
                  <TextInput
                    ref={passwordRef}
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor="#666"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setErrors((prev) => prev.password ? { ...prev, password: "" } : prev);
                    }}
                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                    editable={!isLoading}
                    returnKeyType="next"
                  />
                  <TouchableOpacity onPress={() => setShowPassword((v) => !v)} disabled={isLoading}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#aaa"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}
                <View style={styles.passwordRequirements}>
                  <Text style={styles.requirementText}>Password must contain:</Text>
                  <Text style={styles.requirementItem}>• At least 12 characters</Text>
                  <Text style={styles.requirementItem}>• One uppercase letter (A-Z)</Text>
                  <Text style={styles.requirementItem}>• One lowercase letter (a-z)</Text>
                  <Text style={styles.requirementItem}>• One number (0-9)</Text>
                  <Text style={styles.requirementItem}>• One special character (!@#$%^&*)</Text>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Confirm Password</Text>
                <View style={[styles.inputContainer, errors.confirmPassword && styles.inputContainerError]}>
                  <FontAwesome name="lock" size={20} color="#aaa" style={styles.inputIcon} />
                  <TextInput
                    ref={confirmPasswordRef}
                    style={styles.input}
                    placeholder="Re-enter password"
                    placeholderTextColor="#666"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      setErrors((prev) => prev.confirmPassword ? { ...prev, confirmPassword: "" } : prev);
                    }}
                    onSubmitEditing={handleProceed}
                    editable={!isLoading}
                    returnKeyType="done"
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword((v) => !v)} disabled={isLoading}>
                    <Ionicons
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#aaa"
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword ? (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                ) : null}
              </View>

              {/* General Error */}
              {errors.general ? (
                <Text style={styles.errorTextGeneral}>{errors.general}</Text>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.proceedButton,
                  (!isFormValid() || isLoading) && styles.disabledButton,
                ]}
                onPress={handleProceed}
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.proceedButtonText}>Reset Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <FontAwesome name="check-circle" size={50} color="#4CAF50" />
            </View>
            <Text style={styles.modalTitle}>Password Reset Successful!</Text>
            <Text style={styles.modalMessage}>Your password has been reset successfully.</Text>
            <Text style={styles.modalSubtext}>You can now login with your new password.</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleModalContinue}>
              <Text style={styles.modalButtonText}>Login Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  banner: {
    height: 200,
    backgroundColor: "#fcbf24",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1, marginTop: -40, backgroundColor: "#000" },
  scrollContent: { flexGrow: 1, paddingBottom: 30 },
  card: {
    backgroundColor: "#000",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    width: "95%",
    alignSelf: "center",
  },
  backButton: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  logoContainer: { alignItems: "center" },
  logo: { width: 130, height: 100, resizeMode: "contain" },
  iconContainer: {
    backgroundColor: "#FEB91454",
    borderRadius: 50,
    marginTop: 30,
    width: 50,
    height: 50,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSection: { backgroundColor: "#000", alignItems: "center", paddingTop: 40 },
  title: { fontSize: 24, color: "#fff", marginBottom: 5 },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 30,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  fieldContainer: { width: "100%", marginBottom: 20 },
  fieldLabel: { color: "#fff", fontSize: 14, marginBottom: 10 },
  otpInputsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  otpInput: {
    width: 45,
    height: 60,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 24,
    color: "#fff",
    backgroundColor: "#111",
  },
  // Resend row sits flush below OTP boxes, right-aligned
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  resendLabel: {
    color: "#888",
    fontSize: 13,
  },
  resendText: {
    color: "#fcbf24",
    fontSize: 13,
    fontWeight: "600",
  },
  resendDisabled: {
    color: "#555",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: "#fff",
    width: "100%",
  },
  inputContainerError: { borderColor: "#ff5252" },
  inputError: { borderColor: "#ff5252" },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: "#fff", height: 50 },
  errorText: { color: "#ff5252", fontSize: 12, marginTop: 5, marginLeft: 5 },
  errorTextGeneral: {
    color: "#ff5252",
    fontSize: 13,
    marginBottom: 15,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  passwordRequirements: { marginTop: 10, paddingLeft: 5 },
  requirementText: { color: "#aaa", fontSize: 12, marginBottom: 5, fontWeight: "600" },
  requirementItem: { color: "#777", fontSize: 11, marginBottom: 2 },
  proceedButton: {
    backgroundColor: "#ffb300",
    paddingVertical: 15,
    borderRadius: 15,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: { backgroundColor: "#666", opacity: 0.6 },
  proceedButtonText: { color: "#000", fontSize: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: "100%",
    maxWidth: 350,
    borderWidth: 2,
    borderColor: "#fcbf24",
  },
  modalIconContainer: { marginBottom: 20 },
  modalTitle: { fontSize: 22, color: "#fff", marginBottom: 15, textAlign: "center" },
  modalMessage: { fontSize: 16, color: "#ccc", textAlign: "center", marginBottom: 10, lineHeight: 22 },
  modalSubtext: { fontSize: 14, color: "#aaa", textAlign: "center", marginBottom: 25, lineHeight: 20 },
  modalButton: {
    backgroundColor: "#fcbf24",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: { color: "#000", fontSize: 18 },
});