import React from 'react';
import { Button, Text, View } from 'react-native';

export default function OnboardingScreen2({ next }: { next: () => void }) {
  return (
    <View>
      <Text>Learn how to use the app! (Onboarding 2)</Text>
      <Button title="Continue" onPress={next} />
    </View>
  );
}