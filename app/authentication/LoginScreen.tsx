import CustomButton from "@/components/ui/CustomButton";
import { useAuth } from "@/context/AuthContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useLoginEndPoint } from "@/services/authentication.service";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
    GoogleSignin,
    isErrorWithCode,
    statusCodes
} from '@react-native-google-signin/google-signin';
import React, { useEffect, useState } from "react";
import {
    Alert,
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const { setTokens } = useAuth();
  const { getFCMToken } = usePushNotifications();
  const { mutate: login, isPending: isLoginPending } = useLoginEndPoint(setTokens, remember);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID_FROM_CONSOLE.apps.googleusercontent.com', 
      offlineAccess: true, 
    });
  }, []);


  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await GoogleSignin.hasPlayServices();

      // B. Get User Info from Google
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error("No ID Token found");
      }

      console.log("🎉 [Google] Success. User:", userInfo.data.user.email);
      
      // C. Get FCM Token
      let fcmToken = "";
      try {
        const token = await getFCMToken();
        if (token) fcmToken = token;
      } catch (err) {
        console.log("⚠️ [FCM] Failed to get token during Google Auth");
      }


      console.log("🚀 Sending to backend:", { idToken, fcmToken });
      
      next();

    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log("🚫 User cancelled the login flow");
            break;
          case statusCodes.IN_PROGRESS:
            console.log("⏳ Sign in is in progress");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert("Error", "Google Play Services not available or outdated.");
            break;
          default:
            console.error("❌ Google Sign-In Error:", error);
            Alert.alert("Error", "Google Sign-In failed.");
        }
      } else {
        console.error("❌ valid error", error);
        Alert.alert("Error", "An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };



  const validateForm = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

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

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        let token = "";
        try {
          const fetchedToken = await getFCMToken();
          if (fetchedToken) token = fetchedToken;
        } catch (err) {
          console.log("⚠️ [FCM] Warning: Could not fetch token before login", err);
        }

        login(
          { 
            email, 
            password,
            role: "rider",
            fcm_token: token,
            type: "android"
          },
          {
            onSuccess: () => {
              console.log("✅ [Login] Login successful");
              next(); 
            },
            onError: (error: any) => {
              console.log("❌ [Login] LOGIN FAILED:", error.response?.data || error);
              setErrors({
                email: "",
                password: error.response?.data?.message || "Invalid email or password",
              });
            },
            onSettled: () => setIsSubmitting(false)
          }
        );
      } catch (error) {
        setIsSubmitting(false);
        console.error("Unexpected error during submit", error);
      }
    }
  };

  const isLoading = isLoginPending || isSubmitting;

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
        <View style={styles.banner} />
        <View style={styles.card}>
          <View style={styles.LogoContainer}>
            <Image source={Logo} style={styles.Logoicon} />
          </View>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>
            Need a ride? Skip the stress and rent a car in minutes.
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={20} color="#aaa" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color="#aaa" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#aaa"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
              <Ionicons name={isPasswordVisible ? "eye-off" : "eye"} size={18} color="#ccc" />
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          {/* Remember & Forgot */}
          <View style={styles.row}>
            <TouchableOpacity onPress={() => setRemember(!remember)} style={styles.checkboxRow}>
              <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
                {remember && <MaterialIcons name="check" size={16} color="#000" />}
              </View>
              <Text style={styles.checkboxLabel}>Remember Password</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goForgot}>
              <Text style={styles.forgot}>Forgot Password</Text>
            </TouchableOpacity>
          </View>

          {/* Proceed Button */}
          <CustomButton
            title="Proceed"
            onPress={handleSubmit}
            style={styles.proceedBtn}
            textStyle={styles.proceedText}
            loading={isLoading}
          />

          {/* OR Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign In Button */}
          <TouchableOpacity 
            style={[styles.googleBtn, isLoading && styles.googleBtnDisabled]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <FontAwesome name="google" size={20} color="#000" style={styles.googleIcon} />
            <Text style={styles.googleText}>
              Sign in with Google
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={{ marginTop: 20 }}>
            <TouchableOpacity onPress={goRegister} disabled={isLoading}>
              <Text style={styles.footerText}>
                Don&apos;t have an account? <Text style={styles.signup}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  scrollContainer: { flexGrow: 1, paddingBottom: 40 },
  banner: { height: 200, backgroundColor: "#fcbf24", borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  card: { flex: 1, marginTop: -40, backgroundColor: "#000", borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, width: "95%", alignSelf: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 10 },
  subtitle: { fontSize: 14, color: "#ccc", textAlign: "center", marginBottom: 20 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#111", borderRadius: 10, marginBottom: 5, paddingHorizontal: 10 },
  eyeIcon: { marginLeft: 8 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: "#fff", height: 50 },
  errorText: { color: "#ff4444", fontSize: 12, marginBottom: 10, marginLeft: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  checkboxRow: { flexDirection: "row", alignItems: "center" },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1, borderColor: "#fcbf24", justifyContent: "center", alignItems: "center", marginRight: 8 },
  checkboxChecked: { backgroundColor: "#fcbf24" },
  checkboxLabel: { color: "#fff", fontSize: 12 },
  forgot: { color: "#fcbf24", fontSize: 12 },
  proceedBtn: { backgroundColor: "#fcbf24", borderRadius: 10, paddingVertical: 14, marginTop: 10 },
  proceedText: { color: "#000", fontWeight: "bold", fontSize: 16 },
  footerText: { textAlign: "center", color: "#888", fontSize: 12 },
  signup: { color: "#fcbf24", fontWeight: "bold" },
  LogoContainer: {},
  Logoicon: { width: 130, height: 100, resizeMode: "contain", alignSelf: "center" },
  
  // Google Auth Styles
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#333' },
  dividerText: { marginHorizontal: 10, color: '#666', fontSize: 12 },
  googleBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    paddingVertical: 14,
    marginTop: 0 
  },
  googleBtnDisabled: { opacity: 0.7, backgroundColor: '#ccc' },
  googleIcon: { marginRight: 10 },
  googleText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});