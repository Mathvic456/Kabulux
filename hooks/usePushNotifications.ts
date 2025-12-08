import messaging from '@react-native-firebase/messaging';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useState } from 'react';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const usePushNotifications = () => {
  const [fcmToken, setFcmToken] = useState<string | undefined>();

  async function getFCMToken() {
    let tokenString;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      // New modular API (no more warnings)
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === 1 || authStatus === 2; // AUTHORIZED or PROVISIONAL
      
      if (!enabled) {
        console.log('Push notification permission denied');
        return;
      }

      // Get FCM token
      tokenString = await messaging().getToken();
      
      console.log("🔥 [FCM] Token generated:", tokenString);
      setFcmToken(tokenString);
      
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return tokenString;
  }

  return { getFCMToken, fcmToken };
};