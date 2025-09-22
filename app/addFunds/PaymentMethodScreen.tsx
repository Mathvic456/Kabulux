import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

export default function PaymentMethodScreen({ next, goRegister, goForgot, goCryptoDeposit, goBack }: { next: () => void, goRegister: () => void, goForgot: () => void, goCryptoDeposit: () => void, goBack: () => void }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [errors, setErrors] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Format card number with spaces (XXXX XXXX XXXX XXXX)
  const formatCardNumber = (text: string) => {
    // Remove all non-digit characters
    const cleanedText = text.replace(/\D/g, '');
    
    // Add space after every 4 digits
    const formattedText = cleanedText.replace(/(\d{4})/g, '$1 ').trim();
    
    // Limit to 16 digits + 3 spaces = 19 characters
    return formattedText.slice(0, 19);
  };

  // Format expiry date (MM/YY)
  const formatExpiry = (text: string) => {
    // Remove all non-digit characters
    const cleanedText = text.replace(/\D/g, '');
    
    if (cleanedText.length <= 2) {
      return cleanedText;
    }
    
    // Format as MM/YY
    return `${cleanedText.slice(0, 2)}/${cleanedText.slice(2, 4)}`;
  };

  const validateForm = () => {
    const newErrors = {
      cardNumber: '',
      expiry: '',
      cvv: '',
      cardName: ''
    };

    let isValid = true;

    // Validate card number (16 digits)
    const cleanedCardNumber = cardNumber.replace(/\D/g, '');
    if (!cleanedCardNumber) {
      newErrors.cardNumber = 'Card number is required';
      isValid = false;
    } else if (cleanedCardNumber.length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
      isValid = false;
    } else if (!/^[0-9]{16}$/.test(cleanedCardNumber)) {
      newErrors.cardNumber = 'Invalid card number format';
      isValid = false;
    }

    // Validate expiry date (MM/YY format and not expired)
    if (!expiry) {
      newErrors.expiry = 'Expiry date is required';
      isValid = false;
    } else {
      const [month, year] = expiry.split('/');
      if (!month || !year || month.length !== 2 || year.length !== 2) {
        newErrors.expiry = 'Invalid format (MM/YY)';
        isValid = false;
      } else {
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);
        const currentYear = new Date().getFullYear() % 100; // Last two digits
        const currentMonth = new Date().getMonth() + 1; // Months are 0-indexed
        
        if (monthNum < 1 || monthNum > 12) {
          newErrors.expiry = 'Invalid month';
          isValid = false;
        } else if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
          newErrors.expiry = 'Card has expired';
          isValid = false;
        }
      }
    }

    // Validate CVV (3 or 4 digits)
    if (!cvv) {
      newErrors.cvv = 'CVV is required';
      isValid = false;
    } else if (!/^[0-9]{3,4}$/.test(cvv)) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
      isValid = false;
    }

    // Validate card name
    if (!cardName.trim()) {
      newErrors.cardName = 'Cardholder name is required';
      isValid = false;
    } else if (cardName.trim().length < 2) {
      newErrors.cardName = 'Name is too short';
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(cardName.trim())) {
      newErrors.cardName = 'Name can only contain letters and spaces';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCardNumberChange = (text: string) => {
    const formattedText = formatCardNumber(text);
    setCardNumber(formattedText);
    
    // Clear error when user starts typing
    if (errors.cardNumber) {
      setErrors({...errors, cardNumber: ''});
    }
  };

  const handleExpiryChange = (text: string) => {
    const formattedText = formatExpiry(text);
    setExpiry(formattedText);
    
    // Clear error when user starts typing
    if (errors.expiry) {
      setErrors({...errors, expiry: ''});
    }
  };

  const handleCvvChange = (text: string) => {
    // Only allow digits, limit to 4 characters
    const cleanedText = text.replace(/\D/g, '').slice(0, 4);
    setCvv(cleanedText);
    
    // Clear error when user starts typing
    if (errors.cvv) {
      setErrors({...errors, cvv: ''});
    }
  };

  const handleCardNameChange = (text: string) => {
    setCardName(text);
    
    // Clear error when user starts typing
    if (errors.cardName) {
      setErrors({...errors, cardName: ''});
    }
  };

  // Simulate API call to save card
  const saveCardToServer = async () => {
    // Simulate network request with random success/failure
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const isSuccess = Math.random() > 0.3; // 70% success rate for demo
        if (isSuccess) {
          resolve('Card saved successfully');
        } else {
          reject(new Error('Failed to save card. Please try again.'));
        }
      }, 2000); // 2 second delay
    });
  };

  const handleSaveCard = async () => {
    // Dismiss keyboard
    Keyboard.dismiss();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call to save card
      await saveCardToServer();
      
      // Show success modal
      setShowSuccessModal(true);
      
      // Navigate to next screen after a delay if next function is provided
      if (next) {
        setTimeout(() => {
          setShowSuccessModal(false);
          next();
        }, 2000);
      }
    } catch (error: any) {
      // Show error modal with specific message
      setErrorMessage(error.message || 'An unexpected error occurred');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={goBack}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add payment method</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Card Number Input */}
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Ionicons 
                name="card" 
                size={24} 
                color="#FEB914" 
                style={styles.inputIcon} 
              />
              <TextInput
                style={[styles.input, errors.cardNumber ? styles.inputError : null]}
                placeholder="Card Number"
                placeholderTextColor="#9CA3AF"
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                keyboardType="numeric"
                maxLength={19} // 16 digits + 3 spaces
                editable={!isLoading}
              />
            </View>
            {errors.cardNumber ? <Text style={styles.errorText}>{errors.cardNumber}</Text> : null}
          </View>

          {/* Expiry and CVV Inputs */}
          <View style={[styles.inputGroup, styles.inlineGroup]}>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <TextInput
                style={[styles.input, { paddingLeft: 16 }, errors.expiry ? styles.inputError : null]}
                placeholder="MM/YY"
                placeholderTextColor="#9CA3AF"
                value={expiry}
                onChangeText={handleExpiryChange}
                keyboardType="numeric"
                maxLength={5}
                editable={!isLoading}
              />
              {errors.expiry ? <Text style={styles.errorText}>{errors.expiry}</Text> : null}
            </View>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <TextInput
                style={[styles.input, { paddingLeft: 16 }, errors.cvv ? styles.inputError : null]}
                placeholder="CVV"
                placeholderTextColor="#9CA3AF"
                value={cvv}
                onChangeText={handleCvvChange}
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                editable={!isLoading}
              />
              {errors.cvv ? <Text style={styles.errorText}>{errors.cvv}</Text> : null}
            </View>
          </View>

          {/* Name on Card Input */}
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Ionicons 
                name="person" 
                size={24} 
                color="#FEB914" 
                style={styles.inputIcon} 
              />
              <TextInput
                style={[styles.input, errors.cardName ? styles.inputError : null]}
                placeholder="Name on card"
                placeholderTextColor="#9CA3AF"
                value={cardName}
                onChangeText={handleCardNameChange}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
            {errors.cardName ? <Text style={styles.errorText}>{errors.cardName}</Text> : null}
          </View>

          {/* Save Card Button */}
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSaveCard}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text style={styles.saveButtonText}>Save card</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Success Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showSuccessModal}
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
              </View>
              <Text style={styles.modalTitle}>Success!</Text>
              <Text style={styles.modalText}>Your card has been saved successfully.</Text>
              {!next && (
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowSuccessModal(false)}
                >
                  <Text style={styles.modalButtonText}>Continue</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>

        {/* Error Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showErrorModal}
          onRequestClose={closeErrorModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.errorIconContainer}>
                <Ionicons name="close-circle" size={64} color="#FF3B30" />
              </View>
              <Text style={styles.modalTitle}>Error</Text>
              <Text style={styles.modalText}>{errorMessage}</Text>
              <TouchableOpacity
                style={[styles.modalButton, styles.errorModalButton]}
                onPress={closeErrorModal}
              >
                <Text style={styles.modalButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 32,
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
    position: 'relative',
    marginTop: 20,
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
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  inlineGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
    justifyContent: 'center',
  },
  halfInput: {
    flex: 1,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    width: '100%',
    borderRadius: 9999,
    backgroundColor: '#2C2C2C',
    padding: 16,
    paddingLeft: 48, // Space for icon
    borderWidth: 1,
    borderColor: '#FEB914',
    color: 'white',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  saveButton: {
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
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 56,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: 'black',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#2C2C2C',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 16,
  },
  errorIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#FEB914',
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
  },
  errorModalButton: {
    backgroundColor: '#6B7280',
  },
  modalButtonText: {
    color: 'black',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
});