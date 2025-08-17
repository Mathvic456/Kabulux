import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  View
} from 'react-native';

const { height } = Dimensions.get('window');

export default function OnboardingScreen1({ next }: { next: () => void }) {
  // Animation values
  const [slideAnim] = useState(new Animated.Value(height)); // Start at bottom
  const [fadeAnim] = useState(new Animated.Value(0)); // Start invisible

  useEffect(() => {
    // Run both animations in parallel
    Animated.parallel([
      // Slide up animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      // Fade in animation (slightly faster)
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      })
    ]).start(() => {
      // Wait at center for 1 second, then navigate
      setTimeout(() => {
        next();
      }, 1000);
    });

    return () => {
      slideAnim.stopAnimation();
      fadeAnim.stopAnimation();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.logoContainer, 
        { 
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim
        }
      ]}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  logoContainer: {
    width: '80%',
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});