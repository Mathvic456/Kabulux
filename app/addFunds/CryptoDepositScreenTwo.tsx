import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// import QRCode from 'react-qr-code';

export default function CryptoDepositScreenTwo({ next, goRegister, goForgot, goCryptoDeposit, goBack }: { next: () => void, goRegister: () => void, goForgot: () => void, goCryptoDeposit: () => void, goBack: () => void }) {
  const [selectedCrypto, setSelectedCrypto] = useState('USDT');
  const [selectedNetwork, setSelectedNetwork] = useState('TRC-20');
  const [cryptoDropdownVisible, setCryptoDropdownVisible] = useState(false);
  const [networkDropdownVisible, setNetworkDropdownVisible] = useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);

  const cryptoOptions = ['USDT', 'BTC', 'ETH'];
  const networkOptions = ['TRC-20', 'ERC-20'];

  // Generate wallet address based on selected crypto and network
  const generateWalletAddress = () => {
    // In a real app, this would come from your backend API
    const addresses = {
      'USDT-TRC-20': 'TXYZ1234567890abcdefghijklmnopqrstuvw',
      'USDT-ERC-20': '0x1234567890abcdefABCDEF1234567890abcdef',
      'BTC-TRC-20': 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      'BTC-ERC-20': '0xBTC1234567890abcdefABCDEF1234567890abcdef',
      'ETH-TRC-20': '0xETH1234567890abcdefABCDEF1234567890abcdef',
      'ETH-ERC-20': '0x7890abcdefABCDEF1234567890abcdef12345678',
    };
    
    return addresses[`${selectedCrypto}-${selectedNetwork}`] || '23456fusayfrttohhgpvvcsshrttiuivcoibahgd';
  };

  const walletAddress = generateWalletAddress();

  // Generate QR code content (usually a payment URI)
  const generateQRContent = () => {
    // For cryptocurrencies, this would typically be a payment URI
    if (selectedCrypto === 'BTC') {
      return `bitcoin:${walletAddress}`;
    } else if (selectedCrypto === 'ETH') {
      return `ethereum:${walletAddress}`;
    } else if (selectedCrypto === 'USDT') {
      // USDT can use different URI schemes depending on the network
      return `${walletAddress}`; // Simple address for QR
    }
    return walletAddress;
  };

  // const qrCodeRef = useRef();

  const handleCryptoSelect = (crypto) => {
    setSelectedCrypto(crypto);
    setCryptoDropdownVisible(false);
  };

  const handleNetworkSelect = (network) => {
    setSelectedNetwork(network);
    setNetworkDropdownVisible(false);
  };

  const copyToClipboard = () => {
    // In a real app, you would use Clipboard API
    Alert.alert('Copied!', 'Wallet address copied to clipboard');
  };

  const handleProceed = () => {
    setConfirmationModalVisible(true);
  };

  const confirmTransaction = () => {
    setConfirmationModalVisible(false);
    Alert.alert('Success', 'Your deposit is being processed!');
    // Navigate to next screen or perform other actions
    if (next) {
      next();
    }
  };

  const closeModal = () => {
    setConfirmationModalVisible(false);
  };

  return (
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
        <Text style={styles.headerTitle}>Deposit with Crypto</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* QR Code Section */}
        <View style={styles.qrCodeSection}>
          <View style={styles.qrCodeContainer}>
            {/* <QRCode
              value={generateQRContent()}
              size={130}
              color="black"
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
            /> */}
          </View>

          {/* Crypto Dropdown */}
          <TouchableOpacity 
            style={[styles.dropdown, cryptoDropdownVisible && styles.dropdownActive]}
            onPress={() => {
              setCryptoDropdownVisible(!cryptoDropdownVisible);
              setNetworkDropdownVisible(false);
            }}
          >
            <View style={styles.dropdownText}>
              <Text style={styles.dropdownSelectedText}>{selectedCrypto}</Text>
              <Ionicons 
                name={cryptoDropdownVisible ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#FEB914" 
              />
            </View>
            {cryptoDropdownVisible && (
              <View style={styles.dropdownMenu}>
                {cryptoOptions.map((crypto, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      selectedCrypto === crypto && styles.dropdownItemSelected
                    ]}
                    onPress={() => handleCryptoSelect(crypto)}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      selectedCrypto === crypto && styles.dropdownItemTextSelected
                    ]}>{crypto}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </TouchableOpacity>

          {/* Network Dropdown */}
          <TouchableOpacity 
            style={[styles.dropdown, networkDropdownVisible && styles.dropdownActive]}
            onPress={() => {
              setNetworkDropdownVisible(!networkDropdownVisible);
              setCryptoDropdownVisible(false);
            }}
          >
            <View style={styles.dropdownText}>
              <Text style={styles.dropdownSelectedText}>{selectedNetwork}</Text>
              <Ionicons 
                name={networkDropdownVisible ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#FEB914" 
              />
            </View>
            {networkDropdownVisible && (
              <View style={styles.dropdownMenu}>
                {networkOptions.map((network, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      selectedNetwork === network && styles.dropdownItemSelected
                    ]}
                    onPress={() => handleNetworkSelect(network)}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      selectedNetwork === network && styles.dropdownItemTextSelected
                    ]}>{network}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </TouchableOpacity>

          {/* Address Box */}
          <TouchableOpacity 
            style={styles.addressBox}
            onPress={copyToClipboard}
          >
            <Text style={styles.addressText}>{walletAddress}</Text>
          </TouchableOpacity>
        </View>

        {/* Note Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Note:</Text>
          <View style={styles.howItWorks}>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>-</Text>
              <Text style={styles.listText}>
                Copy the wallet Address or scan the code to make a deposit
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>-</Text>
              <Text style={styles.listText}>
                Confirm the network with yours on your wallet to ensure there are accurate
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>-</Text>
              <Text style={styles.listText}>
                Send only {selectedCrypto} on the {selectedNetwork} network to this address
              </Text>
            </View>
          </View>
        </View>

        {/* Proceed Button */}
        <TouchableOpacity 
          style={styles.proceedButton}
          onPress={handleProceed}
        >
          <Text style={styles.proceedButtonText}>I've Sent the Funds</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmationModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#FEB914" />
            </View>
            <Text style={styles.modalTitle}>Confirm Transaction</Text>
            <Text style={styles.modalText}>
              Are you sure you've sent {selectedCrypto} via {selectedNetwork} network?
            </Text>
            <Text style={styles.modalWarning}>
              Transactions cannot be reversed once confirmed.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={closeModal}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmTransaction}
              >
                <Text style={styles.modalButtonConfirmText}>Confirm</Text>
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
    marginTop: 20,
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
  qrCodeSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  qrCodeContainer: {
    width: 150,
    height: 150,
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  dropdown: {
    width: '100%',
    backgroundColor: '#2C2C2C',
    borderWidth: 1,
    borderColor: '#4B5563',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    position: 'relative',
  },
  dropdownActive: {
    borderColor: '#FEB914',
    backgroundColor: '#3d3d3d',
  },
  dropdownText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownSelectedText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#2C2C2C',
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#FEB914',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  dropdownItemSelected: {
    backgroundColor: '#FEB91420',
  },
  dropdownItemText: {
    color: 'white',
    fontSize: 16,
  },
  dropdownItemTextSelected: {
    color: '#FEB914',
    fontWeight: '600',
  },
  addressBox: {
    width: '100%',
    backgroundColor: '#2C2C2C',
    borderWidth: 1,
    borderColor: '#FEB914',
    borderRadius: 8,
    padding: 16,
  },
  addressText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
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
    lineHeight: 20,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#2C2C2C',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEB914',
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  modalWarning: {
    fontSize: 14,
    color: '#FEB914',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
  },
  modalButton: {
    flex: 1,
    borderRadius: 9999,
    padding: 16,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#6B7280',
  },
  modalButtonConfirm: {
    backgroundColor: '#FEB914',
  },
  modalButtonCancelText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  modalButtonConfirmText: {
    color: 'black',
    fontWeight: '700',
    fontSize: 16,
  },
});