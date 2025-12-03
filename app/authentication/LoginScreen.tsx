import CustomButton from "@/components/ui/CustomButton";
import { useGoogleAuth } from "@/constants/GoogleAuth";
import { useAuth } from "@/context/AuthContext";
import { useLoginEndPoint } from "@/services/authentication.service";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
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
  View
} from "react-native";
import Logo from "../../assets/images/logo.png";

export default function LoginScreen({
  next,
  goRegister,
  goForgot,
}: {
  next: () => void;
  goRegister: () => void;
  goForgot: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const { setTokens } = useAuth();
  const { signInWithGoogle, loading } = useGoogleAuth();

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      email: "",
      password: "",
    };

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const { mutate: login, isPending } = useLoginEndPoint(setTokens, remember);

  const handleSubmit = () => {
    if (validateForm()) {
      login(
        { email, password },
        {
          onSuccess: () => {
            console.log("✅ [Login] Login successful, navigating...");
            next();
          },
          onError: (error: any) => {
            console.log("❌ [Login] LOGIN FAILED:", error.response?.data || error);

            // Show error under inputs
            setErrors({
              email: "",
              password: error.response?.data?.message || "Invalid email or password",
            });
          },
        }
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 80}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top Banner */}
        <View style={styles.banner} />

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.LogoContainer}>
            <Image source={Logo} style={styles.Logoicon} />
          </View>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>
            Need a ride? Skip the stress and rent a car in minutes. Whether
            it&apos;s a quick trip, a business ride or a family vacation, we got
            you covered.
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="email"
              size={20}
              color="#aaa"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors({ ...errors, email: "" });
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isPending}
            />
          </View>
          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <FontAwesome
              name="lock"
              size={20}
              color="#aaa"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#aaa"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors({ ...errors, password: "" });
                }
              }}
              editable={!isPending}
            />
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={styles.eyeIcon}
              disabled={isPending}
            >
              <Ionicons
                name={isPasswordVisible ? "eye-off" : "eye"}
                size={18}
                color="#ccc"
              />
            </TouchableOpacity>
          </View>
          {errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}

          {/* Remember & Forgot */}
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => setRemember(!remember)}
              style={styles.checkboxRow}
              disabled={isPending}
            >
              <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
                {remember && (
                  <MaterialIcons name="check" size={16} color="#000" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Remember Password</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={goForgot} disabled={isPending}>
              <Text style={styles.forgot}>Forgot Password</Text>
            </TouchableOpacity>
          </View>

          {/* Proceed */}
          <CustomButton
            title="Proceed"
            onPress={handleSubmit}
            style={styles.proceedBtn}
            textStyle={styles.proceedText}
            loading={isPending}
          />

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity 
          onPress={signInWithGoogle}
          style={styles.googleBtn}>
              <Text>Sign In with Google</Text>
          </TouchableOpacity>

          {/* Sign Up */}
          <TouchableOpacity onPress={goRegister} disabled={isPending}>
            <Text style={styles.footerText}>
              Don&apos;t have an account?{" "}
              <Text style={styles.signup}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  scrollContainer: { flexGrow: 1, paddingBottom: 40 },
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
  logo: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fcbf24",
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 10,
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  eyeIcon: {
    marginLeft: 8,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: "#fff", height: 50 },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxRow: { flexDirection: "row", alignItems: "center" },
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
  checkboxChecked: { backgroundColor: "#fcbf24" },
  checkboxLabel: { color: "#fff", fontSize: 12 },
  forgot: { color: "#fcbf24", fontSize: 12 },
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
  googleText: { color: "#fff", marginLeft: 8 },
  footerText: { textAlign: "center", color: "#888", fontSize: 12 },
  signup: { color: "#fcbf24", fontWeight: "bold" },
  LogoContainer: {},
  Logoicon: {
    width: 130,
    height: 100,
    resizeMode: "contain",
    alignSelf: "center",
  },
});