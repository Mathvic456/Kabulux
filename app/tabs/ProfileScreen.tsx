import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Profile</Text>
      <View style={styles.profileInfo}>
        <Text>Name: John Doe</Text>
        <Text>Email: john@example.com</Text>
        <Text>Member since: January 2023</Text>
      </View>
      <Button
        title="Edit Profile"
        onPress={() => console.log('Edit profile pressed')}
      />
      <Button
        title="Logout"
        onPress={() => navigation.navigate('logout')}
        color="red"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileInfo: {
    marginBottom: 30,
  },
});