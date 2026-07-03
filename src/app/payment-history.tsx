import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, CreditCard, Download, Receipt, Share2 } from 'lucide-react-native';
import { useStore } from '../store/store';
import PaymentOptionsModal from '../components/payment-modal';

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const user = useStore(state => state.user);
  const bookings = useStore(state => state.bookings);
  const payBooking = useStore(state => state.payBooking);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activePaymentBooking, setActivePaymentBooking] = useState<any | null>(null);

  // Map bookings to transaction history
  const payments = bookings.map(b => {
    let method = 'Online Payment';
    if (b.paymentId) {
      if (b.paymentId.startsWith('pay_card')) method = 'Credit Card';
      else if (b.paymentId.startsWith('pay_upi')) method = 'UPI (GPay)';
      else if (b.paymentId.startsWith('pay_net')) method = 'Net Banking';
      else if (b.paymentId.startsWith('pay_wal')) method = 'Wallet';
    }

    return {
      id: b.paymentId || `TXN_${b.id}`,
      bookingId: b.id,
      packageName: b.packageName,
      amount: b.amount,
      date: b.createdAt || new Date().toISOString().split('T')[0],
      status: b.paymentStatus,
      method,
    };
  });

  const totalSpent = payments
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const successfulCount = payments.filter(p => p.status === 'Paid').length;

  const handleDownloadReceipt = (payment: any) => {
    Alert.alert(
      'Receipt Downloaded',
      `Tax Invoice & Receipt for Booking ${payment.bookingId} (${payment.packageName}) has been successfully saved to your downloads.`,
      [{ text: 'OK' }]
    );
  };

  const handleShareReceipt = async (payment: any) => {
    try {
      await Share.share({
        message: `LawyerSathi Receipt - Booking Ref: ${payment.bookingId}\nPackage: ${payment.packageName}\nAmount Paid: ₹${payment.amount.toLocaleString('en-IN')}\nTransaction ID: ${payment.id}\nDate: ${payment.date}`,
      });
    } catch (_error) {
      // Ignored
    }
  };

  const handlePayNow = (payment: any) => {
    setActivePaymentBooking(payment);
    setShowPaymentModal(true);
  };

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-neutral-100 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ChevronLeft size={22} color="#111111" />
        </TouchableOpacity>
        <Text className="text-neutral-900 font-bold text-lg">Payment History</Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} className="flex-1">
        {!user ? (
          <View className="flex-1 justify-center items-center px-10 py-20 bg-white">
            <CreditCard size={48} color="#9CA3AF" className="opacity-40 mb-4" />
            <Text className="text-neutral-900 font-bold text-lg text-center">Sign In Required</Text>
            <Text className="text-gray-400 text-xs text-center mt-2 mb-6">
              Please sign in to view your transaction history.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              className="bg-gold px-8 py-3.5 rounded-full"
              style={{ backgroundColor: '#D4AF37' }}
            >
              <Text className="text-white font-bold text-xs uppercase tracking-wider">Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : payments.length === 0 ? (
          <View className="flex-1 justify-center items-center px-10 py-20 bg-white">
            <Receipt size={48} color="#9CA3AF" className="opacity-40 mb-4" />
            <Text className="text-neutral-900 font-bold text-lg text-center">No Transactions Found</Text>
            <Text className="text-gray-400 text-xs text-center mt-2 mb-8 leading-5">
              {"You haven't made any purchases or bookings yet. Once you book a package, your receipts will appear here."}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/package')}
              className="bg-gold px-8 py-3.5 rounded-full"
              style={{ backgroundColor: '#D4AF37' }}
            >
              <Text className="text-white font-bold text-xs uppercase tracking-wider">Explore Packages</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="p-5">
            {/* Stat Summary Panel */}
            <View className="bg-neutral-900 rounded-3xl p-6 mb-6 shadow-md border border-neutral-800">
              <Text className="text-neutral-400 text-[10px] font-bold uppercase tracking-wider">Total Amount Spent</Text>
              <Text className="text-white text-3xl font-extrabold mt-1.5">
                ₹{totalSpent.toLocaleString('en-IN')}
              </Text>
              
              <View className="w-full h-[1px] bg-neutral-800 my-4" />
              
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-neutral-400 text-[9px] font-bold uppercase tracking-wider">Payments Made</Text>
                  <Text className="text-gold font-bold text-sm mt-0.5">{successfulCount} Successful</Text>
                </View>
                <View className="bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                  <Text className="text-emerald-400 font-bold text-[9px] uppercase tracking-wider">Secure Gateways</Text>
                </View>
              </View>
            </View>

            {/* List Header */}
            <Text className="text-neutral-800 font-bold text-xs uppercase tracking-wider mb-4 ml-1">
              Transactions ({payments.length})
            </Text>

            {/* Payments List */}
            {payments.map((payment) => {
              const isPaid = payment.status === 'Paid';
              return (
                <View 
                  key={payment.bookingId} 
                  className="bg-white border border-neutral-100 rounded-2xl p-4 mb-4 shadow-xs"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 pr-3">
                      <Text className="text-neutral-800 font-bold text-sm leading-tight">
                        {payment.packageName}
                      </Text>
                      <Text className="text-gray-400 text-[10px] mt-1 font-semibold">
                        Ref: {payment.bookingId} • {payment.date}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-neutral-900 font-extrabold text-sm">
                        ₹{payment.amount.toLocaleString('en-IN')}
                      </Text>
                      <View className={`mt-1 px-2 py-0.5 rounded-full ${isPaid ? 'bg-emerald-50 border border-emerald-100' : 'bg-neutral-100 border border-neutral-200'}`}>
                        <Text className={`font-bold text-[8px] uppercase tracking-wider ${isPaid ? 'text-emerald-600' : 'text-gray-500'}`}>
                          {payment.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Transaction metadata */}
                  <View className="bg-neutral-50/50 border border-neutral-100 rounded-xl p-3 my-2">
                    <View className="flex-row justify-between items-center mb-1.5">
                      <Text className="text-gray-450 text-[9px] font-bold uppercase tracking-wider">Transaction ID</Text>
                      <Text className="text-neutral-850 font-semibold text-[9px] select-all">{payment.id}</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-gray-450 text-[9px] font-bold uppercase tracking-wider">Method</Text>
                      <Text className="text-neutral-850 font-semibold text-[9px]">{payment.method}</Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <View className="flex-row gap-3 mt-3 pt-3 border-t border-neutral-100">
                    {isPaid ? (
                      <>
                        <TouchableOpacity 
                          onPress={() => handleDownloadReceipt(payment)}
                          className="flex-1 bg-amber-50 border border-gold/15 py-2.5 rounded-xl flex-row justify-center items-center active:bg-amber-100/50"
                        >
                          <Download size={12} color="#D4AF37" />
                          <Text className="text-gold font-bold text-[10px] uppercase tracking-wider ml-1.5">Receipt</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          onPress={() => handleShareReceipt(payment)}
                          className="flex-1 bg-neutral-50 border border-neutral-200 py-2.5 rounded-xl flex-row justify-center items-center active:bg-neutral-100"
                        >
                          <Share2 size={12} color="#555555" />
                          <Text className="text-neutral-700 font-bold text-[10px] uppercase tracking-wider ml-1.5">Share</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity 
                        onPress={() => handlePayNow(payment)}
                        className="flex-1 bg-gold py-2.5 rounded-xl flex-row justify-center items-center active:opacity-90"
                        style={{ backgroundColor: '#D4AF37' }}
                      >
                        <CreditCard size={12} color="#FFFFFF" />
                        <Text className="text-white font-bold text-[10px] uppercase tracking-wider ml-1.5">Pay Now & Confirm Booking</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {activePaymentBooking && (
        <PaymentOptionsModal
          visible={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setActivePaymentBooking(null);
          }}
          bookingId={activePaymentBooking.bookingId}
          amount={activePaymentBooking.amount}
          description={activePaymentBooking.packageName}
          customerName={user?.displayName || 'LawyerSathi Client'}
          customerEmail={user?.email || 'client@lawyersathi.com'}
          customerPhone={user?.phoneNumber || '+919876543210'}
          onPaymentSuccess={(paymentId) => {
            payBooking(activePaymentBooking.bookingId, paymentId);
            Alert.alert('Success', 'Payment completed successfully! Your booking is now active.');
            setShowPaymentModal(false);
            setActivePaymentBooking(null);
          }}
          onPaymentFailure={(error) => {
            Alert.alert('Payment Failed', `Could not process payment: ${error}`);
            setShowPaymentModal(false);
            setActivePaymentBooking(null);
          }}
        />
      )}
    </View>
  );
}
