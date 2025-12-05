import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function LegalScreen({ goBack, next }: { goBack: () => void; next?: () => void}) {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const legalDocuments = [
    {
      id: 1,
      title: "Terms of Service",
      icon: "document-text",
      content: `Last Updated: ${new Date().toLocaleDateString()}

Please read these Terms of Service carefully before using the Kablux platform.

1. Acceptance of Terms
By accessing or using Kablux, you agree to be bound by these Terms of Service and our Privacy Policy.

2. Services
Kablux provides a platform that connects riders with drivers. We do not provide transportation services.

3. User Accounts
You must maintain the security of your account and promptly notify us of any unauthorized use.

4. Payments
All fares are calculated based on time and distance. You agree to pay all charges incurred.

5. Code of Conduct
Users must behave respectfully toward drivers and other users.

6. Intellectual Property
All content on the Kablux platform is property of Kablux Inc.

7. Limitation of Liability
Kablux shall not be liable for indirect, incidental, or consequential damages.

8. Governing Law
These terms are governed by the laws of the Federal Republic of Nigeria.

For the complete Terms of Service, please visit our website.`,
    },
    {
      id: 2,
      title: "Privacy Policy",
      icon: "shield-checkmark",
      content: `Last Updated: ${new Date().toLocaleDateString()}

Kablux values your privacy. This Privacy Policy explains how we collect, use, and share your information.

1. Information We Collect
We collect information you provide directly, including:
- Contact information
- Payment information
- Location data
- Usage information

2. How We Use Your Information
We use your information to:
- Provide and improve our services
- Process transactions
- Ensure safety and security
- Communicate with you

3. Information Sharing
We may share your information with:
- Drivers to facilitate rides
- Service providers
- Legal authorities when required

4. Data Security
We implement appropriate security measures to protect your information.

5. Your Choices
You can access and update your information through the app settings.

6. Changes to This Policy
We may update this policy periodically.

For the complete Privacy Policy, please visit our website.`,
    },
    {
      id: 3,
      title: "Community Guidelines",
      icon: "people",
      content: `Kablux Community Guidelines

Our community guidelines help ensure a safe and respectful environment for all users.

1. Respect Everyone
Treat drivers and fellow riders with respect. Harassment of any kind will not be tolerated.

2. Safety First
- Always wear your seatbelt
- Don't distract the driver
- Don't bring alcohol or illegal substances

3. Vehicle Care
Respect the vehicle and keep it clean. You may be charged for excessive cleaning or damages.

4. No Smoking
Smoking is prohibited in all Kablux vehicles.

5. Be On Time
Please be ready when your driver arrives to avoid unnecessary waiting fees.

6. Proper Identification
Ensure you're getting into the correct vehicle by checking the license plate and driver details.

7. Feedback
Provide honest and constructive feedback about your experience.

Violations of these guidelines may result in account suspension or termination.`,
    },
    {
      id: 4,
      title: "Copyright Policy",
      icon: "copyright",
      content: `Kablux Copyright Policy

1. Intellectual Property Rights
All content on the Kablux platform, including text, graphics, logos, and software, is the property of Kablux Inc. or its licensors and is protected by copyright laws.

2. User Content
By submitting content to Kablux, you grant us a non-exclusive, royalty-free license to use, reproduce, and display that content.

3. Copyright Infringement
If you believe your copyright has been infringed, please send a notice to our designated agent with:
- Your contact information
- Identification of the copyrighted work
- Identification of the infringing material
- A statement of good faith belief
- A statement under penalty of perjury
- Your signature

4. Counter-Notice
If you believe your content was wrongly removed, you may submit a counter-notice.

5. Repeat Infringers
We terminate accounts of users who are repeat infringers.

For complete details, please visit our website.`,
    },
    {
      id: 5,
      title: "Accessibility Statement",
      icon: "accessibility",
      content: `Kablux Accessibility Statement

Kablux is committed to ensuring digital accessibility for people with disabilities.

1. Our Commitment
We are continually improving the user experience for everyone and applying relevant accessibility standards.

2. Measures to Support Accessibility
Kablux takes the following measures to ensure accessibility:
- Include accessibility throughout our internal policies
- Provide continual accessibility training for our staff
- Assign clear accessibility targets and responsibilities

3. Conformance Status
We aim to conform to level AA of the Web Content Accessibility Guidelines (WCAG) 2.1.

4. Feedback
We welcome your feedback on the accessibility of Kablux. Please let us know if you encounter accessibility barriers.

5. Technical Specifications
Accessibility of Kablux relies on the following technologies:
- React Native
- iOS Accessibility Features
- Android Accessibility Features

6. Assessment Approach
Kablux assesses accessibility through self-evaluation.

We are always working to improve accessibility. Please contact us with any suggestions.`,
    },
    {
      id: 6,
      title: "Open Source Licenses",
      icon: "code",
      content: `Open Source Licenses

Kablux uses several open source packages. We are grateful to the developers who have contributed to these projects.

Notable packages include:
- React Native
- Expo
- React Navigation
- Redux
- Lodash
- Moment.js

For a complete list of open source packages and their respective licenses, please visit our GitHub repository or contact our development team.

This application might include libraries under the following licenses:
- MIT License
- Apache License 2.0
- BSD 3-Clause License
- ISC License

We comply with all license requirements for the open source software we use.`,
    },
  ];

  const openDocument = (document) => {
    setSelectedDocument(document);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDocument(null);
  };

  const openInBrowser = (url) => {
    Linking.openURL(url).catch(err => 
      alert("Unable to open link. Please check your connection.")
    );
  };

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
        <Text style={styles.headerTitle}>Legal</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.introText}>
          Please review our legal documents to understand your rights and responsibilities when using Kablux.
        </Text>

        <View style={styles.documentsContainer}>
          {legalDocuments.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              style={styles.documentCard}
              onPress={() => openDocument(doc)}
              activeOpacity={0.7}
            >
              <View style={styles.documentIcon}>
                <Ionicons name={doc.icon} size={24} color="#FEB914" />
              </View>
              <Text style={styles.documentTitle}>{doc.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#FEB914" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Questions?</Text>
          <Text style={styles.contactText}>
            If you have any questions about our legal documents, please contact our legal team.
          </Text>
          
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => Linking.openURL("mailto:legal@kablux.com")}
          >
            <Text style={styles.contactButtonText}>Contact Legal Team</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.linksSection}>
          <Text style={styles.sectionTitle}>External Links</Text>
          <View style={styles.linkButtons}>
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => openInBrowser("https://kablux.com/terms")}
            >
              <Text style={styles.linkButtonText}>Full Terms of Service</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => openInBrowser("https://kablux.com/privacy")}
            >
              <Text style={styles.linkButtonText}>Full Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Document Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDocument?.title}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Text style={styles.documentContent}>
                {selectedDocument?.content}
              </Text>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.modalActionButton}
              onPress={closeModal}
            >
              <Text style={styles.modalActionButtonText}>Close</Text>
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
    marginTop: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
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
  introText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  documentsContainer: {
    marginBottom: 30,
  },
  documentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2C",
    borderWidth: 1,
    borderColor: "#3d3d3d",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  documentTitle: {
    flex: 1,
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  contactSection: {
    backgroundColor: "#2C2C2C",
    borderWidth: 1,
    borderColor: "#3d3d3d",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#FEB914",
    fontWeight: "600",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 16,
    lineHeight: 20,
  },
  contactButton: {
    backgroundColor: "#FEB914",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  contactButtonText: {
    color: "black",
    fontWeight: "600",
    fontSize: 16,
  },
  linksSection: {
    backgroundColor: "#2C2C2C",
    borderWidth: 1,
    borderColor: "#3d3d3d",
    borderRadius: 12,
    padding: 20,
  },
  linkButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  linkButton: {
    width: "48%",
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#FEB914",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  linkButtonText: {
    color: "#FEB914",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 14,
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
    height: '80%',
    backgroundColor: '#2C2C2C',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FEB914',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d3d',
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
  modalContent: {
    flex: 1,
    marginBottom: 20,
  },
  documentContent: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  modalActionButton: {
    backgroundColor: '#FEB914',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  modalActionButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
});