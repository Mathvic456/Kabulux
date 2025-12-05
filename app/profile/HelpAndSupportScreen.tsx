import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Keyboard,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function HelpAndSupportScreen({ goBack, next }: { goBack: () => void; next?: () => void}) {
  const [activeModal, setActiveModal] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const handleChat = () => {
    setActiveModal('chat');
  };

  const handleCall = () => {
    Linking.openURL("tel:+2349188730421");
  };

  const handleEmail = () => {
    setActiveModal('email');
  };

  const handleFAQ = () => {
    setActiveModal('faq');
  };

  const closeModal = () => {
    setActiveModal(null);
    setChatMessage("");
    setEmailSubject("");
    setEmailBody("");
  };

  const sendChatMessage = () => {
    // In a real app, this would send the message to a support system
    alert(`Your message has been sent: "${chatMessage}"`);
    closeModal();
  };

  const sendEmail = () => {
    // In a real app, this would send the email or open the mail client
    const emailContent = `Subject: ${emailSubject}\n\n${emailBody}`;
    alert(`Email prepared:\n${emailContent}`);
    closeModal();
  };

  const supportOptions = [
    {
      icon: "chatbubble-ellipses",
      title: "Chat with us",
      description: "Get help with rides or accounts related issues, available 24/7",
      onPress: handleChat,
    },
    {
      icon: "call",
      title: "Call us",
      description: "Get help with rides or account related issues, available Monday - Friday, 8am - 9pm",
      onPress: handleCall,
    },
    {
      icon: "mail",
      title: "Send us an email",
      description: "Get help with rides or account related issues, available 24/7",
      onPress: handleEmail,
    },
    {
      icon: "help-circle",
      title: "FAQ",
      description: "Get quick help from our frequently asked questions",
      onPress: handleFAQ,
    },
  ];

  // FAQ data - in a real app this might come from an API or database
  const faqData = [
    {
      question: "How do I create an account?",
      answer: "To create an account, download the Kablux app, open it, and follow the registration process. You'll need to provide your phone number and verify it with the code we send you."
    },
    {
      question: "How do I pay for my ride?",
      answer: "We accept various payment methods including credit/debit cards, mobile money, and cash. You can set your preferred payment method in the app's payment section."
    },
    {
      question: "What if I forget an item in a vehicle?",
      answer: "Contact support immediately with your trip details. We'll help connect you with the driver to arrange for the return of your item."
    },
    {
      question: "How do I become a driver?",
      answer: "Visit our website or contact support to learn about driver requirements and the application process. You'll need a valid driver's license and meet vehicle requirements."
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={goBack}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          {supportOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.infoItem,
                index !== supportOptions.length - 1 && styles.infoItemBorder
              ]}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.infoLeft}>
                <Ionicons 
                  name={option.icon} 
                  size={24} 
                  color="#FEB914" 
                  style={styles.infoIcon} 
                />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoMain}>{option.title}</Text>
                  <Text style={styles.infoSub}>{option.description}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FEB914" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Help Section */}
        <View style={styles.additionalHelp}>
          <Text style={styles.additionalHelpTitle}>Need more help?</Text>
          <Text style={styles.additionalHelpText}>
            Our support team is always ready to assist you with any questions or concerns you may have.
          </Text>
        </View>
      </ScrollView>

      {/* Chat Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={activeModal === 'chat'}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chat with Support</Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalDescription}>
                Our support team is available 24/7 to help with any issues you're experiencing.
              </Text>
              
              <TextInput
                style={[styles.input, styles.chatInput]}
                onChangeText={setChatMessage}
                value={chatMessage}
                placeholder="Describe your issue..."
                placeholderTextColor="#9CA3AF"
                multiline={true}
                numberOfLines={4}
              />
              
              <TouchableOpacity
                style={[styles.modalActionButton, chatMessage ? styles.activeButton : styles.inactiveButton]}
                onPress={sendChatMessage}
                disabled={!chatMessage}
              >
                <Text style={styles.modalActionButtonText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Email Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={activeModal === 'email'}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Email Support</Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalDescription}>
                Send us an email and we'll get back to you as soon as possible.
              </Text>
              
              <TextInput
                style={styles.input}
                onChangeText={setEmailSubject}
                value={emailSubject}
                placeholder="Subject"
                placeholderTextColor="#9CA3AF"
              />
              
              <TextInput
                style={[styles.input, styles.emailInput]}
                onChangeText={setEmailBody}
                value={emailBody}
                placeholder="Describe your issue in detail..."
                placeholderTextColor="#9CA3AF"
                multiline={true}
                numberOfLines={6}
              />
              
              <TouchableOpacity
                style={[styles.modalActionButton, emailSubject && emailBody ? styles.activeButton : styles.inactiveButton]}
                onPress={sendEmail}
                disabled={!emailSubject || !emailBody}
              >
                <Text style={styles.modalActionButtonText}>Send Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* FAQ Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={activeModal === 'faq'}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalView, styles.faqModal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Frequently Asked Questions</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.faqContainer}>
              {faqData.map((faq, index) => (
                <View key={index} style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
              ))}
            </ScrollView>
            
            <Text style={styles.faqFooter}>
              Still have questions? Contact us via chat or email.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 40,
    backgroundColor: "black",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
    marginTop:30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  infoCard: {
    backgroundColor: "#2C2C2C",
    borderWidth: 1,
    borderColor: "#FEB914",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    minHeight: 80,
  },
  infoItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#3d3d3d",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: 16,
  },
  infoIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoMain: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
    marginBottom: 4,
  },
  infoSub: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 18,
  },
  additionalHelp: {
    backgroundColor: "#2C2C2C",
    borderWidth: 1,
    borderColor: "#4B5563",
    borderRadius: 12,
    padding: 20,
  },
  additionalHelpTitle: {
    fontSize: 16,
    color: "#FEB914",
    fontWeight: "600",
    marginBottom: 8,
  },
  additionalHelpText: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
  },
  modalView: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#2C2C2C',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FEB914',
  },
  faqModal: {
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 20,
    lineHeight: 22,
  },
  input: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
    color: 'white',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#444',
  },
  chatInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  emailInput: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  modalActionButton: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  activeButton: {
    backgroundColor: '#FEB914',
  },
  inactiveButton: {
    backgroundColor: '#555',
  },
  modalActionButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // FAQ styles
  faqContainer: {
    maxHeight: '75%',
  },
  faqItem: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d3d',
  },
  faqQuestion: {
    fontSize: 16,
    color: '#FEB914',
    fontWeight: '600',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  faqFooter: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
});