import { FontAwesome } from "@expo/vector-icons";
import { useRef, useState } from "react";
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

export default function ResetCredentialsScreen({ next }: { 
  next: () => void
}) {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({
    otp: "",
    password: "",
    confirmPassword: ""
  });
  
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const otpRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null)
  ];

  // OTP validation
  const validateOtp = () => {
    const otpString = otp.join('');
    if (otpString.length !== 4) {
      return "OTP must be 4 digits";
    }
    if (!/^\d+$/.test(otpString)) {
      return "OTP must contain only numbers";
    }
    return "";
  };

  // Password validation
  const validatePassword = () => {
    if (password.length < 6) {
      return "Password must be at least 6 characters";
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
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    
    const newOtp = [...otp];
    newOtp[index] = numericText;
    setOtp(newOtp);

    // Auto-focus next input
    if (numericText && index < 3) {
      otpRefs[index + 1].current?.focus();
    }

    // Clear OTP error when user types
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: "" }));
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    // Handle backspace to focus previous input
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleProceed = () => {
    const otpError = validateOtp();
    const passwordError = validatePassword();
    const confirmPasswordError = validateConfirmPassword();

    setErrors({
      otp: otpError,
      password: passwordError,
      confirmPassword: confirmPasswordError
    });

    if (otpError || passwordError || confirmPasswordError) {
      return;
    }

    setIsLoading(true);
    
    // Simulate API call to reset password
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccessModal(true); // Show success modal
    }, 1500);
  };

  const handleModalContinue = () => {
    setShowSuccessModal(false);
    next(); // Navigate to login screen
  };

  const isFormValid = () => {
    return otp.join('').length === 4 && 
           password.length >= 6 && 
           password === confirmPassword;
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
          <FontAwesome name="lock" size={24} color="#fcbf24" />
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter OTP and set your new password</Text>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            <Text style={styles.otpLabel}>Verification Code</Text>
            <View style={styles.otpInputsContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={otpRefs[index]}
                  style={[
                    styles.otpInput,
                    errors.otp && styles.inputError
                  ]}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleOtpKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  textContentType="oneTimeCode"
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
              style={[
                styles.input,
                errors.password && styles.inputError
              ]}
              placeholder="New Password"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: "" }));
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
              style={[
                styles.input,
                errors.confirmPassword && styles.inputError
              ]}
              placeholder="Confirm New Password"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  setErrors(prev => ({ ...prev, confirmPassword: "" }));
                }
              }}
            />
          </View>
          {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

          <TouchableOpacity 
            style={[
              styles.proceedButton,
              (!isFormValid() || isLoading) && styles.disabledButton
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
  otpContainer: {
    width: '100%',
    marginBottom: 20,
  },
  otpLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
    fontFamily: 'BebasNeue',
    fontSize: 16,
  },
  otpInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 24,
    color: '#fff',
    backgroundColor: '#111',
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
  inputError: {
    borderColor: '#ff5252',
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
    fontSize: 18,
    fontFamily: 'BebasNeue',
  },
});