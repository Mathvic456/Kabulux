import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function WalletScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallet</Text>
      <Text>Your balance: $1,000.00</Text>
      <View style={styles.transaction}>
        <Text>Recent transactions:</Text>
        <Text>- Payment: $50.00</Text>
        <Text>- Deposit: $200.00</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  transaction: {
    marginTop: 20,
  },
});