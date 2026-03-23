import { usePasswordReset } from "@/services/passwordReset.service";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
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
  const [errors, setErrors] = useState({
    otp: "",
    password: "",
    confirmPassword: "",
    general: "",
  });

  const otpRefs = useRef<(TextInput | null)[]>([]);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const { mutateAsync: resetPassword } = usePasswordReset();

  // OTP validation
  const validateOtp = () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      return "OTP must be 6 digits";
    }
    if (!/^\d+$/.test(otpString)) {
      return "OTP must contain only numbers";
    }
    return "";
  };

  // Password validation
  const validatePassword = () => {
    const minLength = 12;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return `Password must be at least ${minLength} characters`;
    }
    if (!hasUppercase) {
      return "Must contain at least one uppercase letter";
    }
    if (!hasLowercase) {
      return "Must contain at least one lowercase letter";
    }
    if (!hasNumber) {
      return "Must contain at least one number";
    }
    if (!hasSpecialChar) {
      return "Must contain at least one special character";
    }
    return "";
  };

  // Confirm password validation
  const validateConfirmPassword = () => {
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleOtpChange = (text: string, index: number) => {
    const numericText = text.replace(/[^0-9]/g, "");

    const newOtp = [...otp];
    newOtp[index] = numericText;
    setOtp(newOtp);

    // Auto-focus next input
    if (numericText && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Clear OTP error when user types
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: "" }));
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleProceed = async () => {
    const otpError = validateOtp();
    const passwordError = validatePassword();
    const confirmPasswordError = validateConfirmPassword();

    setErrors({
      otp: otpError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
      general: "",
    });

    if (otpError || passwordError || confirmPasswordError) {
      return;
    }

    setIsLoading(true);

    try {
      const email = await AsyncStorage.getItem("forgotPasswordEmail");
      if (!email) {
        setErrors((prev) => ({
          ...prev,
          general: "Email not found. Please try again.",
        }));
        return;
      }

      await resetPassword({
        new_password: password,
        email,
        otp: otp.join(""),
      });

      setShowSuccessModal(true);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.new_password?.[0] ||
        error?.response?.data?.otp?.[0] ||
        error?.response?.data?.email?.[0] ||
        error?.message ||
        "Password reset failed. Please try again.";

      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalContinue = () => {
    setShowSuccessModal(false);
    next();
  };

  const isFormValid = () => {
    const otpValid = otp.join("").length === 6;
    const passwordValid = validatePassword() === "";
    const confirmPasswordValid = password === confirmPassword && confirmPassword !== "";

    return otpValid && passwordValid && confirmPasswordValid;
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner} />

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
              <Text style={styles.subtitle}>
                Enter OTP and set your new password
              </Text>

              {/* OTP Input */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Verification Code</Text>
                <View style={styles.otpInputsContainer}>
                  {otp.map((value, index) => (
                    <TextInput
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }}
                      style={[
                        styles.otpInput,
                        errors.otp && styles.inputError,
                      ]}
                      value={value}
                      keyboardType="number-pad"
                      maxLength={1}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      onKeyPress={(e) => handleOtpKeyPress(e, index)}
                    />
                  ))}
                </View>
                {errors.otp ? (
                  <Text style={styles.errorText}>{errors.otp}</Text>
                ) : null}
              </View>

              {/* New Password Input */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>New Password</Text>
                <View
                  style={[
                    styles.inputContainer,
                    errors.password && styles.inputContainerError,
                  ]}
                >
                  <FontAwesome
                    name="lock"
                    size={20}
                    color="#aaa"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={passwordRef}
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor="#666"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) {
                        setErrors((prev) => ({ ...prev, password: "" }));
                      }
                    }}
                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
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

              {/* Confirm Password Input */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Confirm Password</Text>
                <View
                  style={[
                    styles.inputContainer,
                    errors.confirmPassword && styles.inputContainerError,
                  ]}
                >
                  <FontAwesome
                    name="lock"
                    size={20}
                    color="#aaa"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={confirmPasswordRef}
                    style={styles.input}
                    placeholder="Re-enter password"
                    placeholderTextColor="#666"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword) {
                        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                      }
                    }}
                    onSubmitEditing={handleProceed}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
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

            <Text style={styles.modalMessage}>
              Your password has been reset successfully.
            </Text>

            <Text style={styles.modalSubtext}>
              You can now login with your new password.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleModalContinue}
            >
              <Text style={styles.modalButtonText}>Login Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    marginTop: -40,
    backgroundColor: "#000",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#000",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    width: "95%",
    alignSelf: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 6,
    fontFamily: "",
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 130,
    height: 100,
    resizeMode: "contain",
  },
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
  bottomSection: {
    backgroundColor: "#000",
    alignItems: "center",
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: "",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 30,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  fieldContainer: {
    width: "100%",
    marginBottom: 20,
  },
  fieldLabel: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 10,
    fontFamily: "",
  },
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
  inputContainerError: {
    borderColor: "#ff5252",
  },
  inputError: {
    borderColor: "#ff5252",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    height: 50,
  },
  errorText: {
    color: "#ff5252",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  errorTextGeneral: {
    color: "#ff5252",
    fontSize: 13,
    marginBottom: 15,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  passwordRequirements: {
    marginTop: 10,
    paddingLeft: 5,
  },
  requirementText: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 5,
    fontWeight: "600",
  },
  requirementItem: {
    color: "#777",
    fontSize: 11,
    marginBottom: 2,
  },
  proceedButton: {
    backgroundColor: "#ffb300",
    paddingVertical: 15,
    borderRadius: 15,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#666",
    opacity: 0.6,
  },
  proceedButtonText: {
    color: "#000",
    fontSize: 18,
    fontFamily: "",
  },
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
  modalIconContainer: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "",
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 22,
  },
  modalSubtext: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: "#fcbf24",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#000",
    fontSize: 18,
    fontFamily: "",
  },
});