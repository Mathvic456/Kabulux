import React from 'react';
import { Button, Text, View } from 'react-native';

export default function ForgotPasswordScreen({ next }: { next: () => void }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Forgot Password Screen</Text>
      <Button title="Reset Password" onPress={next} />
    </View>
  );
}