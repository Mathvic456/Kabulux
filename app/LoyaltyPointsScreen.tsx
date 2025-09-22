import React, { useEffect, useRef, useState } from 'react';
import {
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
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

// Different content for each tab
const tabContents = [
  {
    title: "This Month",
    points: 332,
    distance: "150km",
    distanceIcon: "🚗"
  },
  {
    title: "Last Month",
    points: 285,
    distance: "125km",
    distanceIcon: "🏎️"
  },
  {
    title: "All Time",
    points: 1247,
    distance: "542km",
    distanceIcon: "✈️"
  }
];

export default function LoyaltyPointsScreen({next}: {next?:() => void}) {
  const [activeTab, setActiveTab] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  
  const progressInterval = useRef(null);
  const isAnimating = useRef(false);

  // Start progress animation for current tab
  const startProgressAnimation = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    
    // Reset progress
    progressAnim.setValue(0);
    setProgress(0);
    
    // Animate progress over 5 seconds
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 5000,
      easing: Easing.linear,
      useNativeDriver: false
    }).start(({ finished }) => {
      if (finished) {
        // Move to next tab when progress completes
        moveToNextTab();
      }
    });
    
    // Update progress state for the progress bar
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 0.2;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 10);
  };

  // Stop progress animation
  const stopProgressAnimation = () => {
    isAnimating.current = false;
    progressAnim.stopAnimation();
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  // Move to next tab
  const moveToNextTab = () => {
    stopProgressAnimation();
    
    // Fade out current content
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      // Change to next tab
      const nextTab = (activeTab + 1) % tabContents.length;
      setActiveTab(nextTab);
      
      // Fade in new content
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start(() => {
        // Start progress for the new tab
        startProgressAnimation();
      });
    });
  };

  // Move to previous tab
  const moveToPrevTab = () => {
    stopProgressAnimation();
    
    // Fade out current content
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      // Change to previous tab
      const prevTab = activeTab === 0 ? tabContents.length - 1 : activeTab - 1;
      setActiveTab(prevTab);
      
      // Fade in new content
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start(() => {
        // Start progress for the new tab
        startProgressAnimation();
      });
    });
  };

  // Handle swipe gestures
  const onHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      if (nativeEvent.translationX < -50) {
        // Swipe left - move to next tab
        moveToNextTab();
      } else if (nativeEvent.translationX > 50) {
        // Swipe right - move to previous tab
        moveToPrevTab();
      }
    }
  };

  // Start animation when component mounts
  useEffect(() => {
    startProgressAnimation();
    
    // Clean up on unmount
    return () => {
      stopProgressAnimation();
    };
  }, []);

  // Restart animation when active tab changes
  useEffect(() => {
    startProgressAnimation();
  }, [activeTab]);

  const currentContent = tabContents[activeTab];

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        <PanGestureHandler onHandlerStateChange={onHandlerStateChange}>
          <View style={styles.scrollContainer}>
            {/* Status Bar */}
            <View style={styles.statusBar}>
              {/* <Text style={styles.time}>9:41</Text>
              <View style={styles.signalIcons}>
                <Text style={styles.signalIcon}>📶</Text>
                <Text style={styles.signalIcon}>📡</Text>
                <Text style={styles.signalIcon}>🔋</Text>
              </View> */}
            </View>

            {/* Navigation Tabs with Progress */}
            <View style={styles.navTabsContainer}>
              {tabContents.map((_, index) => (
                <View key={index} style={styles.tabBackground}>
                  <Animated.View 
                    style={[
                      styles.tabProgress,
                      {
                        width: index === activeTab 
                          ? progressAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', '100%']
                            })
                          : index < activeTab ? '100%' : '0%'
                      }
                    ]}
                  />
                </View>
              ))}
            </View>

            <Animated.View style={{ opacity: contentOpacity }}>
              <Text style={styles.sectionTitle}>{currentContent.title}</Text>

              {/* Points Section */}
              <View style={styles.pointsSection}>
                <View style={styles.loyaltyIcon}>
                  <Text style={styles.loyaltyIconText}>🏆</Text>
                </View>
                <View style={styles.pointsTextContainer}>
                  <Text style={styles.pointsText}>Your Total Point </Text>
                  <Text style={styles.sparkleIcon}>✨</Text>
                </View>
                <Text style={styles.totalPoints}>{currentContent.points}</Text>
              </View>

              {/* Distance Card */}
              <View style={styles.distanceCard}>
                <Text style={styles.distanceText}>and your biggest{"\n"}Distance Covered</Text>
                <View style={styles.distanceValue}>
                  <Text style={styles.distanceIcon}>{currentContent.distanceIcon}</Text>
                  <Text style={styles.distanceAmount}>{currentContent.distance}</Text>
                </View>
              </View>
            </Animated.View>

            {/* Action Buttons */}
            <TouchableOpacity style={[styles.actionButton, styles.backButton]}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.shareButton]}>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </PanGestureHandler>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f7b731',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  statusBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  time: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  signalIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  navTabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 30,
  },
  tabBackground: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 3,
    marginHorizontal: 3,
    overflow: 'hidden',
  },
  tabProgress: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  distanceCard: {
    backgroundColor: '#e6a72e',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  distanceText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  distanceValue: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
  },
  distanceIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  distanceAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  actionButton: {
    width: '85%',
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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