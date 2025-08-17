import React from 'react';
import { Button, Text, View } from 'react-native';

export default function LogoutScreen({ next }: { next: () => void }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Logout Screen</Text>
      <Button title="Login Again" onPress={next} />
    </View>
  );
}