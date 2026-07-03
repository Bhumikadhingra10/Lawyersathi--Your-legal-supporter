import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Check, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react-native';
import { useStore } from '../../store/store';
import PaymentOptionsModal from '../../components/payment-modal';

interface PackageInfo {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: string;
  badge: string;
  tagline: string;
  description: string;
  inclusions: string[];
}

const SERVICE_PACKAGES: Record<string, Record<'consult' | 'full', PackageInfo>> = {
  sub1: {
    consult: {
      id: 'PKG_HINDU_CONSULT',
      name: 'Hindu Marriage Consultation & Slot Booking',
      price: 50,
      originalPrice: 499,
      discount: '90% OFF',
      badge: 'Quick Book',
      tagline: 'Talk to a Hindu Marriage Expert',
      description: 'Book a priority slot to consult with a verified partner advocate. Vedic ceremony verification & document pre-check under Hindu Marriage Act.',
      inclusions: [
        '1-on-1 Consultation Slot',
        'Traditional Ceremony Validation check',
        'Document Pre-Check List',
        'Eligibility Verification'
      ]
    },
    full: {
      id: 'PKG_HINDU_FULL',
      name: 'Hindu Marriage Registration Package',
      price: 6999,
      originalPrice: 9999,
      discount: '30% OFF',
      badge: 'Best Value',
      tagline: 'All-Inclusive Registration',
      description: 'Everything you need from advocate consult to receiving your verified government marriage certificate under the Hindu Marriage Act.',
      inclusions: [
        'Vedic Ceremony/Traditional Marriage validation support',
        'Affidavit drafting for both partners and witnesses',
        'Registrar appointment slot booking',
        'Official marriage certificate document collection and filing support',
        'Partner advocate consultation & representation support'
      ]
    }
  },
  sub2: {
    consult: {
      id: 'PKG_SPECIAL_CONSULT',
      name: 'Special Marriage Consultation & Notice Guidance',
      price: 50,
      originalPrice: 499,
      discount: '90% OFF',
      badge: 'Quick Book',
      tagline: 'Talk to an Inter-Faith Specialist',
      description: 'Book a slot to consult with a verified advocate on notice requirements, objection handling, and timelines under the Special Marriage Act.',
      inclusions: [
        '1-on-1 Consultation Slot',
        'Special Marriage Act Eligibility Check',
        'Notice Period timeline advisory',
        'Document Checklist for Inter-faith couples'
      ]
    },
    full: {
      id: 'PKG_SPECIAL_FULL',
      name: 'Special Marriage Registration Package',
      price: 12499,
      originalPrice: 19999,
      discount: '37% OFF',
      badge: 'Complete Notice Service',
      tagline: 'All-Inclusive Notice & Solemnization',
      description: 'Comprehensive assistance for inter-faith, inter-caste, or non-ceremonial marriages. Covers notice drafting, publication, and registrar solemnization.',
      inclusions: [
        '30-Day Mandatory Notice filing and publication support',
        'Objection handling & resolution advisory',
        'Witness declarations and ID verification',
        'Registrar solemnization coordination and documentation',
        'Advocate representation & coordination on notice day'
      ]
    }
  },
  sub3: {
    consult: {
      id: 'PKG_INTENDED_CONSULT',
      name: 'Intended Marriage Consultation & Slot Booking',
      price: 50,
      originalPrice: 499,
      discount: '90% OFF',
      badge: 'Quick Book',
      tagline: 'Registry Pre-Check',
      description: 'Consult on direct court marriage procedure, joint declarations, and scheduling simultaneous solemnization and registration.',
      inclusions: [
        '1-on-1 Consultation Slot',
        'Joint Declaration form pre-check',
        'Priority Registry layout guidance',
        'Witness checklist & ID verification'
      ]
    },
    full: {
      id: 'PKG_INTENDED_FULL',
      name: 'Intended Marriage Registration Package',
      price: 10999,
      originalPrice: 16999,
      discount: '35% OFF',
      badge: 'Registry Special',
      tagline: 'Simultaneous Court Registry',
      description: 'Simultaneous solemnization and registration under the Special Marriage Act. Excellent for quick registry marriages without heavy ceremonial steps.',
      inclusions: [
        'Simultaneous solemnization and registration layout guidance',
        'Complete drafting of joint declaration forms',
        'Priority slot coordination at the Sub-Registrar Office',
        'Instant certificate status tracking',
        'Advocate assistance for witness formalities'
      ]
    }
  },
  sub4: {
    consult: {
      id: 'PKG_LATE_CONSULT',
      name: 'Late Registration Consultation & Feasibility Check',
      price: 50,
      originalPrice: 499,
      discount: '90% OFF',
      badge: 'Quick Book',
      tagline: 'Historical Marriage Check',
      description: 'Pre-check for marriages occurred more than 5 years ago. Consult on collector petition process and additional proofs required.',
      inclusions: [
        '1-on-1 Consultation Slot',
        'Collector/District Registrar petition feasibility check',
        'Historical proof assessment',
        'Witness and affidavit requirement list'
      ]
    },
    full: {
      id: 'PKG_LATE_FULL',
      name: 'Late Marriage Registration Package',
      price: 14999,
      originalPrice: 24999,
      discount: '40% OFF',
      badge: 'Special Approvals',
      tagline: 'Late Registration Filing',
      description: 'Special legal assistance for registering marriages that occurred more than five years ago, requiring special approvals from the District Registrar or Collector.',
      inclusions: [
        'Collector/District Registrar petition drafting support',
        'Verification documents and historical proof checklists',
        'Liaison with local administrative desk officers',
        'Approved marriage registry execution and certificate recovery',
        'Advocate representation for verification hearings'
      ]
    }
  },
  sub5: {
    consult: {
      id: 'PKG_CERT_CONSULT',
      name: 'Duplicate Certificate Consultation & Record Search',
      price: 50,
      originalPrice: 499,
      discount: '90% OFF',
      badge: 'Quick Book',
      tagline: 'Search Records First',
      description: 'Consult on retrieving duplicate marriage certificates or certified copies from government records, including apostille/attestation options.',
      inclusions: [
        '1-on-1 Consultation Slot',
        'Verification of registrar record location',
        'Duplicate application guidelines',
        'Visa/attestation compatibility check'
      ]
    },
    full: {
      id: 'PKG_CERT_FULL',
      name: 'Duplicate Certificate Issuance Package',
      price: 3499,
      originalPrice: 5999,
      discount: '41% OFF',
      badge: 'Search & Issuance',
      tagline: 'Certified Duplicate Copy Recovery',
      description: 'Assistance in search, extraction, and official issuance of duplicate or certified copies of marriage deeds/certificates from government records.',
      inclusions: [
        'Search application in historical registrar registers',
        'Drafting request letter and official fee challans',
        'Certified duplicate copy extraction',
        'Attestation/Apostille liaison assistance',
        'Courier delivery of physical certified copies to your address'
      ]
    }
  }
};

