import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function TermsOfServiceScreen({ goBack }: { goBack: () => void }) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);

  const handleAcceptTerms = () => {
    setAcceptedTerms(true);
    setShowAcceptModal(true);
    
    // In a real app, you would save this preference and potentially navigate
    setTimeout(() => {
      setShowAcceptModal(false);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={goBack}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Last Updated */}
        <View style={styles.updateInfo}>
          <Ionicons name="time-outline" size={20} color="#FEB914" />
          <Text style={styles.updateText}>Last updated: January 15, 2024</Text>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.sectionText}>
            Welcome to Kablux. These Terms of Service ("Terms") govern your use of our mobile application, website, and services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms.
          </Text>
        </View>

        {/* Account Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Account Registration</Text>
          <Text style={styles.sectionText}>
            You must be at least 18 years old to use our Services. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </Text>
          <View style={styles.bulletPoint}>
            <Ionicons name="ellipse" size={8} color="#FEB914" />
            <Text style={styles.bulletText}>Provide accurate and complete information</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Ionicons name="ellipse" size={8} color="#FEB914" />
            <Text style={styles.bulletText}>Keep your password secure</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Ionicons name="ellipse" size={8} color="#FEB914" />
            <Text style={styles.bulletText}>Notify us immediately of any unauthorized use</Text>
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Services Description</Text>
          <Text style={styles.sectionText}>
            Kablux provides a platform that connects riders with transportation providers. We do not provide transportation services ourselves but act as an intermediary between you and third-party providers.
          </Text>
        </View>

        {/* Payments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Payments and Fees</Text>
          <Text style={styles.sectionText}>
            You agree to pay all applicable fees for services received through our platform. All fees are calculated based on distance, time, and demand, and are displayed before you confirm your ride.
          </Text>
          <View style={styles.bulletPoint}>
            <Ionicons name="card-outline" size={16} color="#FEB914" />
            <Text style={styles.bulletText}>Prices may vary based on demand and other factors</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Ionicons name="card-outline" size={16} color="#FEB914" />
            <Text style={styles.bulletText}>Cancellation fees may apply in certain circumstances</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Ionicons name="card-outline" size={16} color="#FEB914" />
            <Text style={styles.bulletText}>All payments are processed securely through our payment partners</Text>
          </View>
        </View>

        {/* User Conduct */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. User Conduct</Text>
          <Text style={styles.sectionText}>
            You agree not to engage in any of the following prohibited activities:
          </Text>
          <View style={styles.warningItem}>
            <Ionicons name="warning-outline" size={16} color="#FF3B30" />
            <Text style={styles.warningText}>Harassing or abusive behavior towards drivers or other users</Text>
          </View>
          <View style={styles.warningItem}>
            <Ionicons name="warning-outline" size={16} color="#FF3B30" />
            <Text style={styles.warningText}>Damaging vehicles or property</Text>
          </View>
          <View style={styles.warningItem}>
            <Ionicons name="warning-outline" size={16} color="#FF3B30" />
            <Text style={styles.warningText}>Violating any applicable laws or regulations</Text>
          </View>
          <View style={styles.warningItem}>
            <Ionicons name="warning-outline" size={16} color="#FF3B30" />
            <Text style={styles.warningText}>Attempting to circumvent our payment systems</Text>
          </View>
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Privacy</Text>
          <Text style={styles.sectionText}>
            Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using our Services, you agree to the collection and use of information in accordance with our Privacy Policy.
          </Text>
        </View>

        {/* Intellectual Property */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
          <Text style={styles.sectionText}>
            All content, features, and functionality of our Services, including but not limited to text, graphics, logos, and software, are the exclusive property of Kablux and are protected by international copyright, trademark, and other intellectual property laws.
          </Text>
        </View>

        {/* Termination */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Termination</Text>
          <Text style={styles.sectionText}>
            We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason at our discretion.
          </Text>
        </View>

        {/* Disclaimer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Disclaimer of Warranties</Text>
          <Text style={styles.sectionText}>
            Our Services are provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the Services will be uninterrupted, timely, secure, or error-free.
          </Text>
        </View>

        {/* Limitation of Liability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Limitation of Liability</Text>
          <Text style={styles.sectionText}>
            To the fullest extent permitted by law, Kablux shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
          </Text>
        </View>

        {/* Changes to Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
          <Text style={styles.sectionText}>
            We reserve the right to modify these Terms at any time. We will provide notice of significant changes through our Services or by other means. Your continued use of the Services after such changes constitutes your acceptance of the new Terms.
          </Text>
        </View>

        {/* Governing Law */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Governing Law</Text>
          <Text style={styles.sectionText}>
            These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Contact Information</Text>
          <Text style={styles.sectionText}>
            If you have any questions about these Terms, please contact us at:
          </Text>
          <View style={styles.contactInfo}>
            <Ionicons name="mail-outline" size={16} color="#FEB914" />
            <Text style={styles.contactText}>legal@kablux.com</Text>
          </View>
        </View>

        {/* Acceptance Button */}
        <TouchableOpacity 
          style={[styles.acceptButton, acceptedTerms && styles.acceptButtonDisabled]}
          onPress={handleAcceptTerms}
          disabled={acceptedTerms}
        >
          <Ionicons 
            name={acceptedTerms ? "checkmark-circle" : "checkmark-circle-outline"} 
            size={24} 
            color={acceptedTerms ? "black" : "white"} 
          />
          <Text style={[styles.acceptButtonText, acceptedTerms && styles.acceptButtonTextDisabled]}>
            {acceptedTerms ? 'Terms Accepted' : 'Accept Terms of Service'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          By accepting these terms, you acknowledge that you have read, understood, and agree to be bound by all terms and conditions stated above.
        </Text>
      </ScrollView>

      {/* Acceptance Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showAcceptModal}
        onRequestClose={() => setShowAcceptModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            </View>
            <Text style={styles.modalTitle}>Terms Accepted</Text>
            <Text style={styles.modalText}>
              Thank you for accepting our Terms of Service. You can now continue using all features of the app.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowAcceptModal(false)}
            >
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
    backgroundColor: 'black',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
    marginTop: 20,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2C',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    gap: 8,
  },
  updateText: {
    color: '#FEB914',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#2C2C2C',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    color: '#FEB914',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
    paddingLeft: 4,
  },
  bulletText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3B30',
  },
  warningText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 18,
    flex: 1,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    paddingVertical: 8,
  },
  contactText: {
    color: 'white',
    fontSize: 14,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEB914',
    borderRadius: 9999,
    padding: 16,
    marginVertical: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  acceptButtonDisabled: {
    backgroundColor: '#374151',
  },
  acceptButtonText: {
    color: 'black',
    fontWeight: '700',
    fontSize: 16,
  },
  acceptButtonTextDisabled: {
    color: '#9CA3AF',
  },
  footerNote: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#2C2C2C',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#FEB914',
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
  },
  modalButtonText: {
    color: 'black',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
});