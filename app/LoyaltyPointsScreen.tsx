import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
// Assuming you have the service alias configured, otherwise adjust path
import { useRiderAnalytics } from '@/services/riderAnalytics.service';

const { width } = Dimensions.get('window');
const STATUS_DURATION = 5000; // 5 seconds like WhatsApp status

export default function LoyaltyPointsScreen({ back }: { back: () => void }) {
  // 1. Fetch Data
  const { data: riderAnalyticsData, isLoading, isError } = useRiderAnalytics();
  
  // Safe access to points
  const totalPoints = riderAnalyticsData?.total_points || 0;

  // 2. Animation Refs
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // 3. Handle Animation & Auto-Close
  useEffect(() => {
    // Only start animation if data is loaded and not erroring
    if (!isLoading) {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: STATUS_DURATION,
        easing: Easing.linear,
        useNativeDriver: false, // Width changes require native driver false
      }).start(({ finished }) => {
        // Auto-close when finished
        if (finished) {
          back();
        }
      });
    }

    // Cleanup: Stop animation if component unmounts early
    return () => {
      progressAnim.stopAnimation();
    };
  }, [isLoading, back]);

  // 4. Content Logic
  const getMessageContent = () => {
    if (totalPoints < 100) {
      return {
        icon: "🌱",
        title: "You can do better!",
        message: "This is your sign to use Kablux more."
      };
    } else if (totalPoints < 500) {
      return {
        icon: "🏎️",
        title: "Cruising Along!",
        message: "You're racking up those miles nicely."
      };
    } else {
      return {
        icon: "👑",
        title: "Legendary Status",
        message: "You are absolutely crushing it!"
      };
    }
  };

  const content = getMessageContent();

  // 5. Loading State
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#f7b731" />
        <Text style={styles.loadingText}>Checking your points...</Text>
      </View>
    );
  }

  // 6. Error State (Optional simple fallback)
  if (isError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: 'red' }]}>Failed to load points.</Text>
        <TouchableOpacity onPress={back} style={styles.errorButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.scrollContainer}>
        
        {/* Progress Bar (Single "WhatsApp Status" style) */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View 
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]}
            />
          </View>
        </View>

        {/* Header Controls (X Button) */}
        <View style={styles.headerControls}>
           <TouchableOpacity onPress={back} style={styles.closeButton}>
             {/* Simple X text, replace with Icon (e.g., Ionicons) if you have it installed */}
             <Text style={styles.closeButtonText}>✕</Text>
           </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>All Time Stats</Text>

          {/* Points Section */}
          <View style={styles.pointsSection}>
            <View style={styles.loyaltyIcon}>
              <Text style={styles.loyaltyIconText}>🏆</Text>
            </View>
            <View style={styles.pointsTextContainer}>
              <Text style={styles.pointsText}>Your Total Points </Text>
              <Text style={styles.sparkleIcon}>✨</Text>
            </View>
            <Text style={styles.totalPoints}>{totalPoints}</Text>
          </View>

          {/* Message Card (Replaces Distance Card) */}
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>{content.title}</Text>
            <View style={styles.messageBody}>
              <Text style={styles.distanceIcon}>{content.icon}</Text>
              <Text style={styles.messageText}>{content.message}</Text>
            </View>
          </View>
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.backButton]}
            onPress={back}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.shareButton]}>
            <Text style={styles.shareButtonText}>Share Stats</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f7b731',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 10,
  },
  // Progress Bar Styles
  progressBarContainer: {
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  // Header controls
  headerControls: {
    paddingHorizontal: 20,
    alignItems: 'flex-end', // Puts X on the right, change to flex-start for left
    marginBottom: 10,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '800',
    marginTop: -2, // Visual adjustment for generic fonts
  },
  errorButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f7b731',
    borderRadius: 8
  },
  // Main Content
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
  },
  pointsSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loyaltyIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loyaltyIconText: {
    fontSize: 40,
  },
  pointsTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pointsText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  sparkleIcon: {
    fontSize: 24,
    marginLeft: 5,
  },
  totalPoints: {
    fontSize: 80,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 80,
    marginTop: -5,
  },
  // Message / Distance Card
  messageCard: {
    backgroundColor: '#e6a72e',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  messageBody: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  distanceIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  messageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  // Footer
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
  },
  actionButton: {
    width: '85%',
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    backgroundColor: '#000',
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  shareButton: {
    backgroundColor: '#f7b731',
    borderWidth: 2,
    borderColor: '#fff',
  },
  shareButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});