export default function PackageScreen() {
  const router = useRouter();
  const { serviceId } = useLocalSearchParams<{ serviceId?: string }>();

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [payId, setPayId] = useState('');
  const [activeTab, setActiveTab] = useState<'consult' | 'full'>('full');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [tempBookingId, setTempBookingId] = useState<string | null>(null);
  
  const user = useStore(state => state.user);
  const createBooking = useStore(state => state.createBooking);
  const payBooking = useStore(state => state.payBooking);

  // Resolve active service packages (default to Hindu marriage sub1)
  const serviceKey = serviceId && SERVICE_PACKAGES[serviceId] ? serviceId : 'sub1';
  const packages = SERVICE_PACKAGES[serviceKey];
  const activePackage = packages[activeTab];

  const handleBookNow = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Generate a temporary draft reference (not created in store until payment succeeds)
    const refId = 'DRAFT_' + Math.random().toString(36).substr(2, 5).toUpperCase();
    setTempBookingId(refId);
    setShowPaymentModal(true);
  };

  const handleViewTracker = () => {
    setPaymentSuccess(false);
    router.push('/bookings');
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header bar */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-neutral-100 items-center">
        <Text className="text-neutral-900 font-bold text-lg">Legal Packages & Services</Text>
        <Text className="text-gold font-bold text-[10px] tracking-wider uppercase">Choose Your Start</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {/* Package Selector Tab Segment */}
        <View className="flex-row bg-neutral-100 p-1 rounded-2xl mb-6">
          <TouchableOpacity 
            onPress={() => setActiveTab('full')}
            className={`flex-1 py-3 items-center rounded-xl ${activeTab === 'full' ? 'bg-white shadow-xs' : ''}`}
          >
            <Text className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 'full' ? 'text-neutral-900' : 'text-neutral-450'}`}>
              Full Registration (₹{packages.full.price.toLocaleString()})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('consult')}
            className={`flex-1 py-3 items-center rounded-xl ${activeTab === 'consult' ? 'bg-white shadow-xs' : ''}`}
          >
            <Text className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 'consult' ? 'text-neutral-900' : 'text-neutral-450'}`}>
              Consultation Slot (₹{packages.consult.price.toLocaleString()})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Price Card */}
        <View className="bg-neutral-900 rounded-[28px] p-6 mb-6 relative overflow-hidden">
          {/* Accent Glow */}
          <View className="absolute right-[-40px] top-[-40px] w-24 h-24 rounded-full bg-gold/20" />
          
          <View className="flex-row justify-between items-center mb-4">
            <View className="bg-gold/20 border border-gold/40 px-3 py-1 rounded-full">
              <Text className="text-gold text-[10px] font-bold tracking-wider uppercase">{activePackage.badge}</Text>
            </View>
            <View className="flex-row items-center">
              <Sparkles size={14} color="#D4AF37" />
              <Text className="text-gold text-[11px] font-bold ml-1">{activePackage.tagline}</Text>
            </View>
          </View>

          <Text className="text-white text-2xl font-bold mb-1">
            {activePackage.name}
          </Text>
          <Text className="text-neutral-400 text-xs mb-6 leading-4">
            {activePackage.description}
          </Text>

          {/* Pricing Row */}
          <View className="flex-row items-baseline mb-2">
            <Text className="text-white text-4xl font-extrabold">₹{activePackage.price.toLocaleString()}</Text>
            <Text className="text-neutral-500 text-sm font-semibold line-through ml-2">₹{activePackage.originalPrice.toLocaleString()}</Text>
            <Text className="text-emerald-500 text-xs font-bold ml-2">{activePackage.discount}</Text>
          </View>
          <Text className="text-neutral-400 text-[10px] mb-2">
            {activeTab === 'full' 
              ? '*Includes all government registration charges & advocate fees' 
              : '*Priority support and slot booking confirmation'}
          </Text>
        </View>

        {/* What is Included Checklist */}
        <View className="bg-white rounded-3xl border border-neutral-100 p-5 mb-12 shadow-sm">
          <Text className="text-neutral-900 text-base font-bold mb-4">{"What's Included"}</Text>
          
          {activePackage.inclusions.map((item, idx) => (
            <View key={idx} className="flex-row items-center py-2.5 border-b border-neutral-50">
              <View className="w-5 h-5 bg-amber-50 rounded-full justify-center items-center mr-3">
                <Check size={12} color="#D4AF37" strokeWidth={3} />
              </View>
              <Text className="text-neutral-850 text-xs font-semibold">{item}</Text>
            </View>
          ))}
          
          {/* Trust indicators */}
          <View className="flex-row items-center bg-neutral-50 rounded-xl p-4 mt-6">
            <ShieldCheck size={20} color="#D4AF37" />
            <View className="ml-3 flex-1">
              <Text className="text-neutral-900 font-bold text-xs">
                Verified Partner Advocate
              </Text>
              <Text className="text-gray-500 text-[10px] leading-3.5 mt-0.5">
                {activeTab === 'full' 
                  ? 'Get support from top corporate & family court legal experts verified by LawyerSathi.'
                  : 'Get a priority consultation session with top corporate & family court legal experts.'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Booking CTA Bar */}
      <View className="px-6 py-4 border-t border-neutral-100 bg-white flex-row items-center justify-between">
        <View>
          <Text className="text-gray-400 text-[10px] font-bold uppercase">Total Price</Text>
          <Text className="text-neutral-900 text-xl font-bold">₹{activePackage.price.toLocaleString()}</Text>
        </View>
        
        <TouchableOpacity
          onPress={handleBookNow}
          className="bg-gold rounded-full px-8 py-3.5 flex-row justify-center items-center"
          style={{
            shadowColor: '#D4AF37',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4
          }}
        >
          <Text className="text-white font-bold text-sm tracking-wider uppercase mr-1">
            Book Package
          </Text>
          <ChevronRight size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        visible={paymentSuccess}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPaymentSuccess(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[40px] p-8 items-center border border-neutral-100">
            <View className="w-16 h-16 bg-amber-50 rounded-full justify-center items-center mb-4 border border-gold/20">
              <Sparkles size={32} color="#D4AF37" />
            </View>
            <Text className="text-neutral-900 font-bold text-2xl mb-1 text-center">Booking Confirmed!</Text>
            <Text className="text-emerald-600 font-bold text-xs mb-4">Payment Verified Successfully</Text>
            
            <View className="bg-neutral-50 rounded-2xl w-full p-4 mb-6 border border-neutral-150">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500 text-xs font-medium">Payment ID</Text>
                <Text className="text-neutral-800 text-xs font-bold">{payId}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500 text-xs font-medium">Package</Text>
                <Text className="text-neutral-800 text-xs font-bold text-right w-[60%]">{activePackage.name}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-xs font-medium">Amount Paid</Text>
                <Text className="text-neutral-800 text-xs font-extrabold">₹{activePackage.price.toLocaleString()}</Text>
              </View>
            </View>
            
            <Text className="text-gray-400 text-[10px] text-center mb-6 leading-4">
              {activeTab === 'full' 
                ? 'Your dedicated advocate is preparing the marriage files. Proceed to upload Aadhaar and address proofs to begin.'
                : 'Your advocate consultation slot is booked successfully. Proceed to bookings page to view status & timeline.'}
            </Text>

            <TouchableOpacity
              onPress={handleViewTracker}
              className="w-full bg-neutral-900 rounded-full py-4 items-center mb-3"
            >
              <Text className="text-white font-bold text-sm">
                {activeTab === 'full' ? 'Upload Documents Now' : 'View Booking Status'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment Options Selector Sheet */}
      {tempBookingId && (
        <PaymentOptionsModal
          visible={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setTempBookingId(null);
          }}
          bookingId={tempBookingId}
          amount={activePackage.price}
          description={activePackage.name}
          customerName={user?.displayName || 'LawyerSathi Client'}
          customerEmail={user?.email || 'client@lawyersathi.com'}
          customerPhone={user?.phoneNumber || '+919876543210'}
          onPaymentSuccess={(paymentId) => {
            // Confirm/create the booking only after payment succeeds
            const realBookingId = createBooking(activePackage.name, activePackage.price);
            payBooking(realBookingId, paymentId);
            setPayId(paymentId);
            setPaymentSuccess(true);
            setShowPaymentModal(false);
            setTempBookingId(null);
          }}
          onPaymentFailure={(error) => {
            alert(`Payment failed: ${error}`);
            setShowPaymentModal(false);
            setTempBookingId(null);
          }}
        />
      )}
    </View>
  );
}
