import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  Briefcase, 
  Flame, 
  FileText, 
  Building2, 
  Files,
  Compass,
  MessageSquare,
  Scale
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Shared metadata for sub-services matching the home screen
const SUB_SERVICES: Record<string, {
  id: string;
  title: string;
  icon: any;
  desc: string;
  longDesc: string;
  inclusions: string[];
}> = {
  sub1: {
    id: 'sub1',
    title: 'Hindu Marriage Registration',
    icon: Flame,
    desc: 'For Hindu, Buddhist, Jain, or Sikh couples',
    longDesc: 'For couples where both parties are Hindu, Buddhist, Jain, or Sikh. This service handles marriages solemnized through traditional Vedic or religious ceremonies, as well as post-facto registration of existing marriages under the Hindu Marriage Act.',
    inclusions: [
      'Vedic Ceremony/Traditional Marriage validation support',
      'Affidavit drafting for both partners and witnesses',
      'Registrar appointment slot booking',
      'Official marriage certificate document collection and filing support'
    ]
  },
  sub2: {
    id: 'sub2',
    title: 'Special Marriage Registration',
    icon: FileText,
    desc: 'For inter-faith or Christian/Muslim couples',
    longDesc: 'For couples where one or both parties belong to different religions or specific personal law categories (e.g., Christian or Muslim). This service handles the legal notice period, objections, and final solemnization under the Special Marriage Act.',
    inclusions: [
      '30-Day Mandatory Notice filing and publication support',
      'Objection handling & resolution advisory',
      'Witness declarations and ID verification',
      'Registrar solemnization coordination and documentation'
    ]
  },
  sub3: {
    id: 'sub3',
    title: 'Intended Marriage Registration',
    icon: Building2,
    desc: 'Solemnize & register simultaneously',
    longDesc: 'For couples wishing to solemnize their marriage and register it simultaneously in the presence of a Sub-Registrar. Excellent for quick registry marriages without heavy ceremonial steps.',
    inclusions: [
      'Simultaneous solemnization and registration layout guidance',
      'Complete drafting of joint declaration forms',
      'Priority slot coordination at the Sub-Registrar Office',
      'Instant certificate status tracking'
    ]
  },
  sub4: {
    id: 'sub4',
    title: 'Late Registration',
    icon: ShieldCheck,
    desc: 'For marriages occurred > 5 years prior',
    longDesc: 'For couples whose marriage took place more than five years ago and was never officially registered. This path requires special approvals from higher authorities (District Registrar/Collector).',
    inclusions: [
      'Collector/District Registrar petition drafting support',
      'Verification documents and historical proof checklists',
      'Liaison with local administrative desk officers',
      'Approved marriage registry execution and certificate recovery'
    ]
  },
  sub5: {
    id: 'sub5',
    title: 'Certificate Issuance',
    icon: Files,
    desc: 'Provision of certified copies',
    longDesc: 'Provision of certified copies of the registered marriage deed or certificate. Perfect for couples who lost their original certificate or require multiple official copies for visa, passport, or joint financial work.',
    inclusions: [
      'Search application in historical registrar registers',
      'Drafting request letter and official fee challans',
      'Certified duplicate copy extraction',
      'Attestation/Apostille liaison assistance'
    ]
  }
};

export default function ServiceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  
  // Default to Hindu marriage if no valid id is passed
  const serviceKey = id && SUB_SERVICES[id] ? id : 'sub1';
  const service = SUB_SERVICES[serviceKey];
  const IconComponent = service.icon;

  const handleContactLawyer = () => {
    // Navigate to the lawyers list tab
    router.push('/lawyers');
  };

  const handleBookPackage = () => {
    // Navigate to the package booking tab with selected service ID
    router.push({
      pathname: '/package',
      params: { serviceId: serviceKey }
    });
  };

  return (
    <View className="flex-1 bg-[#F8F5EF]">
      {/* Header bar */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-neutral-100 flex-row items-center justify-between">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-9 h-9 bg-neutral-50 rounded-full justify-center items-center border border-neutral-150"
        >
          <ArrowLeft size={16} color="#111111" />
        </TouchableOpacity>
        <Text className="text-neutral-900 font-extrabold text-sm text-center flex-1 pr-9">Service Details</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-5" showsVerticalScrollIndicator={false}>
        {/* Service Core Info Header Card */}
        <View className="bg-white rounded-[28px] border border-neutral-150 p-5 shadow-xs items-center mb-6">
          <View className="w-12 h-12 bg-amber-50 rounded-2xl justify-center items-center mb-3 border border-gold/10">
            <IconComponent size={28} color="#B8860B" strokeWidth={2.3} />
          </View>
          <Text className="text-neutral-900 font-extrabold text-base text-center">{service.title}</Text>
          <Text className="text-gold text-[9px] font-bold uppercase tracking-wider mt-1">Government Approved Registry</Text>
          
          <View className="w-full h-[1px] bg-neutral-100 my-4" />
          
          <Text className="text-neutral-600 text-xs font-semibold leading-5 text-center px-2">
            {service.longDesc}
          </Text>
        </View>

        {/* What We Provide List Card */}
        <View className="bg-white rounded-3xl border border-neutral-150 p-5 mb-24 shadow-xs">
          <View className="flex-row items-center mb-4">
            <Scale size={16} color="#D4AF37" />
            <Text className="text-neutral-900 font-extrabold text-[10px] uppercase tracking-wider ml-2 text-gold">
              What We Provide Under This Service
            </Text>
          </View>

          {service.inclusions.map((item, idx) => (
            <View key={idx} className="flex-row items-start py-3 border-b border-neutral-50 last:border-b-0">
              <View className="w-5 h-5 bg-amber-50 rounded-full justify-center items-center mr-3.5 mt-0.5 border border-gold/10">
                <Check size={10} color="#D4AF37" strokeWidth={3} />
              </View>
              <View className="flex-1">
                <Text className="text-neutral-850 font-bold text-xs leading-4">{item}</Text>
              </View>
            </View>
          ))}

          {/* Guarantee Section */}
          <View className="flex-row items-center bg-neutral-50 rounded-xl p-3.5 mt-5 border border-neutral-150">
            <ShieldCheck size={18} color="#D4AF37" />
            <View className="ml-3 flex-1">
              <Text className="text-neutral-900 font-extrabold text-[10px] uppercase tracking-wide">100% Verified Partners</Text>
              <Text className="text-gray-500 text-[9px] font-medium leading-3 mt-0.5">
                All legal consultations and drafts are coordinated with bar-certified partner advocates.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Action CTA Buttons at the Bottom */}
      <View className="bg-white border-t border-neutral-100 p-6 flex-row gap-3 absolute bottom-0 left-0 right-0">
        <TouchableOpacity 
          onPress={handleContactLawyer}
          className="flex-1 border border-gold bg-amber-50/10 rounded-2xl py-3.5 items-center justify-center flex-row"
        >
          <MessageSquare size={14} color="#6D5218" className="mr-1.5" />
          <Text className="text-[#6D5218] font-extrabold text-xs">Contact Lawyer</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleBookPackage}
          className="flex-1 bg-[#D4AF37] rounded-2xl py-3.5 items-center justify-center flex-row shadow-xs"
          style={{
            shadowColor: '#D4AF37',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Briefcase size={14} color="#FFFFFF" className="mr-1.5" />
          <Text className="text-white font-extrabold text-xs">Book Package</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
