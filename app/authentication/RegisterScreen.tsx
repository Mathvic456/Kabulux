import CentralModal from "@/components/CentralModal";
import CustomButton from "@/components/ui/CustomButton";
import { useRegisterEndPoint } from "@/services/authentication.service";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Logo from "../../assets/images/logo.png";

// FIX: Removed module-level Dimensions.get('window') — causes flicker on
// first render due to stale values. useWindowDimensions() is reactive.

type RegisterScreenProps = {
  next: (email: string) => void;
  goLogin: () => void;
};

export default function RegisterScreen({ next, goLogin }: RegisterScreenProps) {
  const { width } = useWindowDimensions();

  const scaleFont = useCallback(
    (size: number) => Math.round(size * Math.min(width / 375, 1.3)),
    [width]
  );

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modalState, setModalState] = useState<{ showModal: boolean; modalErr: string }>({
    showModal: false,
    modalErr: "",
  });
  const [referralCode, setReferralCode] = useState("");

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  // Refs for focus chaining
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const referralCodeRef = useRef<TextInput>(null);

  const { mutate: register, isPending } = useRegisterEndPoint();

  const validateForm = useCallback(() => {
    let valid = true;
    let normalizedPhone = phone.trim();

    const newErrors = {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
    };

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
      valid = false;
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters";
      valid = false;
    }

    if (!email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    // Phone normalization
    if (/^0\d{9,}$/.test(normalizedPhone)) {
      normalizedPhone = "+234" + normalizedPhone.slice(1);
    }
    if (/^234\d{9,}$/.test(normalizedPhone)) {
      normalizedPhone = "+" + normalizedPhone;
    }
    if (!normalizedPhone) {
      newErrors.phone = "Phone number is required";
      valid = false;
    } else if (!/^\+234\d{10}$/.test(normalizedPhone)) {
      newErrors.phone = "Please enter a valid phone number";
      valid = false;
    }

    if (!address.trim()) {
      newErrors.address = "Address is required";
      valid = false;
    } else if (address.trim().length < 10) {
      newErrors.address = "Address must be at least 10 characters";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
      valid = false;
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least one number";
      valid = false;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      newErrors.password = "Password must contain at least one special character";
      valid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return { valid, normalizedPhone };
  }, [fullName, email, phone, address, password, confirmPassword]);

  const handleSubmit = useCallback(async () => {
    const { valid, normalizedPhone } = validateForm();
    if (!valid) return;

    const [first_name, ...rest] = fullName.trim().split(" ");
    const last_name = rest.length > 0 ? rest.join(" ") : "";

    await AsyncStorage.setItem("pendingEmail", email);
    await AsyncStorage.setItem("pendingPassword", password);

    register({
      email,
      password,
      role: "rider",
      first_name,
      last_name,
      phone_number: normalizedPhone,
      address,
      ...(referralCode.trim() && { referrer_code: referralCode.trim() }), // 👈
    },
      {
        onSuccess: () => next(email),
        onError: (err) => {
          const errorData = err.response?.data;
          const newErrors = { ...errors };
          let hasError = false;

          if (errorData?.email?.[0]?.includes("already exists")) {
            newErrors.email = "This email is already registered. Try signing in instead.";
            hasError = true;
          }
          if (errorData?.phone_number?.[0]?.includes("already exists")) {
            newErrors.phone = "This phone number is already registered. Try signing in instead.";
            hasError = true;
          }
          if (errorData?.[0]?.includes("already registered")) {
            setModalState({ showModal: true, modalErr: errorData[0] || "This account already exists" });
            return;
          }

          if (hasError) {
            setErrors(newErrors);
          } else {
            console.error("Registration failed:", errorData || err.message);
            alert("Something went wrong. Please try again.");
          }
        },
      }
    );
  }, [validateForm, fullName, email, password, address, errors, next, register]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#fcbf24" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <View style={styles.banner} />
          <View style={styles.card}>
            <Image source={Logo} style={styles.logoIcon} />

            <TouchableOpacity style={styles.backButton} onPress={goLogin}>
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </TouchableOpacity>

            <Text style={styles.title}>Get Started Now</Text>
            <Text style={styles.subtitle}>Let&apos;s create an account</Text>

            <View style={styles.progressBackground}>
              <View style={styles.progressFill} />
            </View>

            {/* Full Name */}
            <View style={styles.inputContainer}>
              <FontAwesome name="user" size={20} color="#aaa" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#aaa"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            </View>
            {errors.fullName ? (
              <Text style={[styles.errorText, { fontSize: scaleFont(12) }]}>{errors.fullName}</Text>
            ) : null}

            {/* Email */}
            <View style={styles.inputContainer}>
              <FontAwesome name="envelope" size={20} color="#aaa" style={styles.inputIcon} />
              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
              />
            </View>
            {errors.email ? (
              <Text style={[styles.errorText, { fontSize: scaleFont(12) }]}>{errors.email}</Text>
            ) : null}

            {/* Phone */}
            <View style={styles.inputContainer}>
              <FontAwesome name="phone" size={20} color="#aaa" style={styles.inputIcon} />
              <TextInput
                ref={phoneRef}
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#aaa"
                value={phone}
                onChangeText={setPhone}
                autoCapitalize="none"
                keyboardType="phone-pad"
                returnKeyType="next"
                onSubmitEditing={() => addressRef.current?.focus()}
              />
            </View>
            {errors.phone ? (
              <Text style={[styles.errorText, { fontSize: scaleFont(12) }]}>{errors.phone}</Text>
            ) : null}

            {/* Address */}
            <View style={styles.inputContainer}>
              <FontAwesome name="map-marker" size={20} color="#aaa" style={styles.inputIcon} />
              <TextInput
                ref={addressRef}
                style={styles.input}
                placeholder="Address"
                placeholderTextColor="#aaa"
                value={address}
                onChangeText={setAddress}
                returnKeyType="next"
                onSubmitEditing={() => referralCodeRef.current?.focus()}
              />
            </View>
            {errors.address ? (
              <Text style={[styles.errorText, { fontSize: scaleFont(12) }]}>{errors.address}</Text>
            ) : null}

            {/* Referral Code - Optional */}
            <View style={styles.inputContainer}>
              <FontAwesome name="ticket" size={20} color="#aaa" style={styles.inputIcon} />
              <TextInput
                ref={referralCodeRef}
                style={styles.input}
                placeholder="Referral Code (optional)"
                placeholderTextColor="#aaa"
                value={referralCode}
                onChangeText={setReferralCode}
                autoCapitalize="characters"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <FontAwesome name="lock" size={20} color="#aaa" style={styles.inputIcon} />
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                secureTextEntry={!showPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeButton}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#aaa" />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={[styles.errorText, { fontSize: scaleFont(12) }]}>{errors.password}</Text>
            ) : null}

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <FontAwesome name="lock" size={20} color="#aaa" style={styles.inputIcon} />
              <TextInput
                ref={confirmPasswordRef}
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#aaa"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
                secureTextEntry={!showConfirmPassword}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword((v) => !v)} style={styles.eyeButton}>
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#aaa" />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text style={[styles.errorText, { fontSize: scaleFont(12) }]}>{errors.confirmPassword}</Text>
            ) : null}

            {/* Password requirements */}
            <View style={styles.passwordRequirements}>
              <Text style={[styles.requirementText, { fontSize: scaleFont(11) }]}>
                Password must contain:
              </Text>
              <View style={styles.requirementList}>
                {[
                  { label: "At least 8 characters", met: password.length >= 8 },
                  { label: "One uppercase letter", met: /[A-Z]/.test(password) },
                  { label: "One number", met: /[0-9]/.test(password) },
                  { label: "One special character", met: /[!@#$%^&*(),.?\":{}|<>]/.test(password) },
                ].map(({ label, met }) => (
                  <Text
                    key={label}
                    style={[
                      styles.requirementItem,
                      { fontSize: scaleFont(10) },
                      met && styles.requirementMet,
                    ]}
                  >
                    • {label}
                  </Text>
                ))}
              </View>
            </View>

            <CustomButton
              title="Proceed"
              onPress={handleSubmit}
              style={styles.proceedBtn}
              textStyle={styles.proceedText}
              loading={isPending}
            />

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity onPress={goLogin}>
              <Text style={styles.footerText}>
                Already have an account? <Text style={styles.signup}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CentralModal
        visible={modalState.showModal}
        title="Sorry!"
        subText={modalState.modalErr}
        onClose={() => setModalState((prev) => ({ ...prev, showModal: false }))}
      />
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
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  card: {
    flex: 1,
    backgroundColor: "#000",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    width: "95%",
    alignSelf: "center",
    marginTop: -40,
  },
  logoIcon: {
    width: 130,
    height: 100,
    resizeMode: "contain",
    alignSelf: "center",
  },
  backButton: {
    position: "absolute",
    left: 30,
    top: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 20,
  },
  progressBackground: {
    height: 6,
    backgroundColor: "#444",
    borderRadius: 3,
    marginBottom: 20,
  },
  progressFill: {
    height: 6,
    backgroundColor: "#fcbf24",
    width: "25%",
    borderRadius: 3,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 10,
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  inputIcon: { marginRight: 10 },
  eyeButton: { padding: 6 },
  input: { flex: 1, color: "#fff", height: 50 },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 10,
  },
  passwordRequirements: {
    backgroundColor: "rgba(30, 30, 30, 0.8)",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    marginBottom: 14,
  },
  requirementText: {
    color: "#aaa",
    marginBottom: 5,
    fontWeight: "500",
  },
  requirementList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  requirementItem: {
    color: "#888",
    marginRight: 14,
    marginBottom: 3,
  },
  requirementMet: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  proceedBtn: {
    backgroundColor: "#fcbf24",
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 10,
  },
  proceedText: { color: "#000", fontWeight: "bold", fontSize: 16 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: { flex: 1, height: 1, backgroundColor: "#444" },
  dividerText: { color: "#aaa", marginHorizontal: 10 },
  footerText: { textAlign: "center", color: "#888", fontSize: 12 },
  signup: { color: "#fcbf24", fontWeight: "bold" },
});