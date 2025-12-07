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
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      const tokenData = await Notifications.getDevicePushTokenAsync();
      
      // On Android, this data string IS the FCM token.
      tokenString = tokenData.data;
      
      console.log("🔥 [FCM] Token generated:", tokenString);
      setFcmToken(tokenString);
      
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return tokenString;
  }

  return { getFCMToken, fcmToken };
};