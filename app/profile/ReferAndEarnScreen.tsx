import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Clipboard,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

export default function ReferAndEarnScreen({ goBack, next }) {
  const [referralCode] = useState("B219XN23LA22");
  const [referralLink] = useState("https://www.kbl.com/refer/BD1");
  const [showCopiedModal, setShowCopiedModal] = useState(false);
  const [copiedText, setCopiedText] = useState("");
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);

  // Function to handle back button press
  const handleBack = () => {
    if (goBack) {
      goBack();
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text, label) => {
    Clipboard.setString(text);
    setCopiedText(label);
    setShowCopiedModal(true);
    setTimeout(() => setShowCopiedModal(false), 1500);
  };

  // Function to share referral link
  const shareReferral = async () => {
    try {
      await Share.share({
        message: `Join me on KabLux! Use my referral code: ${referralCode} - ${referralLink}`,
      });
    } catch (error) {
      setCopiedText("Failed to share referral link");
      setShowCopiedModal(true);
      setTimeout(() => setShowCopiedModal(false), 1500);
    }
  };

  // Sample rewards data
  const rewardsData = [
    { id: 1, type: "Sign-up Bonus", amount: "₦500", date: "Oct 15, 2023", status: "Completed" },
    { id: 2, type: "First Ride", amount: "₦1000", date: "Oct 20, 2023", status: "Completed" },
    { id: 3, type: "Referral Bonus", amount: "₦1500", date: "Oct 25, 2023", status: "Pending" },
    { id: 4, type: "Referral Bonus", amount: "₦1500", date: "Nov 1, 2023", status: "Pending" },
    { id: 5, type: "Loyalty Bonus", amount: "₦2000", date: "Nov 5, 2023", status: "Earned" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Text */}
        <Text style={styles.introText}>
          Invite friends to KabLux and earn rewards for every sign-up
        </Text>

        {/* Referral Code & Link Card */}
        <View style={styles.infoCard}>
          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => copyToClipboard(referralCode, "Referral code")}
            activeOpacity={0.7}
          >
            <View style={styles.infoLeft}>
              <Text style={styles.infoLabel}>Your referral code :</Text>
              <Text style={styles.infoMain}>{referralCode}</Text>
            </View>
            <Ionicons name="copy-outline" size={24} color="#FEB914" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => copyToClipboard(referralLink, "Referral link")}
            activeOpacity={0.7}
          >
            <View style={styles.infoLeft}>
              <Text style={styles.infoLabel}>Your referral link :</Text>
              <Text style={styles.infoMain} numberOfLines={1}>
                {referralLink}
              </Text>
            </View>
            <Ionicons name="copy-outline" size={24} color="#FEB914" />
          </TouchableOpacity>
        </View>

        {/* Additional Options Card */}
        <View style={styles.infoCard}>
          <TouchableOpacity
            style={styles.infoItemLink}
            onPress={() => setShowRewardsModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoMain}>Your Rewards</Text>
              <Text style={styles.infoSub}>
                Track the rewards you've earned from successful referrals
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FEB914" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.infoItemLink}
            onPress={() => setShowHowItWorksModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoMain}>How it works</Text>
              <Text style={styles.infoSub}>
                Step-by-step explanation of how our referral program works
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FEB914" />
          </TouchableOpacity>
        </View>

        {/* Invite Friends Button */}
        <TouchableOpacity 
          style={styles.inviteButton}
          onPress={shareReferral}
          activeOpacity={0.8}
        >
          <Ionicons name="person-add-outline" size={20} color="black" style={styles.buttonIcon} />
          <Text style={styles.inviteButtonText}>Invite Friends</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Copied Success Modal */}
      <Modal
        visible={showCopiedModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCopiedModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCopiedModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.copiedModal}>
              <Ionicons name="checkmark-circle" size={48} color="#FEB914" />
              <Text style={styles.copiedText}>Copied!</Text>
              <Text style={styles.copiedSubText}>{copiedText} copied to clipboard</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Rewards Modal */}
      <Modal
        visible={showRewardsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRewardsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.fullModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Rewards</Text>
              <TouchableOpacity 
                onPress={() => setShowRewardsModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.rewardsSummary}>
                <View style={styles.rewardStat}>
                  <Text style={styles.rewardStatValue}>₦4500</Text>
                  <Text style={styles.rewardStatLabel}>Total Earned</Text>
                </View>
                <View style={styles.rewardStat}>
                  <Text style={styles.rewardStatValue}>₦3000</Text>
                  <Text style={styles.rewardStatLabel}>Pending</Text>
                </View>
                <View style={styles.rewardStat}>
                  <Text style={styles.rewardStatValue}>3</Text>
                  <Text style={styles.rewardStatLabel}>Successful Referrals</Text>
                </View>
              </View>
              
              <Text style={styles.sectionTitle}>Reward History</Text>
              
              {rewardsData.map((reward) => (
                <View key={reward.id} style={styles.rewardItem}>
                  <View style={styles.rewardInfo}>
                    <Text style={styles.rewardType}>{reward.type}</Text>
                    <Text style={styles.rewardDate}>{reward.date}</Text>
                  </View>
                  <View style={styles.rewardAmountContainer}>
                    <Text style={styles.rewardAmount}>{reward.amount}</Text>
                    <Text style={[
                      styles.rewardStatus,
                      reward.status === 'Completed' && styles.statusCompleted,
                      reward.status === 'Pending' && styles.statusPending,
                      reward.status === 'Earned' && styles.statusEarned,
                    ]}>
                      {reward.status}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* How It Works Modal */}
      <Modal
        visible={showHowItWorksModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHowItWorksModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.fullModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>How It Works</Text>
              <TouchableOpacity 
                onPress={() => setShowHowItWorksModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.stepContainer}>
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Share Your Referral Code</Text>
                    <Text style={styles.stepDescription}>
                      Share your unique referral code or link with friends and family.
                    </Text>
                  </View>
                </View>
                
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>They Sign Up</Text>
                    <Text style={styles.stepDescription}>
                      Your friends sign up using your referral code or link.
                    </Text>
                  </View>
                </View>
                
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>They Complete Their First Ride</Text>
                    <Text style={styles.stepDescription}>
                      Your friends complete their first ride on KabLux.
                    </Text>
                  </View>
                </View>
                
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>4</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>You Get Rewarded</Text>
                    <Text style={styles.stepDescription}>
                      You receive your reward once the referral is verified and completed.
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.termsSection}>
                <Text style={styles.termsTitle}>Terms & Conditions</Text>
                <Text style={styles.termsText}>
                  • Rewards are issued after the referred user completes their first ride{'\n'}
                  • Each user can refer up to 10 friends per month{'\n'}
                  • Rewards expire 30 days after issuance if not used{'\n'}
                  • KabLux reserves the right to modify or terminate this program at any time
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  scrollView: {
    flex: 1,
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
    marginTop: 20,
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
    }),
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
    textAlign: "center",
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  infoCard: {
    backgroundColor: "#2C2C2C",
    borderWidth: 1,
    borderColor: "#FEB914",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    minHeight: 60,
  },
  infoItemLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    minHeight: 70,
  },
  separator: {
    height: 1,
    backgroundColor: "#3d3d3d",
    marginHorizontal: 16,
  },
  infoLeft: {
    flex: 1,
    marginRight: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  infoMain: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  infoTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  infoSub: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
    lineHeight: 18,
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEB914",
    padding: 16,
    borderRadius: 30,
    marginTop: 24,
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
    }),
  },
  buttonIcon: {
    marginRight: 8,
  },
  inviteButtonText: {
    color: "black",
    fontWeight: "700",
    fontSize: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copiedModal: {
    backgroundColor: '#2C2C2C',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  copiedText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 4,
  },
  copiedSubText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  fullModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  modalScrollView: {
    padding: 20,
  },
  // Rewards Modal Styles
  rewardsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  rewardStat: {
    alignItems: 'center',
    flex: 1,
  },
  rewardStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  rewardStatLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  rewardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  rewardDate: {
    fontSize: 12,
    color: '#666',
  },
  rewardAmountContainer: {
    alignItems: 'flex-end',
  },
  rewardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  rewardStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusCompleted: {
    color: 'green',
  },
  statusPending: {
    color: 'orange',
  },
  statusEarned: {
    color: 'blue',
  },
  // How It Works Modal Styles
  stepContainer: {
    marginBottom: 24,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEB914',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  termsSection: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});