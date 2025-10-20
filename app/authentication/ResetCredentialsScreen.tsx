import { usePasswordReset } from "@/services/passwordReset.service";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Logo from "../../assets/images/logo.png";

export default function ResetCredentialsScreen({ next }: { next: () => void }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [new_password, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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
    if (password.length < 12) {
      return "Password must be at least 12 characters";
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
      setNewPassword(password);
      const email = await AsyncStorage.getItem("forgotPasswordEmail");
      if (!email) {
        setErrors((prev) => ({ ...prev, general: "Email not found. Please try again." }));
        setIsLoading(false);
        return;
      }

      await resetPassword({ new_password: password, email, otp: otp.join("") });
      setShowSuccessModal(true);

    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: error instanceof Error ? error.message : "Password reset failed. Please try again.",
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
    return (
      otp.join("").length === 6 &&
      password.length >= 12 &&
      password === confirmPassword
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner} />

      <View style={styles.card}>
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
          <View style={styles.otpContainer}>
            <Text style={styles.otpLabel}>Verification Code</Text>
            <View style={styles.otpInputsContainer}>
              {otp.map((value, index) => (
                <TextInput
                  key={index}
                  ref={(el) => {
                    otpRefs.current[index] = el;
                  }}
                  style={styles.otpInput}
                  value={value}
                  keyboardType="number-pad"
                  maxLength={1}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleOtpKeyPress(e, index)}
                />
              ))}
            </View>
            {errors.otp ? <Text style={styles.errorText}>{errors.otp}</Text> : null}
          </View>

          {/* New Password Input */}
          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color="#aaa" style={styles.inputIcon} />
            <TextInput
              ref={passwordRef}
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="New Password"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: "" }));
                }
              }}
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            />
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color="#aaa" style={styles.inputIcon} />
            <TextInput
              ref={confirmPasswordRef}
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              placeholder="Confirm New Password"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }
              }}
            />
          </View>
          {errors.confirmPassword ? (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          ) : null}

          {/* General Error */}
          {errors.general ? <Text style={styles.errorText}>{errors.general}</Text> : null}

          <TouchableOpacity
            style={[styles.proceedButton, (!isFormValid() || isLoading) && styles.disabledButton]}
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
  card: {
    flex: 1,
    marginTop: -40,
    backgroundColor: "#000",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    width: "95%",
    alignSelf: "center",
  },
  logoContainer: {},
  logo: {
    width: 130,
    height: 100,
    resizeMode: "contain",
    alignSelf: "center",
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
    flex: 0.6,
    backgroundColor: "#000",
    alignItems: "center",
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: "BebasNeue",
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
  otpContainer: {
    width: "100%",
    marginBottom: 20,
  },
  otpLabel: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 10,
    fontFamily: "BebasNeue",
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
    marginBottom: 5,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: "white",
    width: "100%",
  },
  inputError: {
    borderColor: "#ff5252",
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    color: "#fff",
    height: 50,
  },
  errorText: {
    color: "#ff5252",
    fontSize: 12,
    alignSelf: "flex-start",
    marginBottom: 10,
    marginLeft: 5,
  },
  proceedButton: {
    backgroundColor: "#ffb300",
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 15,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#666",
    opacity: 0.6,
  },
  proceedButtonText: {
    color: "#000",
    fontSize: 18,
    fontFamily: "BebasNeue",
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
    fontFamily: "BebasNeue",
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
    fontFamily: "BebasNeue",
  },
});