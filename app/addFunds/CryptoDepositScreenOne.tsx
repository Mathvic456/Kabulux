import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CryptoDepositScreenOne({ next, goRegister, goForgot, goCryptoDeposit }: { next: () => void, goRegister: () => void, goForgot: () => void, goCryptoDeposit: () => void }) {
  const [currencyAmount, setCurrencyAmount] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');

  // Quick action amounts
  const quickAmounts = ['₦100', '₦150', '₦200'];

  // Handle quick amount selection
  const handleQuickAmountSelect = (amount) => {
    // Remove currency symbol and commas, then convert to number
    const numericAmount = amount.replace(/[₦,]/g, '');
    setCurrencyAmount(numericAmount);
    
    // Simple conversion (for demo purposes)
    // In a real app, you would use current exchange rates
    const cryptoValue = (parseFloat(numericAmount) / 1345).toFixed(2); // Assuming 1 USD = 1345 NGN
    setCryptoAmount(`$${cryptoValue}`);
  };

  // Handle currency amount change
  const handleCurrencyAmountChange = (text) => {
    // Allow only numbers and decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    setCurrencyAmount(cleanedText);
    
    // Update crypto amount based on conversion
    if (cleanedText && !isNaN(parseFloat(cleanedText))) {
      const cryptoValue = (parseFloat(cleanedText) / 1345).toFixed(2);
      setCryptoAmount(`$${cryptoValue}`);
    } else {
      setCryptoAmount('');
    }
  };

  // Handle crypto amount change
  const handleCryptoAmountChange = (text) => {
    // Allow only numbers, decimal point, and dollar sign
    const cleanedText = text.replace(/[^0-9.$]/g, '');
    setCryptoAmount(cleanedText);
    
    // Update currency amount based on conversion
    if (cleanedText && cleanedText.includes('$')) {
      const numericValue = cleanedText.replace('$', '');
      if (!isNaN(parseFloat(numericValue))) {
        const currencyValue = (parseFloat(numericValue) * 1345).toFixed(0);
        setCurrencyAmount(currencyValue);
      }
    }
  };

  // Format currency with commas
  const formatCurrency = (amount) => {
    if (!amount) return '';
    return `₦${parseFloat(amount).toLocaleString('en-US')}`;
  };

  const handleProceed = () => {
    next();
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deposit with Crypto</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Fund Via Crypto Wallet Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fund Via Crypto Wallet</Text>
          <Text style={styles.sectionSubtitle}>How much do you want to add</Text>
        </View>
        
        {/* Enter Amount Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enter Amount</Text>
          <View style={styles.amountInputs}>
            <TextInput
              style={[styles.currencyInput, styles.input]}
              placeholder="₦30,000"
              placeholderTextColor="#9CA3AF"
              value={formatCurrency(currencyAmount)}
              onChangeText={handleCurrencyAmountChange}
              keyboardType="numeric"
            />
            <View style={styles.separator} />
            <TextInput
              style={[styles.cryptoInput, styles.input]}
              placeholder="$22.3"
              placeholderTextColor="#9CA3AF"
              value={cryptoAmount}
              onChangeText={handleCryptoAmountChange}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {quickAmounts.map((amount, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickButton}
                onPress={() => handleQuickAmountSelect(amount)}
              >
                <Text style={styles.quickButtonText}>{amount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* How It Works Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.howItWorks}>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>-</Text>
              <Text style={styles.listText}>
                Quickly Select or input the amount you want to deposit.
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>-</Text>
              <Text style={styles.listText}>
                Each deposit earns 10 points for every ₦1000 spent.
              </Text>
            </View>
          </View>
        </View>

        {/* Proceed Button */}
        <TouchableOpacity 
          style={styles.proceedButton}
            onPress={handleProceed}
        >
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
    backgroundColor: 'black',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginTop:20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    height: 25,
    width: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
  },
  section: {
    width: '100%',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  amountInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#FEB914',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#2C2C2C',
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    padding: 8,
  },
  currencyInput: {
    textAlign: 'right',
  },
  cryptoInput: {
    textAlign: 'left',
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  quickButton: {
    borderRadius: 9999,
    backgroundColor: '#2C2C2C',
    borderWidth: 1,
    borderColor: '#9CA3AF',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  quickButtonText: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  howItWorks: {
    backgroundColor: '#2C2C2C',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#FEB914',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    color: '#FEB914',
    marginRight: 8,
    fontSize: 14,
  },
  listText: {
    fontSize: 14,
    color: '#9CA3AF',
    flex: 1,
  },
  proceedButton: {
    width: '100%',
    marginTop: 40,
    borderRadius: 9999,
    backgroundColor: '#FEB914',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  proceedButtonText: {
    color: 'black',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
  },
});