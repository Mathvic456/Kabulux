
import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Email from '../../assets/images/email.png';
import Logo from '../../assets/images/logo.png';

export default function VerifyEmailScreen({ next, goRegister, goForgot }: { next: () => void, goRegister: () => void, goForgot: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  
  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
  };

  const handleResendCode = () => {
    // Logic for resending the code
    console.log('Resend code tapped');
  };

  // if (!fontsLoaded) {
  //   return null;
  // }

  const handleProceed = () => {
    next();
  };


  return (
    <View style={styles.container}>
      {/* Top Banner */}
      <View style={styles.banner} />

      {/* Card */}
      <View style={styles.card}>

        <View style={styles.LogoContainer}>
          <Image
            source={Logo} // Update the path as needed
            style={styles.Logoicon}
          />
        </View>

        <View style={styles.envelopeContainer}>
          <Image
            source={Email} // Update the path as needed
            style={styles.envelopeIcon}
          />
        </View>

        <View style={styles.bottomSection}>
        <Text style={styles.title}>OTP Authentication</Text>
        <Text style={styles.subtitle}>Check your email to see the verification code</Text>
        {/* Progress bar */}
                <View style={styles.progressBackground}>
                  <View style={styles.progressFill} />
                </View>
        <View style={styles.otpInputContainer}>
          {otp.map((value, index) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={1}
              onChangeText={(text) => handleOtpChange(text, index)}
              value={value}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
          <Text style={styles.proceedButtonText}>Proceed</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  banner: { height: 200, backgroundColor: "#fcbf24", borderBottomLeftRadius: 40, borderBottomRightRadius: 40, },
  card: { flex: 1, marginTop: -40, backgroundColor: "#000", borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, width:'95%', alignSelf:'center',},
  logo: { fontSize: 36, fontWeight: "bold", color: "#fcbf24", textAlign: "center", marginBottom: 20 },
  // title: { fontSize: 24, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 10 },
  // subtitle: { fontSize: 14, color: "#ccc", textAlign: "center", marginBottom: 20 },

  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#111", borderRadius: 10, marginBottom: 15, paddingHorizontal: 10 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: "#fff", height: 50 },

  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  checkboxRow: { flexDirection: "row", alignItems: "center" },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1, borderColor: "#fcbf24", justifyContent: "center", alignItems: "center", marginRight: 8 },
  checkboxChecked: { backgroundColor: "#fcbf24" },
  checkboxLabel: { color: "#fff", fontSize: 12 },
  forgot: { color: "#fcbf24", fontSize: 12 },

  proceedBtn: { backgroundColor: "#fcbf24", borderRadius: 10, paddingVertical: 14, marginTop: 10 },
  proceedText: { color: "#000", fontWeight: "bold", fontSize: 16 },

  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: "#444" },
  dividerText: { color: "#aaa", marginHorizontal: 10 },

  googleBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", borderColor: "#fcbf24", borderWidth: 1, borderRadius: 10, paddingVertical: 12, marginBottom: 30 },
  googleText: { color: "#fff", marginLeft: 8 },

  footerText: { textAlign: "center", color: "#888", fontSize: 12 },
  signup: { color: "#fcbf24", fontWeight: "bold" },

  envelopeIcon: {
    width: 30,
    height: 50,
    // borderWidth:1,
    // borderColor:'white',
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  envelopeContainer: {
    backgroundColor: '#FEB91454',
    // padding: 20,
    borderRadius: 50,
    marginTop: 30,
    // borderWidth:1,
    // borderColor:'white',
    width:50,
    height:50,
    alignSelf:'center'
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
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 30,
    gap:10,
  },
  otpInput: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#ffb300',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    color: '#fff',
  },
  proceedButton: {
    backgroundColor: '#ffb300',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 10,
    width:'100%',
    alignItems: 'center',
  },
  proceedButtonText: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'BebasNeue',
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  resendText: {
    color: '#aaa',
    marginRight: 5,
  },
  resendLink: {
    color: '#ffb300',
    fontWeight: 'bold',
  },
  LogoContainer:{
  
  },
  Logoicon:{
    width: 130,
    height: 100,
    // borderWidth:1,
    // borderColor:'white',
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  
  progressBackground: { height: 6, backgroundColor: "#444", borderRadius: 3, marginBottom: 20 },
  progressFill: { height: 6, backgroundColor: "#fcbf24", width: "45%", borderRadius: 3 },
});
