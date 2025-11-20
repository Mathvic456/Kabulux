import CustomButton from "@/components/ui/CustomButton";
import { useRegisterEndPoint } from "@/services/authentication.service";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Logo from "../../assets/images/logo.png";

type RegisterScreenProps = {
  next: (email: string) => void;
  goLogin: () => void;
};

export default function RegisterScreen({ next, goLogin }: RegisterScreenProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [referral, setReferral] = useState("");

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    referral: "",
  });

  const { mutate: register, isPending } = useRegisterEndPoint();

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      referral: "",
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

    if (!phone) {
      newErrors.phone = "Phone number is required";
      valid = false;
    } else if (
      !/^\+?\d{10,15}$/.test(phone)
    ) {
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
    } else if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      newErrors.password = "Password must contain at least one special character";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const [first_name, ...rest] = fullName.trim().split(" ");
    const last_name = rest.length > 0 ? rest.join(" ") : "";

    await AsyncStorage.setItem("pendingEmail", email);
    console.log("📩 Email saved for OTP verification:", email);

    register(
      {
        email,
        password,
        role: "rider",
        first_name,
        last_name,
        phone_number: phone,
        address,
      },
      {
        onSuccess: () => {
          next(email);
        },
        onError: (err) => {
      const errorData = err.response?.data;

      if (errorData?.email?.[0]?.includes("already exists")) {
        setErrors((prev) => ({
          ...prev,
          email: "This email is already registered. Try signing in instead.",
        }));
      } else {
        console.error("Registration failed:", errorData || err.message);
        alert("Something went wrong. Please try again.");
      }
    },

      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <View style={styles.card}>
            <Image source={Logo} style={styles.logoIcon} />
        <TouchableOpacity 
        style={styles.backButton} 
        onPress={goLogin}
      >
        <Ionicons name="chevron-back" size={24} color="#ffffff" />
      </TouchableOpacity>
            <Text style={styles.title}>Get Started Now</Text>
            <Text style={styles.subtitle}>Let&apos;s create an account</Text>

            <View style={styles.progressBackground}>
              <View style={styles.progressFill} />
            </View>

            {/* All Inputs */}
            {renderInput("user", fullName, setFullName, "Full Name", errors.fullName, "words")}
            {renderInput("envelope", email, setEmail, "Email", errors.email, "none", "email-address")}
            {renderInput("phone", phone, setPhone, "Phone Number", errors.phone, "none", "phone-pad")}
            {renderInput("map-marker", address, setAddress, "Address", errors.address)}
            {renderInput("lock", password, setPassword, "Password", errors.password, "none", "default", !showPassword, showPassword, setShowPassword)}
            {renderInput("tag", referral, setReferral, "Referral Code", errors.referral)}

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
    </View>
  );
}

// Helper for input rendering
const renderInput = (
  icon: any,
  value: string,
  setter: (v: string) => void,
  placeholder: string,
  error?: string,
  autoCapitalize: any = "none",
  keyboardType: any = "default",
  secureTextEntry = false,
  showPassword?: boolean,
  setShowPassword?: (value: boolean) => void
) => (
  <>
    <View style={styles.inputContainer}>
      <FontAwesome name={icon} size={20} color="#aaa" style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        value={value}
        onChangeText={setter}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
       {placeholder === "Password" && (
        <TouchableOpacity onPress={() => setShowPassword?.(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color="#aaa"
          />
        </TouchableOpacity>
      )}
    </View>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </>
);

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
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: "#fff", height: 50 },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 10,
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
    backButton: {
    position: "absolute",
    left: 30,
    top: 60,
  },
});
