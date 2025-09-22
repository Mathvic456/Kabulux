import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
type AddFundsScreenProps = {
  next: () => void;
  goRegister: () => void;
  goForgot: () => void;
  goBack: () => void;
  goCryptoDeposit?: () => void; // 👈 optional
};

export default function AddFundsScreen({
  next,
  goRegister,
  goForgot,
  goBack,
  goCryptoDeposit,
}: AddFundsScreenProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmountModalVisible, setCustomAmountModalVisible] = useState(false);
  const [customAmountInput, setCustomAmountInput] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);


  const amountButtons = [
    { id: 1, amount: 1000, label: '₦1,000' },
    { id: 2, amount: 2000, label: '₦2,000' },
    { id: 3, amount: 3000, label: '₦3,000' },
  ];

  const paymentMethods = [
    { id: 1, type: 'mastercard', label: 'Mastercard ****2132', icon: 'M' },
    { id: 2, type: 'visa', label: 'Visa ****2132', icon: 'V' },
    { id: 3, type: 'crypto', label: 'Add with Crypto', icon: 'C' },
  ];

  const handleAmountSelection = (amount) => {
    setSelectedAmount(amount);
  };

  const handleCustomAmountDone = () => {
    if (customAmountInput && !isNaN(customAmountInput)) {
      setSelectedAmount(parseInt(customAmountInput));
    }
    setCustomAmountModalVisible(false);
    setCustomAmountInput('');
  };

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };
  const handleProceed = () => {
    if (selectedPaymentMethod === 3) {
      goCryptoDeposit?.(); // 👈 safe call
    } else {
      next();
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Funds</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {/* Amount Section */}
        <View style={styles.amountSection}>
          <View style={styles.amountDisplayContainer}>
            <Text style={styles.amountLabel}>How much do you want to add?</Text>
            {selectedAmount ? (
              <Text style={styles.selectedAmount}>{formatCurrency(selectedAmount)}</Text>
            ) : null}
            <View style={styles.separatorLines}>
              <View style={[styles.separatorLine, styles.lineYellow]} />
              <View style={[styles.separatorLine, styles.lineGray]} />
            </View>
          </View>
          
          <View style={styles.amountButtons}>
            {amountButtons.map((button) => (
              <TouchableOpacity
                key={button.id}
                style={[
                  styles.amountButton,
                  selectedAmount === button.amount && styles.amountButtonSelected
                ]}
                onPress={() => handleAmountSelection(button.amount)}
              >
                <Text
                  style={[
                    styles.amountButtonText,
                    selectedAmount === button.amount && styles.amountButtonTextSelected
                  ]}
                >
                  {button.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.customAmountButton}
            onPress={() => setCustomAmountModalVisible(true)}
          >
            <Text style={styles.customAmountButtonText}>Enter a custom amount</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Methods Section */}
        <View style={styles.paymentMethodsSection}>
          <Text style={styles.sectionTitle}>Select payment methods</Text>
          <View style={styles.paymentList}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.paymentItem}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentIcon}>{method.icon}</Text>
                  <Text style={styles.paymentLabel}>{method.label}</Text>
                </View>
                <View style={styles.radioButton}>
                  {selectedPaymentMethod === method.id && (
                    <View style={styles.selectedDot} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
            
            {/* Add Payment Method */}
            <TouchableOpacity style={styles.addPaymentMethod} onPress={handleProceed}>
              <View style={styles.addPaymentIconText}>
                <Ionicons name="add" size={24} color="#9CA3AF" />
                <Text style={styles.addPaymentText}>Add payment method</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Funds Button */}
        <TouchableOpacity style={styles.addFundsButton} onPress={handleProceed}>
          <Text style={styles.addFundsButtonText}>Add Funds</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Custom Amount Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={customAmountModalVisible}
        onRequestClose={() => setCustomAmountModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Custom Amount</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 5000"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={customAmountInput}
              onChangeText={setCustomAmountInput}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCustomAmountModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.doneButton]}
                onPress={handleCustomAmountDone}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
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
    marginTop:25,
    // elevation: 4,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    height: 30,
    width: 30,
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
  amountSection: {
    width: '100%',
    padding: 16,
    marginTop: 32,
    alignItems: 'center',
  },
  amountDisplayContainer: {
    position: 'relative',
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
  },
  amountLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  selectedAmount: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: '700',
    color: '#FEB914',
  },
  separatorLines: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: -1,
    marginTop: 30,
  },
  separatorLine: {
    height: 2,
    flex: 1,
  },
  lineYellow: {
    backgroundColor: '#FEB914',
  },
  lineGray: {
    backgroundColor: '#4B5563',
  },
  amountButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 16,
    width: '100%',
  },
  amountButton: {
    flex: 1,
    borderRadius: 9999,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FEB914',
    backgroundColor: 'transparent',
  },
  amountButtonSelected: {
    backgroundColor: '#FEB914',
  },
  amountButtonText: {
    fontWeight: '600',
    color: '#FEB914',
    textAlign: 'center',
  },
  amountButtonTextSelected: {
    color: 'black',
  },
  customAmountButton: {
    width: '100%',
    marginTop: 16,
    borderRadius: 9999,
    backgroundColor: '#FEB914',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  customAmountButtonText: {
    color: 'black',
    fontWeight: '600',
    textAlign: 'center',
  },
  paymentMethodsSection: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#2C2C2C',
    padding: 24,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 14,
    color: '#9CA3AF',
  },
  paymentList: {
    gap: 16,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
    paddingBottom: 12,
  },
  paymentDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentIcon: {
    fontSize: 18,
    color: 'white',
  },
  paymentLabel: {
    color: 'white',
  },
  radioButton: {
    height: 20,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FEB914',
  },
  selectedDot: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#FEB914',
  },
  addPaymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    color: '#9CA3AF',
  },
  addPaymentIconText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addPaymentText: {
    color: '#9CA3AF',
  },
  addFundsButton: {
    width: '90%',
    marginTop: 40,
    borderRadius: 9999,
    backgroundColor: '#FEB914',
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  addFundsButtonText: {
    color: 'black',
    fontWeight: '700',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '80%',
    maxWidth: 320,
    borderRadius: 16,
    backgroundColor: '#2C2C2C',
    padding: 24,
  },
  modalTitle: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    padding: 12,
    color: 'white',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  modalButton: {
    borderRadius: 9999,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  doneButton: {
    backgroundColor: '#FEB914',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  doneButtonText: {
    color: 'black',
    fontWeight: '600',
  },
});