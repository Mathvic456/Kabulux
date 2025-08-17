import React from 'react';
import { Button, Text, View } from 'react-native';

export default function ProfileScreen({ next }: { next: () => void }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Profile Screen</Text>
      <Button title="Logout" onPress={next} />
    </View>
  );
}