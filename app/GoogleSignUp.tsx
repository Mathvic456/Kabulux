/*import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Alert, Button, View } from 'react-native';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID, // From .env
  offlineAccess: true,
});

export default function GoogleSignIn() {
  
  const signIn = async () => {
    try {
      // Check if device supports Google Play Services
      await GoogleSignin.hasPlayServices();
      
      // Get user info
      const userInfo = await GoogleSignin.signIn();
      
      console.log('User Info:', userInfo);
      Alert.alert('Success!', `Welcome ${userInfo}`);
      
      // userInfo contains:
      // - user.id
      // - user.name
      // - user.email
      // - user.photo
      
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Cancelled', 'Sign in was cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('In Progress', 'Sign in is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Play services not available');
      } else {
        
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Sign in with Google" onPress={signIn} />
    </View>
  );
}*/