import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator, 
  StyleSheet, 
  SafeAreaView, 
  Platform,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { WebView } from 'react-native-webview';
import { X, Lock, ShieldCheck, CreditCard, Smartphone, Building, Check, AlertCircle } from 'lucide-react-native';
import { RAZORPAY_KEY_ID } from '../constants/keys';

interface PaymentOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  bookingId: string;
  amount: number; // in Rupees (e.g. 50 or 14999)
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentFailure: (error: string) => void;
}

// Generate mock payment ID outside component to keep component pure
const generateMockPaymentId = () => {
  return 'pay_sim_' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

export default function PaymentOptionsModal({
  visible,
  onClose,
  bookingId,
  amount,
  description,
  customerName,
  customerEmail,
  customerPhone,
  onPaymentSuccess,
  onPaymentFailure
}: PaymentOptionsModalProps) {
  const [paymentMode, setPaymentMode] = useState<'live' | 'demo'>('demo');
  const [webViewLoaded, setWebViewLoaded] = useState(false);

  // Demo Simulation States
  const [demoTab, setDemoTab] = useState<'card' | 'upi' | 'netbanking' | 'wallet'>('card');
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'otp_verify' | 'upi_waiting' | 'bank_redirect'>('idle');
  
  // Card Inputs
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardName, setCardName] = useState(customerName);

  // UPI Inputs
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string | null>(null);

  // Netbanking Inputs
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  // Wallet Inputs
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  // OTP Verification
  const [otpCode, setOtpCode] = useState('');

  // UPI Timer
  const [timer, setTimer] = useState(120); // 2 minutes countdown
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Convert amount to paise (1 Rupee = 100 Paise)
  const amountInPaise = Math.round(amount * 100);

  // Helper to reset states
  const resetDemoStates = () => {
    setPaymentState('idle');
    setCardNo('');
    setCardExpiry('');
    setCardCVV('');
    setOtpCode('');
    setUpiId('');
    setSelectedUpiApp(null);
    setSelectedBank(null);
    setSelectedWallet(null);
  };

  // Callback simulations
  const handleDemoSuccess = () => {
    const mockPaymentId = generateMockPaymentId();
    onPaymentSuccess(mockPaymentId);
    resetDemoStates();
  };

  const handleDemoFailure = (msg = 'Payment declined by user.') => {
    onPaymentFailure(msg);
    resetDemoStates();
  };

  // 1. Web browser payment flow using Razorpay Standard Web Integration
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    // Inject Razorpay checkout script if not present
    if (!document.getElementById('razorpay-checkout-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || !visible || paymentMode !== 'live') return;

    const openWebRazorpay = () => {
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: 'INR',
        name: 'LawyerSathi',
        description: description,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone
        },
        notes: {
          booking_ref: bookingId
        },
        theme: {
          color: '#111111'
        },
        handler: function (response: any) {
          onPaymentSuccess(response.razorpay_payment_id);
        },
        modal: {
          ondismiss: function () {
            onClose();
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        onPaymentFailure(response.error.description || 'Payment Failed');
      });
      rzp.open();
    };

    const checkAndOpen = () => {
      if ((window as any).Razorpay) {
        openWebRazorpay();
      } else {
        setTimeout(checkAndOpen, 100);
      }
    };

    checkAndOpen();
  }, [visible, paymentMode]);

  // UPI Countdown Timer Hook
  useEffect(() => {
    if (paymentState === 'upi_waiting') {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleDemoFailure('UPI verification session expired. Please try again.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [paymentState]);

  // Format Card Number
  const handleCardNoChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += cleaned[i];
    }
    setCardNo(formatted.substring(0, 19));
  };

  // Format Card Expiry
  const handleCardExpiryChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    setCardExpiry(formatted.substring(0, 5));
  };

  // Format Card CVV
  const handleCardCVVChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    setCardCVV(cleaned.substring(0, 3));
  };

  // Trigger Mock Payment Actions
  const handleDemoPay = () => {
    // Validate inputs based on tab
    if (demoTab === 'card') {
      if (cardNo.length < 19) {
        Alert.alert('Invalid Card', 'Please enter a valid 16-digit card number.');
        return;
      }
      if (cardExpiry.length < 5) {
        Alert.alert('Invalid Expiry', 'Please enter card expiry date (MM/YY).');
        return;
      }
      if (cardCVV.length < 3) {
        Alert.alert('Invalid CVV', 'Please enter your 3-digit security code.');
        return;
      }
      if (!cardName.trim()) {
        Alert.alert('Missing Name', 'Please enter cardholder name.');
        return;
      }
    } else if (demoTab === 'upi') {
      if (!upiId.includes('@') || upiId.length < 5) {
        Alert.alert('Invalid UPI ID', 'Please enter a valid UPI address (e.g. username@bank).');
        return;
      }
    } else if (demoTab === 'netbanking') {
      if (!selectedBank) {
        Alert.alert('Select Bank', 'Please select your bank to continue net banking payment.');
        return;
      }
    } else if (demoTab === 'wallet') {
      if (!selectedWallet) {
        Alert.alert('Select Wallet', 'Please select a digital wallet to continue.');
        return;
      }
    }

    setPaymentState('processing');
    setTimer(120); // Initialize timer here to prevent cascading re-renders in useEffect

    // Simulate Network Request Delay
    setTimeout(() => {
      if (demoTab === 'card') {
        setPaymentState('otp_verify');
      } else if (demoTab === 'upi') {
        setPaymentState('upi_waiting');
      } else {
        setPaymentState('bank_redirect');
      }
    }, 1500);
  };

  // Formatted timer text
  const getTimerText = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Live Mobile Razorpay HTML Source
  const razorpayHtmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #D4AF37;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div id="loader" class="spinner"></div>

        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
          window.onload = function() {
            var options = {
              "key": "${RAZORPAY_KEY_ID}",
              "amount": ${amountInPaise},
              "currency": "INR",
              "name": "LawyerSathi",
              "description": "${description}",
              "prefill": {
                "name": "${customerName}",
                "email": "${customerEmail}",
                "contact": "${customerPhone}"
              },
              "notes": {
                "booking_ref": "${bookingId}"
              },
              "theme": {
                "color": "#111111"
              },
              "handler": function (response) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  event: 'success',
                  paymentId: response.razorpay_payment_id
                }));
              },
              "modal": {
                "ondismiss": function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    event: 'dismissed'
                  }));
                }
              }
            };

            var rzp = new Razorpay(options);
            
            rzp.on('payment.failed', function (response){
              window.ReactNativeWebView.postMessage(JSON.stringify({
                event: 'failed',
                error: response.error.description || 'Payment Failed'
              }));
            });

            rzp.open();
            document.getElementById('loader').style.display = 'none';
          };
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.event === 'success') {
        onPaymentSuccess(data.paymentId);
      } else if (data.event === 'failed') {
        onPaymentFailure(data.error);
      } else if (data.event === 'dismissed') {
        onClose();
      }
    } catch (err) {
      console.warn('Error parsing WebView message:', err);
    }
  };

  // Close helper
  const handleModalClose = () => {
    resetDemoStates();
    onClose();
  };

  // If on web, we do not render anything in the modal for LIVE mode,
  // as Razorpay Standard overlay will handle it.
  if (Platform.OS === 'web' && paymentMode === 'live') {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleModalClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header bar */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Lock size={14} color="#D4AF37" />
            <Text style={styles.headerTitle}>Secure Payment Gateway</Text>
          </View>
          <TouchableOpacity onPress={handleModalClose} style={styles.closeButton}>
            <X size={18} color="#111111" />
          </TouchableOpacity>
        </View>

        {/* Live/Demo Toggle Pill */}
        {paymentState === 'idle' && (
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              onPress={() => setPaymentMode('demo')}
              style={[styles.toggleBtn, paymentMode === 'demo' && styles.toggleBtnActive]}
            >
              <Text style={[styles.toggleText, paymentMode === 'demo' && styles.toggleTextActive]}>Demo Simulation</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setPaymentMode('live')}
              style={[styles.toggleBtn, paymentMode === 'live' && styles.toggleBtnActive]}
            >
              <Text style={[styles.toggleText, paymentMode === 'live' && styles.toggleTextActive]}>Live Razorpay</Text>
            </TouchableOpacity>
          </View>
        )}

        {paymentMode === 'live' ? (
          /* Live Razorpay WebView Mode (Mobile Only) */
          <View style={styles.webViewContainer}>
            <WebView
              source={{ html: razorpayHtmlContent, baseUrl: 'https://checkout.razorpay.com' }}
              style={styles.webView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              originWhitelist={['*']}
              onLoadStart={() => setWebViewLoaded(false)}
              onLoadEnd={() => setWebViewLoaded(true)}
              onMessage={handleMessage}
            />

            {!webViewLoaded && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#D4AF37" />
                <Text style={styles.loadingText}>Initializing Razorpay Secure Tunnel...</Text>
              </View>
            )}
          </View>
        ) : (
          /* Demo Simulation Mode */
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.simulationContainer}
          >
            {paymentState === 'idle' && (
              <View style={{ flex: 1 }}>
                {/* Order Summary banner */}
                <View style={styles.summaryBanner}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Paying For</Text>
                    <Text style={styles.demoBadge}>DEMO MODE</Text>
                  </View>
                  <Text style={styles.summaryDescription}>{description}</Text>
                  <View style={styles.summaryPriceRow}>
                    <Text style={styles.summaryPriceLabel}>Total Amount</Text>
                    <Text style={styles.summaryPrice}>₹{amount.toLocaleString('en-IN')}</Text>
                  </View>
                </View>

                {/* Tabs bar */}
                <View style={styles.tabsContainer}>
                  {(['card', 'upi', 'netbanking', 'wallet'] as const).map((tab) => {
                    const isActive = demoTab === tab;
                    return (
                      <TouchableOpacity
                        key={tab}
                        onPress={() => setDemoTab(tab)}
                        style={[styles.tabButton, isActive && styles.tabButtonActive]}
                      >
                        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                          {tab === 'card' ? 'Card' : tab === 'upi' ? 'UPI' : tab === 'netbanking' ? 'Net Bank' : 'Wallet'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }} showsVerticalScrollIndicator={false}>
                  {/* Card Tab form */}
                  {demoTab === 'card' && (
                    <View style={styles.formCard}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Card Number</Text>
                        <View style={styles.inputWithIcon}>
                          <CreditCard size={14} color="#9CA3AF" style={{ marginRight: 8 }} />
                          <TextInput
                            placeholder="4111 1111 1111 1111"
                            placeholderTextColor="#9CA3AF"
                            value={cardNo}
                            onChangeText={handleCardNoChange}
                            keyboardType="numeric"
                            style={styles.textInput}
                          />
                        </View>
                      </View>

                      <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                          <Text style={styles.inputLabel}>Expiry Date</Text>
                          <TextInput
                            placeholder="12/30"
                            placeholderTextColor="#9CA3AF"
                            value={cardExpiry}
                            onChangeText={handleCardExpiryChange}
                            keyboardType="numeric"
                            style={styles.textInputFull}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.inputLabel}>CVV Code</Text>
                          <TextInput
                            placeholder="123"
                            placeholderTextColor="#9CA3AF"
                            value={cardCVV}
                            onChangeText={handleCardCVVChange}
                            keyboardType="numeric"
                            secureTextEntry={true}
                            style={styles.textInputFull}
                          />
                        </View>
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Card Holder Name</Text>
                        <TextInput
                          placeholder="Your Name"
                          placeholderTextColor="#9CA3AF"
                          value={cardName}
                          onChangeText={setCardName}
                          style={styles.textInputFull}
                        />
                      </View>

                      <View style={styles.alertBox}>
                        <AlertCircle size={14} color="#D4AF37" />
                        <Text style={styles.alertText}>
                          Use standard simulated card details (e.g. Card No starting with 4111) for testing.
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* UPI Tab Form */}
                  {demoTab === 'upi' && (
                    <View style={styles.formCard}>
                      <Text style={styles.sectionHeader}>Instant App Checkout</Text>
                      <View style={styles.appsRow}>
                        {['Google Pay', 'PhonePe', 'Paytm'].map((app) => {
                          const isSel = selectedUpiApp === app;
                          return (
                            <TouchableOpacity
                              key={app}
                              onPress={() => {
                                setSelectedUpiApp(app);
                                setUpiId(customerEmail.split('@')[0] + (app === 'PhonePe' ? '@ybl' : app === 'Google Pay' ? '@okaxis' : '@paytm'));
                              }}
                              style={[styles.appBox, isSel && styles.appBoxSelected]}
                            >
                              <Smartphone size={16} color={isSel ? '#D4AF37' : '#9CA3AF'} style={{ marginBottom: 4 }} />
                              <Text style={[styles.appText, isSel && styles.appTextSelected]}>{app}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      <View style={styles.divider} />

                      {/* Custom UPI ID */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>UPI ID (VPA)</Text>
                        <TextInput
                          placeholder="username@bank"
                          placeholderTextColor="#9CA3AF"
                          value={upiId}
                          onChangeText={(t) => {
                            setUpiId(t);
                            setSelectedUpiApp(null);
                          }}
                          autoCapitalize="none"
                          style={styles.textInputFull}
                        />
                      </View>
                    </View>
                  )}

                  {/* Netbanking Form */}
                  {demoTab === 'netbanking' && (
                    <View style={styles.formCard}>
                      <Text style={styles.sectionHeader}>Select Bank</Text>
                      <View style={styles.banksGrid}>
                        {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak'].map((bank) => {
                          const isSel = selectedBank === bank;
                          return (
                            <TouchableOpacity
                              key={bank}
                              onPress={() => setSelectedBank(bank)}
                              style={[styles.bankBox, isSel && styles.bankBoxSelected]}
                            >
                              <Building size={16} color={isSel ? '#D4AF37' : '#9CA3AF'} style={{ marginBottom: 4 }} />
                              <Text style={[styles.bankText, isSel && styles.bankTextSelected]}>{bank}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {/* Wallet Form */}
                  {demoTab === 'wallet' && (
                    <View style={styles.formCard}>
                      <Text style={styles.sectionHeader}>Select Wallet Provider</Text>
                      <View style={styles.appsRow}>
                        {['Paytm Wallet', 'PhonePe Wallet'].map((wallet) => {
                          const isSel = selectedWallet === wallet;
                          return (
                            <TouchableOpacity
                              key={wallet}
                              onPress={() => setSelectedWallet(wallet)}
                              style={[styles.walletBox, isSel && styles.walletBoxSelected]}
                            >
                              <CreditCard size={16} color={isSel ? '#D4AF37' : '#9CA3AF'} style={{ marginBottom: 6 }} />
                              <Text style={[styles.appText, isSel && styles.appTextSelected]}>{wallet}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </ScrollView>

                {/* Footer Pay Button */}
                <View style={styles.footerContainer}>
                  <TouchableOpacity
                    onPress={handleDemoPay}
                    style={styles.payBtn}
                  >
                    <Text style={styles.payBtnText}>
                      Pay ₹{amount.toLocaleString('en-IN')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Simulated Processing Screen */}
            {paymentState === 'processing' && (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#D4AF37" style={{ marginBottom: 16 }} />
                <Text style={styles.stateTitle}>Securing Your Transaction</Text>
                <Text style={styles.stateSubtitle}>
                  Connecting to your banking institution to process ₹{amount.toLocaleString('en-IN')}...
                </Text>
                <Text style={styles.noticeText}>
                  Please do not reload, press back, or minimize the app.
                </Text>
              </View>
            )}

            {/* Simulated Card OTP Verification Screen */}
            {paymentState === 'otp_verify' && (
              <View style={styles.centerContainerPadding}>
                <View style={styles.iconCircle}>
                  <ShieldCheck size={28} color="#D4AF37" />
                </View>
                <Text style={styles.stateTitle}>Secure OTP verification</Text>
                <Text style={styles.stateSubtitle}>
                  A verification code has been simulated and sent to your bank registered mobile number ending with {customerPhone.substr(-4)}.
                </Text>

                <View style={styles.otpCard}>
                  <Text style={styles.otpLabel}>Enter 6-Digit OTP Code</Text>
                  <TextInput
                    placeholder="------"
                    placeholderTextColor="#9CA3AF"
                    value={otpCode}
                    onChangeText={(t) => setOtpCode(t.replace(/\D/g, '').substring(0, 6))}
                    keyboardType="numeric"
                    textAlign="center"
                    style={styles.otpInput}
                  />
                  <Text style={styles.otpHelp}>
                    (Use any 6-digit code. Ex: 123456)
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleDemoSuccess}
                  disabled={otpCode.length < 6}
                  style={[styles.authoriseBtn, otpCode.length < 6 && styles.authoriseBtnDisabled]}
                >
                  <Text style={styles.authoriseBtnText}>Confirm & Authorise</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDemoFailure()}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelBtnText}>Cancel Transaction</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Simulated UPI App Approval Countdown Screen */}
            {paymentState === 'upi_waiting' && (
              <View style={styles.centerContainerPadding}>
                <View style={styles.iconCircle}>
                  <Smartphone size={24} color="#D4AF37" />
                </View>
                <Text style={styles.stateTitle}>App Approval Pending</Text>
                
                <View style={styles.timerBadge}>
                  <ActivityIndicator size="small" color="#EF4444" style={{ marginRight: 8 }} />
                  <Text style={styles.timerText}>{getTimerText()}</Text>
                </View>

                <Text style={styles.stateSubtitle}>
                  We have sent an approval request of <Text style={{ fontWeight: 'bold', color: '#111111' }}>₹{amount.toLocaleString('en-IN')}</Text> to your UPI app ({upiId}). Please open your UPI app and approve the request.
                </Text>

                <View style={styles.simResponseCard}>
                  <Text style={styles.simResponseTitle}>Simulate UPI Response</Text>
                  <Text style={styles.simResponseSubtitle}>Click below to simulate UPI provider callback action.</Text>
                  
                  <View style={{ gap: 10 }}>
                    <TouchableOpacity
                      onPress={handleDemoSuccess}
                      style={styles.simSuccessBtn}
                    >
                      <Check size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.simBtnText}>Simulate Approve (Success)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDemoFailure('Payment declined on UPI mobile application')}
                      style={styles.simFailedBtn}
                    >
                      <X size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.simBtnText}>Simulate Decline (Decline)</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleDemoFailure()}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelBtnText}>Cancel Request</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Simulated Netbanking / Wallet Gateway Bank Verification Screen */}
            {paymentState === 'bank_redirect' && (
              <View style={styles.centerContainerPadding}>
                <View style={styles.iconCircle}>
                  <Building size={24} color="#D4AF37" />
                </View>
                <Text style={styles.stateTitle}>Authorise Bank Transaction</Text>
                <Text style={styles.stateSubtitle}>
                  Redirecting to the bank secure authorization page. Enter your authorization callback details below.
                </Text>

                <View style={styles.bankDetailCard}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Merchant</Text>
                    <Text style={styles.detailValue}>LawyerSathi Legal</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Payment Method</Text>
                    <Text style={styles.detailValue}>
                      {demoTab === 'netbanking' ? `${selectedBank} Net Banking` : selectedWallet}
                    </Text>
                  </View>
                  <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10, marginTop: 4 }]}>
                    <Text style={styles.detailLabel}>Amount</Text>
                    <Text style={[styles.detailValue, { fontWeight: '800', color: '#111111' }]}>₹{amount.toLocaleString('en-IN')}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleDemoSuccess}
                  style={styles.bankAuthBtn}
                >
                  <Text style={styles.authoriseBtnText}>Simulate Bank Authorisation</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDemoFailure('Bank authorization rejected by client')}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelBtnText}>Cancel Transaction</Text>
                </TouchableOpacity>
              </View>
            )}
          </KeyboardAvoidingView>
        )}

        {/* Footer Secure Info */}
        <View style={styles.footer}>
          <ShieldCheck size={12} color="#10B981" />
          <Text style={styles.footerText}>128-BIT SSL SECURE TRANSACTION POWERED BY RAZORPAY</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: 1,
  },
  closeButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 6,
    borderRadius: 99,
    alignSelf: 'center',
    marginVertical: 16,
    width: 260,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  toggleBtn: {
    flex: 1,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toggleTextActive: {
    color: '#D4AF37',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  simulationContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  summaryBanner: {
    backgroundColor: '#111111',
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryLabel: {
    color: '#9ca3af',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demoBadge: {
    color: '#D4AF37',
    fontSize: 8,
    fontWeight: '800',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
    letterSpacing: 1,
  },
  summaryDescription: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  summaryPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    paddingTop: 12,
  },
  summaryPriceLabel: {
    color: '#9ca3af',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryPrice: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.6)',
    marginTop: 20,
    backgroundColor: '#ffffff',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#D4AF37',
  },
  tabText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#9ca3af',
  },
  tabTextActive: {
    color: '#D4AF37',
  },
  formCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#374151',
    fontWeight: 'bold',
    fontSize: 11,
    marginBottom: 6,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
  },
  textInput: {
    flex: 1,
    paddingVertical: 10,
    color: '#1f2937',
    fontSize: 12,
    fontWeight: '600',
  },
  textInputFull: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  alertText: {
    fontSize: 9,
    color: '#6b7280',
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
    lineHeight: 13,
  },
  sectionHeader: {
    color: '#1f2937',
    fontWeight: '800',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  appsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  appBox: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  appBoxSelected: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.03)',
  },
  appText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
  },
  appTextSelected: {
    color: '#D4AF37',
  },
  walletBox: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  walletBoxSelected: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.03)',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 4,
  },
  banksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bankBox: {
    width: '31%',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  bankBoxSelected: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.03)',
  },
  bankText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
  },
  bankTextSelected: {
    color: '#D4AF37',
  },
  footerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  payBtn: {
    width: '100%',
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  payBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#ffffff',
  },
  centerContainerPadding: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111111',
    textAlign: 'center',
  },
  stateSubtitle: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  noticeText: {
    fontSize: 9,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
  },
  otpCard: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 24,
    width: '100%',
    padding: 24,
    marginBottom: 24,
  },
  otpLabel: {
    color: '#4b5563',
    fontWeight: 'bold',
    fontSize: 11,
    marginBottom: 10,
    textAlign: 'center',
  },
  otpInput: {
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    color: '#111111',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 8,
    marginBottom: 12,
  },
  otpHelp: {
    fontSize: 9,
    color: '#9ca3af',
    textAlign: 'center',
    fontWeight: '500',
  },
  authoriseBtn: {
    width: '100%',
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  authoriseBtnDisabled: {
    backgroundColor: '#e5e7eb',
  },
  authoriseBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cancelBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelBtnText: {
    color: '#1f2937',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 99,
  },
  timerText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  simResponseCard: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 24,
    width: '100%',
    padding: 16,
    marginBottom: 24,
  },
  simResponseTitle: {
    color: '#374151',
    fontWeight: 'bold',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 2,
  },
  simResponseSubtitle: {
    color: '#9ca3af',
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 16,
  },
  simSuccessBtn: {
    width: '100%',
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simFailedBtn: {
    width: '100%',
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bankDetailCard: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 24,
    width: '100%',
    padding: 20,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '600',
  },
  detailValue: {
    color: '#1f2937',
    fontSize: 11,
    fontWeight: 'bold',
  },
  bankAuthBtn: {
    width: '100%',
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  footer: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#f9fafb',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
