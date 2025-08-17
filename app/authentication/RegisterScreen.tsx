import CustomButton from "@/components/ui/CustomButton";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Logo from '../../assets/images/logo.png';

export default function RegisterScreen({ next, goLogin }: { next: () => void; goLogin: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");
  
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    referral: ""
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      referral: ""
    };

    // Full Name validation
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
      valid = false;
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters";
      valid = false;
    }

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    // Phone validation
    if (!phone) {
      newErrors.phone = "Phone number is required";
      valid = false;
    } else if (!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone)) {
      newErrors.phone = "Please enter a valid phone number";
      valid = false;
    }

    // Address validation
    if (!address.trim()) {
      newErrors.address = "Address is required";
      valid = false;
    } else if (address.trim().length < 10) {
      newErrors.address = "Address must be at least 10 characters";
      valid = false;
    }

    // Password validation
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
    }

    // Referral is optional, so no validation needed

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Form is valid, proceed with registration
      next();
    }
  };

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
        <Text style={styles.title}>Get Started Now</Text>
        <Text style={styles.subtitle}>Let's create an account</Text>

        {/* Progress bar */}
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
            onChangeText={(text) => {
              setFullName(text);
              if (errors.fullName) {
                setErrors({...errors, fullName: ""});
              }
            }}
            autoCapitalize="words"
          />
        </View>
        {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}

        {/* Email */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={20} color="#aaa" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors({...errors, email: ""});
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

        {/* Phone */}
        <View style={styles.inputContainer}>
          <FontAwesome name="phone" size={20} color="#aaa" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#aaa"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              if (errors.phone) {
                setErrors({...errors, phone: ""});
              }
            }}
          />
        </View>
        {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

        {/* Address */}
        <View style={styles.inputContainer}>
          <FontAwesome name="map-marker" size={20} color="#aaa" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Address"
            placeholderTextColor="#aaa"
            value={address}
            onChangeText={(text) => {
              setAddress(text);
              if (errors.address) {
                setErrors({...errors, address: ""});
              }
            }}
          />
        </View>
        {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}

        {/* Password */}
        <View style={styles.inputContainer}>
          <FontAwesome name="lock" size={20} color="#aaa" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) {
                setErrors({...errors, password: ""});
              }
            }}
          />
        </View>
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

        {/* Referral */}
        <View style={styles.inputContainer}>
          <FontAwesome name="tag" size={20} color="#aaa" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Referral Code"
            placeholderTextColor="#aaa"
            value={referral}
            onChangeText={(text) => {
              setReferral(text);
              if (errors.referral) {
                setErrors({...errors, referral: ""});
              }
            }}
          />
        </View>
        {errors.referral ? <Text style={styles.errorText}>{errors.referral}</Text> : null}

        {/* Proceed Button */}
        <CustomButton
          title="Proceed"
          onPress={handleSubmit}
          style={styles.proceedBtn}
          textStyle={styles.proceedText}
        />

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        {/* Already have account */}
        <TouchableOpacity onPress={goLogin}>
          <Text style={styles.footerText}>
            Already have an account? <Text style={styles.signup}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  banner: { height: 200, backgroundColor: "#fcbf24", borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
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
  logo: { fontSize: 36, fontWeight: "bold", color: "#fcbf24", textAlign: "center", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 5 },
  subtitle: { fontSize: 14, color: "#ccc", textAlign: "center", marginBottom: 20 },

  progressBackground: { height: 6, backgroundColor: "#444", borderRadius: 3, marginBottom: 20 },
  progressFill: { height: 6, backgroundColor: "#fcbf24", width: "25%", borderRadius: 3 },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 10,
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: "#fff", height: 50 },
  errorText: { color: "#ff4444", fontSize: 12, marginBottom: 10, marginLeft: 10 },

  proceedBtn: { backgroundColor: "#fcbf24", borderRadius: 10, paddingVertical: 14, marginTop: 10 },
  proceedText: { color: "#000", fontWeight: "bold", fontSize: 16 },

  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: "#444" },
  dividerText: { color: "#aaa", marginHorizontal: 10 },

  footerText: { textAlign: "center", color: "#888", fontSize: 12 },
  signup: { color: "#fcbf24", fontWeight: "bold" },
  LogoContainer: {},
  Logoicon: {
    width: 130,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
});