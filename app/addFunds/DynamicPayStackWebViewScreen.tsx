import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';

type DynamicPayStackWebViewScreenProps = {
  goBack: () => void;
};

const DynamicPayStackWebViewScreen = ({ goBack }: DynamicPayStackWebViewScreenProps) => {
  const [showWebView, setShowWebView] = useState(false);
  const [amount, setAmount] = useState('');s
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Your actual Paystack public key
  const PUBLIC_KEY = 'pk_test_2706f40d3a698e9e5426e174f24df5714340d668';

  const handleAddFunds = () => {
    // Validate inputs
    if (!amount || isNaN(amount) || Number(amount) < 100) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount (minimum: ₦100)');
      return;
    }

    if (!email || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setShowWebView(true);
  };

  const generatePaystackHtml = (userAmount, userEmail) => {
    const amountInKobo = Math.round(userAmount * 100); // Convert to kobo
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://js.paystack.co/v1/inline.js"></script>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
          }
          .container {
            background: white;
            padding: 40px 30px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
            width: 100%;
          }
          .logo {
            font-size: 48px;
            margin-bottom: 20px;
          }
          h2 {
            color: #333;
            margin-bottom: 10px;
            font-size: 24px;
          }
          .description {
            color: #666;
            margin-bottom: 25px;
            line-height: 1.5;
          }
          .amount-display {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            margin: 25px 0;
            border: 2px solid #e9ecef;
          }
          .amount {
            font-size: 32px;
            font-weight: bold;
            color: #22c55e;
          }
          .email {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
          }
          .loading {
            color: #666;
            font-style: italic;
            margin: 20px 0;
          }
          .note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 12px;
            border-radius: 8px;
            margin-top: 20px;
            font-size: 12px;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">💳</div>
          <h2>Secure Payment</h2>
          <p class="description">You are about to add funds to your wallet</p>
          
          <div class="amount-display">
            <div class="amount">₦${parseFloat(userAmount).toLocaleString()}</div>
            <div class="email">${userEmail}</div>
          </div>

          <p class="loading">Initializing secure payment...</p>
          
          <div class="note">
            You will be redirected to Paystack's secure payment page to complete your transaction.
          </div>
        </div>

        <script>
          // Initialize payment when page loads
          document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
              try {
                const handler = PaystackPop.setup({
                  key: '${PUBLIC_KEY}',
                  email: '${userEmail}',
                  amount: ${amountInKobo},
                  currency: 'NGN',
                  ref: 'PSK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
                  
                  onClose: function() {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      action: 'closed',
                      message: 'Payment cancelled by user'
                    }));
                  },
                  
                  callback: function(response) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      action: 'success',
                      reference: response.reference,
                      amount: ${userAmount},
                      email: '${userEmail}'
                    }));
                  }
                });
                
                handler.openIframe();
              } catch (error) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  action: 'error',
                  message: 'Failed to initialize payment: ' + error.message
                }));
              }
            }, 1500);
          });
        </script>
      </body>
      </html>
    `;
  };

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Payment Result:', data);

      switch (data.action) {
        case 'success':
          setShowWebView(false);
          Alert.alert(
            'Payment Successful! 🎉',
            `₦${parseFloat(data.amount).toLocaleString()} has been added to your wallet.\n\nReference: ${data.reference}`,
            [
              { 
                text: 'Done', 
                onPress: () => {
                  // Reset form
                  setAmount('');
                  setEmail('');
                }
              }
            ]
          );
          break;

        case 'closed':
          setShowWebView(false);
          Alert.alert('Payment Cancelled', 'You cancelled the payment process.');
          break;

        case 'error':
          setShowWebView(false);
          Alert.alert('Payment Error', data.message || 'Something went wrong');
          break;

        default:
          console.log('Unknown action:', data.action);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
      setShowWebView(false);
    }
  };

  const setQuickAmount = (quickAmount) => {
    setAmount(quickAmount.toString());
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Funds</Text>
        <Text style={styles.headerSubtitle}>Top up your wallet balance</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount (₦)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        {/* Quick Amount Buttons */}
        <Text style={styles.quickAmountLabel}>Quick Amounts</Text>
        <View style={styles.quickAmountContainer}>
          {[500, 1000, 2000, 5000, 10000].map((quickAmount) => (
            <TouchableOpacity
              key={quickAmount}
              style={[
                styles.quickAmountButton,
                amount === quickAmount.toString() && styles.quickAmountButtonActive
              ]}
              onPress={() => setQuickAmount(quickAmount)}
            >
              <Text style={[
                styles.quickAmountText,
                amount === quickAmount.toString() && styles.quickAmountTextActive
              ]}>
                ₦{quickAmount.toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.payButton,
            (!amount || !email) && styles.payButtonDisabled
          ]}
          onPress={handleAddFunds}
          disabled={!amount || !email}
        >
          <Text style={styles.payButtonText}>
            Add ₦{amount ? parseFloat(amount).toLocaleString() : '0'} to Wallet
          </Text>
        </TouchableOpacity>
      </View>

      {/* WebView Modal */}
      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={() => setShowWebView(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowWebView(false)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Processing Payment</Text>
          </View>
          
          <WebView
            source={{ html: generatePaystackHtml(amount, email) }}
            onMessage={handleWebViewMessage}
            style={styles.webview}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  quickAmountLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  quickAmountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  quickAmountButton: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: '30%',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickAmountButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  quickAmountTextActive: {
    color: 'white',
  },
  payButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  payButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  closeButton: {
    padding: 8,
    marginRight: 12,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#374151',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  webview: {
    flex: 1,
  },
});

export default DynamicPayStackWebViewScreen;