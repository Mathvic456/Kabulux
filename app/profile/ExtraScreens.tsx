import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
//import * as Print from 'expo-print';

// import * as FileSystem from 'expo-file-system';
// import * as FileSystem from 'expo-file-system/legacy';
// import { File, Paths } from 'expo-file-system';

// Ride Receipts Screen
export function RideReceiptsScreen({ goBack }: { goBack: () => void }) {
  const [receipts] = useState([
    {
      id: "1",
      date: "2024-01-15",
      time: "14:30",
      from: "Lekki Phase 1, Lagos",
      to: "Victoria Island, Lagos",
      driver: "Chinedu Okafor",
      vehicle: "Toyota Camry - LAG123AB",
      fare: 2500, // NGN
      duration: "25 min",
      distance: "12 km",
    },
    {
      id: "2",
      date: "2024-01-14",
      time: "09:15",
      from: "Maitama, Abuja",
      to: "Central Area, Abuja",
      driver: "Aisha Bello",
      vehicle: "Honda Civic - ABJ456CD",
      fare: 1800, // NGN
      duration: "20 min",
      distance: "10 km",
    },
    {
      id: "3",
      date: "2024-01-13",
      time: "19:45",
      from: "Ikoyi, Lagos",
      to: "Ikeja GRA, Lagos",
      driver: "Tunde Adewale",
      vehicle: "Tesla Model 3 - LAG789EF",
      fare: 3200, // NGN
      duration: "30 min",
      distance: "15 km",
    },
  ]);

  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const viewReceiptDetails = (receipt: any) => {
    setSelectedReceipt(receipt);
    setShowDetailModal(true);
  };

  const generateReceiptHTML = (receipt: any) => {
    const formattedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ride Receipt - ${receipt.id}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
          }
          .header h1 {
            color: #000;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .header h2 {
            color: #FEB914;
            font-size: 20px;
            font-weight: 600;
          }
          .receipt-id {
            color: #666;
            font-size: 14px;
            margin-top: 10px;
          }
          .info-section {
            margin-bottom: 25px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #eee;
          }
          .info-label {
            color: #666;
            font-weight: 500;
          }
          .info-value {
            color: #000;
            font-weight: 600;
            text-align: right;
          }
          .total-section {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 20px;
            font-weight: bold;
          }
          .total-label {
            color: #000;
          }
          .total-amount {
            color: #FEB914;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
            color: #666;
            font-size: 14px;
          }
          .thank-you {
            color: #000;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .divider {
            height: 1px;
            background-color: #eee;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>KABLUX</h1>
            <h2>Ride Receipt</h2>
            <div class="receipt-id">Receipt #${receipt.id} • Generated on ${formattedDate}</div>
          </div>
          
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">Date & Time</span>
              <span class="info-value">${receipt.date} at ${receipt.time}</span>
            </div>
            <div class="divider"></div>
            
            <div class="info-row">
              <span class="info-label">From</span>
              <span class="info-value">${receipt.from}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">To</span>
              <span class="info-value">${receipt.to}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">Driver</span>
              <span class="info-value">${receipt.driver}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">Vehicle</span>
              <span class="info-value">${receipt.vehicle}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">Duration</span>
              <span class="info-value">${receipt.duration}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">Distance</span>
              <span class="info-value">${receipt.distance}</span>
            </div>
          </div>
          
          <div class="total-section">
            <div class="total-row">
              <span class="total-label">TOTAL FARE</span>
              <span class="total-amount">₦${receipt.fare.toLocaleString()}</span>
            </div>
          </div>
          
          <div class="footer">
            <div class="thank-you">Thank you for riding with Kablux!</div>
            <div>Need help? Contact support@kablux.com</div>
            <div>This is an official receipt for your ride</div>
          </div>
        </div>
      </body>
      </html>
    `;
  };
  // const downloadReceipt = async (receipt: any) => {
  //   try {
  //     setIsDownloading(true);

  //     const html = generateReceiptHTML(receipt);

  //     // Create PDF
  //     const { uri } = await Print.printToFileAsync({
  //       html,
  //       base64: false,
  //     });

  //     // Destination
  //     const fileName = `Kablux_Receipt_${receipt.date}_${receipt.id}.pdf`;
  //     const destination = FileSystem.documentDirectory + fileName;

  //     // Move using legacy API
  //     await FileSystem.moveAsync({
  //       from: uri,
  //       to: destination,
  //     });

  //     // Share / Save
  //     if (await Sharing.isAvailableAsync()) {
  //       await Sharing.shareAsync(destination, {
  //         mimeType: 'application/pdf',
  //         dialogTitle: 'Save Receipt',
  //       });
  //     } else {
  //       Alert.alert('Success', 'Receipt saved.');
  //     }

  //   } catch (e) {
  //     console.error(e);
  //     Alert.alert('Error', 'Could not download receipt');
  //   } finally {
  //     setIsDownloading(false);
  //   }
  // };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Receipts</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {receipts.map((receipt) => (
          <TouchableOpacity
            key={receipt.id}
            style={styles.receiptCard}
            onPress={() => viewReceiptDetails(receipt)}
          >
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptDate}>{receipt.date}</Text>
              <Text style={styles.receiptFare}>${receipt.fare}</Text>
            </View>
            <View style={styles.receiptRoute}>
              <Text style={styles.routeText}>{receipt.from}</Text>
              <Ionicons name="arrow-down" size={16} color="#FEB914" />
              <Text style={styles.routeText}>{receipt.to}</Text>
            </View>
            <View style={styles.receiptFooter}>
              <Text style={styles.receiptDriver}>{receipt.driver}</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Receipt Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDetailModal}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            {selectedReceipt && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Ride Receipt</Text>
                  <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>
                </View>

                <View style={styles.receiptDetail}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date & Time</Text>
                    <Text style={styles.detailValue}>
                      {selectedReceipt.date} at {selectedReceipt.time}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>From</Text>
                    <Text style={styles.detailValue}>
                      {selectedReceipt.from}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>To</Text>
                    <Text style={styles.detailValue}>{selectedReceipt.to}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Driver</Text>
                    <Text style={styles.detailValue}>
                      {selectedReceipt.driver}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Vehicle</Text>
                    <Text style={styles.detailValue}>
                      {selectedReceipt.vehicle}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Duration</Text>
                    <Text style={styles.detailValue}>
                      {selectedReceipt.duration}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Distance</Text>
                    <Text style={styles.detailValue}>
                      {selectedReceipt.distance}
                    </Text>
                  </View>
                  <View style={[styles.detailRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total Fare</Text>
                    <Text style={styles.totalValue}>
                      ₦{selectedReceipt.fare}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.downloadButton}
                  // onPress={() => downloadReceipt(selectedReceipt)}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <ActivityIndicator color="black" size="small" />
                  ) : (
                    <>
                      <Ionicons name="download" size={20} color="black" />
                      <Text style={styles.downloadButtonText}>
                        Download Receipt
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Language Settings Screen
export function LanguageScreen({ goBack }: { goBack: () => void }) {
  const [languages] = useState([
    { code: "en", name: "English", native: "English" },
  ]);

  const [selectedLanguage, setSelectedLanguage] = useState("en");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionDescription}>
          Choose your preferred language for the app interface
        </Text>

        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageItem,
              selectedLanguage === language.code && styles.languageItemSelected,
            ]}
            onPress={() => setSelectedLanguage(language.code)}
          >
            <View style={styles.languageInfo}>
              <Text style={styles.languageName}>{language.name}</Text>
              <Text style={styles.languageNative}>{language.native}</Text>
            </View>
            {selectedLanguage === language.code && (
              <Ionicons name="checkmark-circle" size={24} color="#FEB914" />
            )}
          </TouchableOpacity>
        ))}

        {/* <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Language</Text>
        </TouchableOpacity> */}
      </ScrollView>
    </SafeAreaView>
  );
}

// Report an Issue Screen
export function ReportIssueScreen({ goBack }: { goBack: () => void }) {
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const issueTypes = [
    "Payment Issue",
    "Driver Behavior",
    "App Problem",
    "Safety Concern",
    "Lost Item",
    "Other",
  ];

  const handleSubmit = async () => {
    if (!issueType || !description) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report an Issue</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionDescription}>
          Please provide details about the issue you encountered
        </Text>

        {/* Issue Type Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Issue Type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.issueTypeScroll}
          >
            {issueTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.issueTypeButton,
                  issueType === type && styles.issueTypeButtonSelected,
                ]}
                onPress={() => setIssueType(type)}
              >
                <Text
                  style={[
                    styles.issueTypeText,
                    issueType === type && styles.issueTypeTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Please describe the issue in detail..."
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email (Optional)</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail"
              size={24}
              color="#FEB914"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!issueType || !description) && styles.saveButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!issueType || !description || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="black" />
          ) : (
            <Text style={styles.saveButtonText}>Submit Report</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            </View>
            <Text style={styles.modalTitle}>Report Submitted</Text>
            <Text style={styles.modalText}>
              Thank you for your feedback. We'll review your report and get back
              to you within 24 hours.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Rate Our App Screen
export function RateAppScreen({ goBack }: { goBack: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 1500);
  };

  const openStore = () => {
    Linking.openURL("https://apps.apple.com").catch(console.error);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Our App</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={48} color="#FEB914" />
          <Text style={styles.ratingTitle}>How would you rate our app?</Text>
          <Text style={styles.ratingSubtitle}>
            Your feedback helps us improve
          </Text>

          {/* Star Rating */}
          <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={40}
                  color="#FEB914"
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.ratingValue}>
            {rating === 0 ? "Select a rating" : `${rating}/5 stars`}
          </Text>
        </View>

        {/* Comment Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Additional Comments (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us what you like or how we can improve..."
            placeholderTextColor="#9CA3AF"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, rating === 0 && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="black" />
          ) : (
            <Text style={styles.saveButtonText}>Submit Rating</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.storeButton} onPress={openStore}>
          <Ionicons name="logo-google-playbook" size={24} color="#FEB914" />
          <Text style={styles.storeButtonText}>Rate on App Store</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <Ionicons name="heart" size={64} color="#4CAF50" />
            </View>
            <Text style={styles.modalTitle}>Thank You!</Text>
            <Text style={styles.modalText}>
              We appreciate your feedback and will use it to make our app even
              better.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// About Us Screen
export function AboutUsScreen({ goBack }: { goBack: () => void }) {
  const SUPPORT_EMAIL = "Hello@kabluxe.com"; // change if needed
  const SUPPORT_PHONE = "+2348060261407";

  const handleEmail = () => {
    const mailtoUrl = `mailto:${SUPPORT_EMAIL}`;
    Linking.openURL(mailtoUrl);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.aboutHeader}>
          <Ionicons name="car-sport" size={64} color="#FEB914" />
          <Text style={styles.appName}>Kablux</Text>
          <Text style={styles.appVersion}>Version 3.2.1</Text>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>Our Story</Text>
          <Text style={styles.aboutText}>
            Kablux is connecting riders with drivers across the globe. Our
            mission is to provide safe, reliable, and affordable transportation
            while creating economic opportunities for drivers.
          </Text>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>What We Offer</Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={20} color="#FEB914" />
              <Text style={styles.featureText}>Safe & Reliable Rides</Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="cash" size={20} color="#FEB914" />
              <Text style={styles.featureText}>Affordable Pricing</Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="time" size={20} color="#FEB914" />
              <Text style={styles.featureText}>24/7 Availability</Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="headset" size={20} color="#FEB914" />
              <Text style={styles.featureText}>24/7 Support</Text>
            </View>
          </View>
        </View>

        {/* Contact Actions */}
        <View style={styles.contactSection}>
          <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
            <View style={styles.contactLeft}>
              <Ionicons name="mail" size={22} color="#FEB914" />
              <Text style={styles.contactText}>Send us a mail</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FEB914" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactItem, styles.contactItemBorder]}
            onPress={handleCall}
          >
            <View style={styles.contactLeft}>
              <Ionicons name="call" size={22} color="#FEB914" />
              <Text style={styles.contactText}>Contact us</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FEB914" />
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>
          © 2025 Kablux. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  sectionDescription: {
    color: "#9CA3AF",
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 10 : 40,
    backgroundColor: "black",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    position: "relative",
    marginTop: 20,
  },
  backButton: {
    position: "absolute",
    left: 20,
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "white",
  },
  // Ride Receipts Styles
  receiptCard: {
    backgroundColor: "#2C2C2C",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FEB914",
  },
  receiptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  receiptDate: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  receiptFare: {
    color: "#FEB914",
    fontSize: 18,
    fontWeight: "700",
  },
  receiptRoute: {
    marginBottom: 8,
  },
  routeText: {
    color: "white",
    fontSize: 16,
    marginVertical: 2,
  },
  receiptFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  receiptDriver: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  detailModalContent: {
    width: "90%",
    backgroundColor: "#2C2C2C",
    borderRadius: 16,
    padding: 0,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  receiptDetail: {
    padding: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  detailLabel: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  detailValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: "#374151",
  },
  totalLabel: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  totalValue: {
    color: "#FEB914",
    fontSize: 18,
    fontWeight: "700",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEB914",
    borderRadius: 9999,
    padding: 16,
    margin: 24,
    gap: 8,
  },
  downloadButtonText: {
    color: "black",
    fontWeight: "600",
    fontSize: 16,
  },

  // Language Settings Styles
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2C2C2C",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  languageItemSelected: {
    borderWidth: 1,
    borderColor: "#FEB914",
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  languageNative: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  // Report Issue Styles
  inputLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  issueTypeScroll: {
    marginBottom: 8,
  },
  issueTypeButton: {
    backgroundColor: "#2C2C2C",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  issueTypeButtonSelected: {
    backgroundColor: "#FEB914",
  },
  issueTypeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  issueTypeTextSelected: {
    color: "black",
  },
  inputContainer: {
    position: "relative",
    width: "100%",
    justifyContent: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 16,
    zIndex: 1,
  },
  input: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#2C2C2C",
    padding: 16,
    paddingLeft: 48,
    borderWidth: 1,
    borderColor: "#374151",
    color: "white",
    fontSize: 16,
  },
  textArea: {
    height: 120,
    paddingLeft: 16,
    textAlignVertical: "top",
  },
  // Rate App Styles
  ratingContainer: {
    alignItems: "center",
    backgroundColor: "#2C2C2C",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  ratingTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 4,
  },
  ratingSubtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 24,
  },
  starContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingValue: {
    color: "#FEB914",
    fontSize: 16,
    fontWeight: "600",
  },
  storeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2C2C2C",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    gap: 8,
  },
  storeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  // About Us Styles
  aboutHeader: {
    alignItems: "center",
    backgroundColor: "#2C2C2C",
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
  },
  appName: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 4,
  },
  appVersion: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  aboutSection: {
    marginBottom: 24,
  },
  aboutText: {
    color: "#9CA3AF",
    fontSize: 16,
    lineHeight: 24,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    color: "white",
    fontSize: 16,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  contactText: {
    color: "white",
    fontSize: 16,
  },
  legalLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  legalText: {
    color: "white",
    fontSize: 16,
  },
  copyright: {
    color: "#6B7280",
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
  },
  // Common Styles
  saveButton: {
    width: "100%",
    borderRadius: 9999,
    backgroundColor: "#FEB914",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 56,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "black",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#2C2C2C",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  successIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 12,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: "#FEB914",
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
  },
  modalButtonText: {
    color: "black",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },

  /* Contact Section */
  contactSection: {
    backgroundColor: "#2C2C2C",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FEB914",
    marginTop: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
  },
  contactItemBorder: {
    borderTopWidth: 1,
    borderTopColor: "#3d3d3d",
  },
  contactLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
