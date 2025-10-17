import React, { useRef, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Email from '../../assets/images/email.png';
import Logo from '../../assets/images/logo.png';
import { useVerifyOtpEndPoint } from "../../services/otpVerification.service";

export default function VerifyEmailScreen({ next, goRegister, goForgot }: { next: () => void, goRegister: () => void, goForgot: () => void }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputsRef = useRef<TextInput[]>([]);

  const verifyOtpMutation = useVerifyOtpEndPoint();

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1); // only keep last character
    setOtp(newOtp);

    if (text && index < otp.length - 1) {
      inputsRef.current[index + 1]?.focus(); // move to next input
    }
    if (!text && index > 0) {
      inputsRef.current[index - 1]?.focus(); // move back on delete
    }
  };

  const handleResendCode = () => {
    console.log('Resend code tapped');
  };

  const handleProceed = async () => {
    setIsLoading(true);
    const code = otp.join("");

    try {
      await verifyOtpMutation.mutateAsync({ email, otp: code });
      next(); // go to success or next screen
    } catch (err) {
      console.error("OTP verification failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner} />
      <View style={styles.card}>
        <View style={styles.LogoContainer}>
          <Image source={Logo} style={styles.Logoicon} />
        </View>

        <View style={styles.envelopeContainer}>
          <Image source={Email} style={styles.envelopeIcon} />
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.title}>OTP Authentication</Text>
          <Text style={styles.subtitle}>Check your email to see the verification code</Text>

          <View style={styles.progressBackground}>
            <View style={styles.progressFill} />
          </View>

          {/* OTP Inputs */}
          <View style={styles.otpInputContainer}>
            {otp.map((value, index) => (
              <TextInput
                key={index}
                ref={(el) => (inputsRef.current[index] = el!)}
                style={styles.otpInput}
                value={value}
                keyboardType="number-pad"
                maxLength={1}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
                    inputsRef.current[index - 1]?.focus();
                  }
                }}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
            <Text style={styles.proceedButtonText}>{isLoading ? <ActivityIndicator /> : "Proceed"}</Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't Receive code?</Text>
            <TouchableOpacity onPress={handleResendCode}>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

// Keep your existing styles unchanged
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  banner: { height: 200, backgroundColor: "#fcbf24", borderBottomLeftRadius: 40, borderBottomRightRadius: 40, },
  card: { flex: 1, marginTop: -40, backgroundColor: "#000", borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, width:'95%', alignSelf:'center',},
  envelopeIcon: { width: 30, height: 50, resizeMode: 'contain', alignSelf: 'center' },
  envelopeContainer: { backgroundColor: '#FEB91454', borderRadius: 50, marginTop: 30, width:50, height:50, alignSelf:'center' },
  bottomSection: { flex: 0.6, backgroundColor: '#000', alignItems: 'center', paddingTop: 40 },
  title: { fontSize: 24, fontFamily: 'BebasNeue', color: '#fff', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#aaa', marginBottom: 30 },
  otpInputContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '80%', marginBottom: 30, gap:10 },
  otpInput: { width: 40, height: 40, borderWidth: 1, borderColor: '#ffb300', borderRadius: 8, textAlign: 'center', fontSize: 20, color: '#fff' },
  proceedButton: { backgroundColor: '#ffb300', paddingVertical: 15, paddingHorizontal: 80, borderRadius: 10, width:'100%', alignItems: 'center' },
  proceedButtonText: { color: '#000', fontSize: 18, fontFamily: 'BebasNeue' },
  resendContainer: { flexDirection: 'row', marginTop: 20 },
  resendText: { color: '#aaa', marginRight: 5 },
  resendLink: { color: '#ffb300', fontWeight: 'bold' },
  LogoContainer:{},
  Logoicon:{ width: 130, height: 100, resizeMode: 'contain', alignSelf: 'center' },
  progressBackground: { height: 6, backgroundColor: "#444", borderRadius: 3, marginBottom: 20 },
  progressFill: { height: 6, backgroundColor: "#fcbf24", width: "45%", borderRadius: 3 },
});
