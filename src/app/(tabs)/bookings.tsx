import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { FileUp, RefreshCw, CheckCircle2 } from 'lucide-react-native';
import { useStore } from '../../store/store';
import { BookingStatus } from '../../types';
import PaymentOptionsModal from '../../components/payment-modal';

export default function BookingsScreen() {
  const router = useRouter();
  const user = useStore(state => state.user);
  const allBookings = useStore(state => state.bookings);
  const bookings = React.useMemo(() => allBookings.filter(b => b.paymentStatus === 'Paid'), [allBookings]);
  const advanceStatus = useStore(state => state.advanceBookingStatus);
  const upgradeBooking = useStore(state => state.upgradeBooking);
  const fetchBookings = useStore(state => state.fetchBookings);
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [activeUpgradeBooking, setActiveUpgradeBooking] = React.useState<any | null>(null);

  React.useEffect(() => {
    if (user?.uid) {
      fetchBookings(user.uid);
    }
  }, [user?.uid, fetchBookings]);

  const handleUpgrade = (bookingId: string) => {
    if (!user) return;
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    setActiveUpgradeBooking(booking);
    setShowPaymentModal(true);
  };

  if (!user) {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }} className="bg-white">
        <View className="items-center px-10">
          <Image
            source={require('../../../assets/images/logo_shield_transparent.png')}
            className="w-14 h-14 opacity-15 mb-4"
            resizeMode="contain"
          />
          <Text className="text-neutral-900 font-bold text-lg text-center">Please Sign In</Text>
          <Text className="text-gray-400 text-xs text-center mt-2 mb-6">
            Log in to view and track your marriage registration bookings.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            className="bg-gold px-8 py-3 rounded-full"
          >
            <Text className="text-white font-bold text-xs uppercase tracking-wider">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const trackerStages: BookingStatus[] = [
    'Documents Uploaded',
    'Verification Complete',
    'Advocate Assigned',
    'Appointment Scheduled',
    'Marriage Conducted',
    'Certificate Processing',
    'Completed'
  ];

  const handleAdvance = (id: string) => {
    advanceStatus(id);
  };

  const getStageIndex = (currentStatus: BookingStatus) => {
    return trackerStages.indexOf(currentStatus);
  };

  if (bookings.length === 0) {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }} className="bg-white">
        <View className="items-center px-8 w-full max-w-md">
          <Image
            source={require('../../../assets/images/logo_shield_transparent.png')}
            className="w-14 h-14 opacity-15 mb-4"
            resizeMode="contain"
          />
          <Text className="text-neutral-900 font-extrabold text-lg text-center">No Bookings Found</Text>
          <Text className="text-gray-400 text-xs text-center mt-2 mb-8 px-6 leading-5">
            {"You don't have any active court marriage bookings. Get started with our legal services below:"}
          </Text>
          
          <View className="w-full gap-3">
            <TouchableOpacity
              onPress={() => router.push('/package')}
              className="w-full bg-neutral-900 py-3.5 rounded-full items-center justify-center shadow-xs"
            >
              <Text className="text-white font-bold text-xs uppercase tracking-wider">Book Marriage Package</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/lawyers')}
              className="w-full bg-amber-50 border border-gold/15 py-3.5 rounded-full items-center justify-center"
            >
              <Text className="text-gold font-bold text-xs uppercase tracking-wider">Consult a Lawyer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-neutral-100 items-center">
        <Text className="text-neutral-900 font-bold text-lg">My Bookings</Text>
        <Text className="text-gold font-bold text-[10px] tracking-wider uppercase">Real-Time Registration Status</Text>
      </View>

      <ScrollView 
        className="flex-1 px-6 pt-4" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {bookings.map(booking => {
          const currentStageIdx = getStageIndex(booking.status);

          return (
            <View key={booking.id} className="bg-white rounded-3xl border border-neutral-150 p-5 mb-8 shadow-sm">
              {/* Header Info */}
              <View className="flex-row justify-between items-start pb-4 border-b border-neutral-100 mb-4">
                <View className="flex-1">
                  <Text className="text-neutral-900 font-extrabold text-sm">{booking.packageName}</Text>
                  <Text className="text-gray-450 text-[10px] font-bold mt-1">Ref ID: {booking.id}</Text>
                </View>
                <View className="bg-amber-50 border border-gold/20 px-3 py-1 rounded-full">
                  <Text className="text-gold font-bold text-[9px] uppercase tracking-wider">{booking.paymentStatus}</Text>
                </View>
              </View>

              {/* Quick Details */}
              <View className="bg-neutral-50 rounded-2xl p-4 mb-6 border border-neutral-100">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-500 text-xs font-semibold">Bride / Groom</Text>
                  <Text className="text-neutral-800 text-xs font-bold text-right">
                    {booking.brideName && booking.groomName ? `${booking.brideName} & ${booking.groomName}` : 'Details Pending'}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-500 text-xs font-semibold">Advocate</Text>
                  <Text className="text-neutral-800 text-xs font-bold">{booking.advocateName || 'Assigning soon...'}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 text-xs font-semibold">SDM Office</Text>
                  <Text className="text-neutral-800 text-xs font-bold w-[60%] text-right" numberOfLines={1}>
                    {booking.sdmName || 'Assigning soon...'}
                  </Text>
                </View>
              </View>

              {/* Action shortcuts */}
              <View className="flex-row gap-3 mb-6">
                <TouchableOpacity
                  onPress={() => router.push('/document-upload')}
                  className="flex-1 flex-row justify-center items-center py-3 px-3 bg-neutral-900 rounded-xl"
                >
                  <FileUp size={12} color="#FFFFFF" />
                  <Text className="text-white font-bold text-[10px] ml-1.5 uppercase">Uploads</Text>
                </TouchableOpacity>

                {booking.packageName.includes('Consultation') && (
                  <TouchableOpacity
                    onPress={() => handleUpgrade(booking.id)}
                    className="flex-1 flex-row justify-center items-center py-3 px-3 bg-gold rounded-xl"
                  >
                    <RefreshCw size={12} color="#FFFFFF" />
                    <Text className="text-white font-bold text-[10px] ml-1.5 uppercase">
                      Upgrade (₹14,949)
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Timeline Progress Tracker */}
              <Text className="text-neutral-900 font-bold text-xs mb-4">Registration Timeline</Text>
              
              <View className="pl-4 mb-6">
                {trackerStages.map((stage, idx) => {
                  const isDone = idx <= currentStageIdx;
                  const isCurrent = idx === currentStageIdx;
                  const isLast = idx === trackerStages.length - 1;

                  return (
                    <View key={stage} className="flex-row relative pb-6">
                      {/* Vertical connector line */}
                      {!isLast && (
                        <View 
                          className="absolute w-[2px] left-2.5 top-5 bottom-0 bg-neutral-200"
                          style={{
                            backgroundColor: idx < currentStageIdx ? '#D4AF37' : '#E5E7EB'
                          }}
                        />
                      )}
                      
                      {/* Timeline status indicator node */}
                      <View className="mr-4 z-10">
                        {isDone ? (
                          <View className="w-5.5 h-5.5 rounded-full bg-gold justify-center items-center border-2 border-white">
                            <CheckCircle2 size={12} color="#FFFFFF" />
                          </View>
                        ) : (
                          <View className="w-5.5 h-5.5 rounded-full bg-white justify-center items-center border-2 border-neutral-200">
                            <View className="w-2 h-2 rounded-full bg-neutral-300" />
                          </View>
                        )}
                      </View>

                      {/* Content details */}
                      <View className="flex-1 pt-0.5">
                        <Text className={`text-xs font-bold ${isCurrent ? 'text-gold' : isDone ? 'text-neutral-800' : 'text-gray-400'}`}>
                          {stage}
                        </Text>
                        
                        {isCurrent && (
                          <Text className="text-gray-400 text-[10px] mt-0.5">
                            Our team is currently working on this step.
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Advance Progress Simulation Button (Developer Tool) */}
              <TouchableOpacity
                onPress={() => handleAdvance(booking.id)}
                className="w-full bg-amber-50 border border-gold/15 py-3 rounded-xl flex-row justify-center items-center mt-2"
              >
                <RefreshCw size={12} color="#D4AF37" className="animate-spin mr-1.5" />
                <Text className="text-gold font-bold text-[10px] uppercase tracking-wider">
                  Advance Tracker Stage
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Support Options Section */}
        <View className="bg-neutral-50 rounded-[32px] border border-neutral-150 p-6 mb-12 mt-4">
          <Text className="text-neutral-900 font-extrabold text-sm mb-1">Additional Assistance</Text>
          <Text className="text-gray-400 text-[10px] mb-5 font-semibold">Need help with your booking or have custom requests?</Text>
          
          <TouchableOpacity
            onPress={() => router.push('/lawyers')}
            className="w-full bg-neutral-900 py-3.5 rounded-2xl items-center justify-center shadow-xs"
          >
            <Text className="text-white font-bold text-[10px] uppercase tracking-wider">Consult a Lawyer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Payment Options Selector Sheet */}
      {activeUpgradeBooking && (
        <PaymentOptionsModal
          visible={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setActiveUpgradeBooking(null);
          }}
          bookingId={activeUpgradeBooking.id}
          amount={14949} // Upgrade amount: ₹14,999 - ₹50
          description="Upgrade to Complete Court Marriage Package"
          customerName={user?.displayName || 'LawyerSathi Client'}
          customerEmail={user?.email || 'client@lawyersathi.com'}
          customerPhone={user?.phoneNumber || '+919876543210'}
          onPaymentSuccess={(paymentId) => {
            upgradeBooking(activeUpgradeBooking.id, paymentId);
            alert('Package upgraded successfully to Complete Court Marriage Package!');
            setShowPaymentModal(false);
            setActiveUpgradeBooking(null);
          }}
          onPaymentFailure={(error) => {
            alert(`Upgrade failed: ${error}`);
            setShowPaymentModal(false);
            setActiveUpgradeBooking(null);
          }}
        />
      )}
    </View>
  );
}
