import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Keyboard,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

export default function HelpAndSupportScreen({
  goBack,
  next,
}: {
  goBack: () => void;
  next?: () => void;
}) {
  const [activeModal, setActiveModal] = useState<
    "chat" | "email" | "faq" | null
  >(null);

  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const [chatMessage, setChatMessage] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const SUPPORT_EMAIL = "Hello@kabluxe.com"; // ✅ change if needed

  const closeModal = () => {
    setActiveModal(null);
    setChatMessage("");
    setEmailSubject("");
    setEmailBody("");
  };

  const sendChatMessage = () => {
    closeModal();
    setSuccessModalVisible(true);
  };

  const sendEmail = async () => {
    try {
      const subject = encodeURIComponent(emailSubject);
      const body = encodeURIComponent(emailBody);

      const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (!canOpen) {
        alert("No email app found on this device.");
        return;
      }

      await Linking.openURL(mailtoUrl);

      closeModal();

      setTimeout(() => {
        setSuccessModalVisible(true);
      }, 300);
    } catch {
      alert("Something went wrong while trying to send the email.");
    }
  };

  const supportOptions = [
    // {
    //   icon: "chatbubble-ellipses",
    //   title: "Chat with us",
    //   description: "Get help with rides or account issues, available 24/7",
    //   onPress: () => setActiveModal("chat"),
    // },
    {
      icon: "call",
      title: "Call us",
      description: "Monday - Friday, 8am - 9pm",
      onPress: () => Linking.openURL("tel:+2349188730421"),
    },
    {
      icon: "mail",
      title: "Send us an email",
      description: "Get help anytime, we’ll respond ASAP",
      onPress: () => setActiveModal("email"),
    },
    {
      icon: "help-circle",
      title: "FAQ",
      description: "Get quick help from common questions",
      onPress: () => setActiveModal("faq"),
    },
  ];

  const faqData = [
    {
      question: "How do I create an account?",
      answer:
        "Download the Kabluxe app and follow the signup instructions using your phone number.",
    },
    {
      question: "How do I pay for my ride?",
      answer:
        "We support cards, mobile money, and cash. Set your preference in the app.",
    },
    {
      question: "I forgot an item in a vehicle",
      answer:
        "Contact support immediately with your trip details so we can help.",
    },
    {
      question: "How do I become a driver?",
      answer:
        "Visit our website or contact support to see driver requirements.",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          {supportOptions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.infoItem,
                index !== supportOptions.length - 1 &&
                  styles.infoItemBorder,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.infoLeft}>
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color="#FEB914"
                />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoMain}>{item.title}</Text>
                  <Text style={styles.infoSub}>{item.description}</Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#FEB914"
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* CHAT MODAL */}
      <Modal transparent visible={activeModal === "chat"}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Chat with Support</Text>
              <TextInput
                style={[styles.input, styles.chatInput]}
                value={chatMessage}
                onChangeText={setChatMessage}
                placeholder="Describe your issue..."
                placeholderTextColor="#9CA3AF"
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.modalActionButton,
                  chatMessage ? styles.activeButton : styles.inactiveButton,
                ]}
                onPress={sendChatMessage}
                disabled={!chatMessage}
              >
                <Text style={styles.modalActionButtonText}>
                  Send Message
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* EMAIL MODAL */}
      <Modal transparent visible={activeModal === "email"}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          
          <View style={styles.modalOverlay}>
            
            <View style={styles.modalView}>
                <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Frequently Asked Questions</Text>
        <TouchableOpacity onPress={closeModal}>
          <Ionicons name="close" size={24} color="#FEB914" />
        </TouchableOpacity>
      </View>

              <Text style={styles.modalTitle}>Email Support</Text>

              <TextInput
                style={styles.input}
                value={emailSubject}
                onChangeText={setEmailSubject}
                placeholder="Subject"
                placeholderTextColor="#9CA3AF"
              />

              <TextInput
                style={[styles.input, styles.emailInput]}
                value={emailBody}
                onChangeText={setEmailBody}
                placeholder="Describe your issue..."
                placeholderTextColor="#9CA3AF"
                multiline
              />

              <TouchableOpacity
                style={[
                  styles.modalActionButton,
                  emailSubject && emailBody
                    ? styles.activeButton
                    : styles.inactiveButton,
                ]}
                onPress={sendEmail}
                disabled={!emailSubject || !emailBody}
              >
                <Text style={styles.modalActionButtonText}>
                  Send Email
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

{/* FAQ MODAL */}
<Modal transparent visible={activeModal === "faq"}>
  <View style={styles.modalOverlay}>
    <View style={styles.modalView}>
      {/* Add this header section */}
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Frequently Asked Questions</Text>
        <TouchableOpacity onPress={closeModal}>
          <Ionicons name="close" size={24} color="#FEB914" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {faqData.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{faq.question}</Text>
            <Text style={styles.faqAnswer}>{faq.answer}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  </View>
</Modal>

      {/* SUCCESS MODAL */}
      <Modal transparent visible={successModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalView, { alignItems: "center" }]}>
            <Ionicons
              name="checkmark-circle"
              size={64}
              color="#FEB914"
            />
            <Text style={styles.successTitle}>Email Sent</Text>
            <Text style={styles.successText}>
              Thank you for contacting us. Our support team will respond
              shortly.
            </Text>

            <TouchableOpacity
              style={[styles.modalActionButton, styles.activeButton]}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.modalActionButtonText}>Okay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  scrollContent: { padding: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginTop: 30,
  },
  backButton: {
    backgroundColor: "white",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 20,
  },
  headerSpacer: { flex: 1 },
  infoCard: {
    borderColor: "#FEB914",
    borderWidth: 1,
    borderRadius: 16,
  },
  infoItem: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#3d3d3d",
  },
  infoLeft: { flexDirection: "row", flex: 1 },
  infoTextContainer: { marginLeft: 16 },
  infoMain: { color: "white", fontWeight: "600" },
  infoSub: { color: "#9CA3AF", marginTop: 4 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 16,
  },
  modalView: {
    backgroundColor: "#2C2C2C",
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: "#FEB914",
  },
  input: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 14,
    color: "white",
    marginBottom: 12,
  },
  modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
},
modalTitle: { 
  color: "white", 
  fontSize: 18, 
  // Remove marginBottom: 16 since it's now in the header
},
  chatInput: { minHeight: 100 },
  emailInput: { minHeight: 140 },
  modalActionButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  activeButton: { backgroundColor: "#FEB914" },
  inactiveButton: { backgroundColor: "#555" },
  modalActionButtonText: {
    color: "black",
    fontWeight: "bold",
  },
  faqItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    paddingBottom: 12,
  },
  faqQuestion: { color: "#FEB914", fontWeight: "600" },
  faqAnswer: { color: "#9CA3AF", marginTop: 6 },

  successTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  successText: {
    color: "#9CA3AF",
    textAlign: "center",
    marginVertical: 12,
  },
});
