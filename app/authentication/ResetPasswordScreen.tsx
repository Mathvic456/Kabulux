import { FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Logo from '../../assets/images/logo.png';

export default function ResetPasswordScreen({ next }: { 
  next: () => void
}) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [emailError, setEmailError] = useState("");
  
  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleProceed = () => {
    // Clear previous errors
    setEmailError("");

    // Validate email
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call to send OTP
    setTimeout(() => {
      setIsLoading(false);
      setShowModal(true); // Show success modal
    }, 1500);
  };

  const handleModalContinue = () => {
    setShowModal(false);
    next(); // Navigate to next screen (OTP verification)
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    // Clear error when user starts typing
    if (emailError) {
      setEmailError("");
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

        <View style={styles.envelopeContainer}>
          <FontAwesome name="envelope" size={24} color="#fcbf24" />
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.title}>Enter Your Email</Text>
          <Text style={styles.subtitle}>We'll send you a verification code to reset your password</Text>

          <View style={styles.inputContainer}>
            <FontAwesome name="envelope" size={20} color="#aaa" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={handleEmailChange}
            />
          </View>

          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <TouchableOpacity 
            style={[
              styles.proceedButton,
              (!email.trim() || isLoading) && styles.disabledButton
            ]} 
            onPress={handleProceed}
            disabled={!email.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.proceedButtonText}>Send Code</Text>
            )}
          </TouchableOpacity>        
        </View>
      </View>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <FontAwesome name="check-circle" size={50} color="#4CAF50" />
            </View>
            
            <Text style={styles.modalTitle}>OTP Sent Successfully!</Text>
            
            <Text style={styles.modalMessage}>
              A verification code has been sent to{"\n"}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
            
            <Text style={styles.modalSubtext}>
              Please check your email and enter the code to continue.
            </Text>

            <TouchableOpacity 
              style={styles.modalButton}
              onPress={handleModalContinue}
            >
              <Text style={styles.modalButtonText}>Continue to OTP</Text>
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
    borderBottomRightRadius: 40 
  },
  card: { 
    flex: 1, 
    marginTop: -40, 
    backgroundColor: "#000", 
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40, 
    padding: 30, 
    width: '95%', 
    alignSelf: 'center' 
  },
  LogoContainer: {},
  Logoicon: {
    width: 130,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  envelopeContainer: {
    backgroundColor: '#FEB91454',
    borderRadius: 50,
    marginTop: 30,
    width: 50,
    height: 50,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center'
  },
  bottomSection: {
    flex: 0.6,
    backgroundColor: '#000',
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: 'BebasNeue',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  inputContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#111", 
    borderRadius: 10, 
    marginBottom: 5, 
    paddingHorizontal: 10, 
    borderWidth: 2, 
    borderColor: 'white', 
    width: '100%' 
  },
  inputIcon: { marginRight: 10 },
  input: { 
    flex: 1, 
    color: "#fff", 
    height: 50 
  },
  errorText: {
    color: '#ff5252',
    fontSize: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginLeft: 5,
  },
  proceedButton: {
    backgroundColor: '#ffb300',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  proceedButtonText: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'BebasNeue',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    borderWidth: 2,
    borderColor: '#fcbf24',
  },
  modalIconContainer: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'BebasNeue',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  emailText: {
    color: '#fcbf24',
    fontWeight: 'bold',
  },
  modalSubtext: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#fcbf24',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'BebasNeue',
    fontSize: 18,
  },
});