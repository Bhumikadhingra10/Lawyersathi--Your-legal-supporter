import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Check, AlertCircle, Briefcase, Landmark } from 'lucide-react-native';
import { useStore } from '../store/store';

const SPECIALIZATIONS = [
  'Marriage Registration',
  'Family Dispute',
  'Property Registration',
  'Corporate Law',
  'Criminal Defense',
  'Civil Litigation'
];



const SDM_OFFICES = [
  'All SDM Offices',
  'SDM Alipur',
  'SDM Model Town',
  'SDM Saket',
  'SDM Mehrauli',
  'SDM Gandhi Nagar',
  'SDM Preet Vihar',
  'SDM Rajouri Garden',
  'SDM Punjabi Bagh',
  'SDM Karol Bagh',
  'SDM Civil Lines',
  'SDM New Delhi (HQ)',
  'SDM Chanakyapuri',
  'SDM Dwarka',
  'SDM Najafgarh',
  'SDM Karawal Nagar',
  'SDM Yamuna Vihar',
  'SDM Rohini',
  'SDM Saraswati Vihar',
  'SDM Defence Colony',
  'SDM Kalkaji',
  'SDM Shahdara',
  'SDM Vivek Vihar'
];

const GENDERS = ['Male', 'Female', 'Other'];

export default function LawyerRegistrationScreen() {
  const router = useRouter();
  const addLawyerApplication = useStore(state => state.addLawyerApplication);

  // Form State
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);

  const [selectedSDMOffices, setSelectedSDMOffices] = useState<string[]>([]);

  // Validation & Modal State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);



  const toggleSpecialization = (spec: string) => {
    if (selectedSpecs.includes(spec)) {
      setSelectedSpecs(selectedSpecs.filter(s => s !== spec));
    } else {
      setSelectedSpecs([...selectedSpecs, spec]);
    }
  };



  const toggleSDMOffice = (sdm: string) => {
    if (sdm === 'All SDM Offices') {
      if (selectedSDMOffices.includes('All SDM Offices')) {
        setSelectedSDMOffices([]);
      } else {
        setSelectedSDMOffices([...SDM_OFFICES]);
      }
    } else {
      let updated = [...selectedSDMOffices];
      if (updated.includes(sdm)) {
        updated = updated.filter(s => s !== sdm);
        updated = updated.filter(s => s !== 'All SDM Offices');
      } else {
        updated.push(sdm);
        const specificSDMs = SDM_OFFICES.filter(s => s !== 'All SDM Offices');
        const hasAllSpecific = specificSDMs.every(s => updated.includes(s));
        if (hasAllSpecific) {
          updated.push('All SDM Offices');
        }
      }
      setSelectedSDMOffices(updated);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Full Name is required';
    if (!gender) newErrors.gender = 'Gender selection is required';
    
    // Simple Email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!phone.trim()) {
      newErrors.phone = 'Phone Number is required';
    } else if (phone.trim().length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!experience.trim()) newErrors.experience = 'Years of Experience is required';



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      addLawyerApplication({
        name,
        gender,
        email,
        phone,
        experience,
        selectedSpecs,
        selectedSDMOffices,
        documents: [],
        appliedAt: new Date().toISOString()
      });
      setShowSuccessModal(true);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-neutral-100 flex-row items-center">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mr-4 p-2 bg-neutral-50 rounded-full border border-neutral-150"
        >
          <ChevronLeft size={16} color="#111111" />
        </TouchableOpacity>
        <View>
          <Text className="text-neutral-900 font-extrabold text-base">Join Advocate Network</Text>
          <Text className="text-gold font-bold text-[9px] uppercase tracking-wider">Partner with LawyerSathi</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View className="bg-[#FAF7EE] border border-gold/15 rounded-3xl p-5 mb-6 flex-row items-center">
          <View className="w-12 h-12 bg-white rounded-2xl justify-center items-center mr-4 shadow-sm border border-gold/10">
            <Briefcase size={22} color="#D4AF37" />
          </View>
          <View className="flex-1">
            <Text className="text-neutral-900 font-bold text-xs">Grow Your Legal Practice</Text>
            <Text className="text-gray-500 text-[10px] leading-3.5 mt-0.5 font-medium">
              Complete your registration profile below.
            </Text>
          </View>
        </View>

        {/* Name Input */}
        <View className="mb-4">
          <Text className="text-neutral-900 font-extrabold text-[10px] uppercase tracking-wider mb-2 text-gold">Full Name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Adv. Amit Sharma"
            placeholderTextColor="#9CA3AF"
            className={`w-full bg-neutral-50 border ${errors.name ? 'border-red-400' : 'border-neutral-200'} rounded-2xl px-4 py-3 text-neutral-800 text-xs font-semibold`}
          />
          {errors.name && (
            <View className="flex-row items-center mt-1 ml-1">
              <AlertCircle size={10} color="#EF4444" />
              <Text className="text-red-500 text-[9px] font-bold ml-1">{errors.name}</Text>
            </View>
          )}
        </View>

        {/* Gender Selection */}
        <View className="mb-4">
          <Text className="text-neutral-900 font-extrabold text-[10px] uppercase tracking-wider mb-2 text-gold">Gender *</Text>
          <View className="flex-row gap-2">
            {GENDERS.map(g => {
              const isSelected = gender === g;
              return (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGender(g)}
                  className={`flex-1 py-3.5 rounded-2xl border items-center justify-center ${isSelected ? 'bg-neutral-900 border-neutral-900' : 'bg-neutral-50 border-neutral-200'}`}
                >
                  <Text className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-neutral-600'}`}>{g}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.gender && (
            <View className="flex-row items-center mt-1 ml-1">
              <AlertCircle size={10} color="#EF4444" />
              <Text className="text-red-500 text-[9px] font-bold ml-1">{errors.gender}</Text>
            </View>
          )}
        </View>

        {/* Email Address */}
        <View className="mb-4">
          <Text className="text-neutral-900 font-extrabold text-[10px] uppercase tracking-wider mb-2 text-gold">Email ID *</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="e.g. amit.sharma@example.com"
            placeholderTextColor="#9CA3AF"
            className={`w-full bg-neutral-50 border ${errors.email ? 'border-red-400' : 'border-neutral-200'} rounded-2xl px-4 py-3 text-neutral-800 text-xs font-semibold`}
          />
          {errors.email && (
            <View className="flex-row items-center mt-1 ml-1">
              <AlertCircle size={10} color="#EF4444" />
              <Text className="text-red-500 text-[9px] font-bold ml-1">{errors.email}</Text>
            </View>
          )}
        </View>

        {/* Phone Number */}
        <View className="mb-4">
          <Text className="text-neutral-900 font-extrabold text-[10px] uppercase tracking-wider mb-2 text-gold">Phone No. *</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
            placeholder="e.g. 9876543210"
            placeholderTextColor="#9CA3AF"
            className={`w-full bg-neutral-50 border ${errors.phone ? 'border-red-400' : 'border-neutral-200'} rounded-2xl px-4 py-3 text-neutral-800 text-xs font-semibold`}
          />
          {errors.phone && (
            <View className="flex-row items-center mt-1 ml-1">
              <AlertCircle size={10} color="#EF4444" />
              <Text className="text-red-500 text-[9px] font-bold ml-1">{errors.phone}</Text>
            </View>
          )}
        </View>


        {/* Experience in Years */}
        <View className="mb-4">
          <Text className="text-neutral-900 font-extrabold text-[10px] uppercase tracking-wider mb-2 text-gold">Years of Experience *</Text>
          <TextInput
            value={experience}
            onChangeText={setExperience}
            keyboardType="numeric"
            placeholder="e.g. 5"
            placeholderTextColor="#9CA3AF"
            className={`w-full bg-neutral-50 border ${errors.experience ? 'border-red-400' : 'border-neutral-200'} rounded-2xl px-4 py-3 text-neutral-800 text-xs font-semibold`}
          />
          {errors.experience && (
            <View className="flex-row items-center mt-1 ml-1">
              <AlertCircle size={10} color="#EF4444" />
              <Text className="text-red-500 text-[9px] font-bold ml-1">{errors.experience}</Text>
            </View>
          )}
        </View>

        {/* Primary Practice Specializations */}
        <View className="mb-4">
          <Text className="text-neutral-900 font-extrabold text-[10px] uppercase tracking-wider mb-2.5 text-gold">Specializations</Text>
          <View className="flex-row flex-wrap gap-2">
            {SPECIALIZATIONS.map(spec => {
              const isSelected = selectedSpecs.includes(spec);
              return (
                <TouchableOpacity
                  key={spec}
                  onPress={() => toggleSpecialization(spec)}
                  className={`py-2 px-3.5 rounded-full border ${isSelected ? 'bg-gold border-gold' : 'bg-neutral-50 border-neutral-200'}`}
                >
                  <Text className={`font-bold text-[10px] ${isSelected ? 'text-white' : 'text-neutral-600'}`}>{spec}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>



        {/* Preferred SDM Offices Checklist */}
        <View className="mb-12">
          <Text className="text-neutral-900 font-extrabold text-[10px] uppercase tracking-wider mb-2.5 text-gold">Preferred SDM Offices in Delhi</Text>
          <View className="bg-neutral-50 rounded-3xl p-4 border border-neutral-200" style={{ maxHeight: 220 }}>
            <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
              {SDM_OFFICES.map((sdm, index) => {
                const isSelected = selectedSDMOffices.includes(sdm);
                return (
                  <View key={sdm}>
                    {index > 0 && <View className="w-full h-[1px] bg-neutral-200/55 my-2.5" />}
                    <TouchableOpacity
                      onPress={() => toggleSDMOffice(sdm)}
                      className="flex-row items-center py-0.5"
                    >
                      <View className={`w-5 h-5 rounded-md border justify-center items-center mr-3 ${isSelected ? 'bg-neutral-900 border-neutral-900' : 'bg-white border-neutral-350'}`}>
                        {isSelected && <Check size={10} color="#FFFFFF" strokeWidth={3} />}
                      </View>
                      <View className="flex-1 flex-row items-center">
                        <Landmark size={12} color={isSelected ? '#111111' : '#9CA3AF'} className="mr-2" />
                        <Text className={`font-bold text-xs ${isSelected ? 'text-neutral-900' : 'text-neutral-600'}`}>{sdm}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Action Footer */}
      <View className="px-6 py-4 border-t border-neutral-100 bg-white">
        <TouchableOpacity
          onPress={handleSubmit}
          className="w-full bg-neutral-900 py-3.5 rounded-full items-center justify-center shadow-xs"
        >
          <Text className="text-white font-bold text-xs uppercase tracking-wider">Submit Application</Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white w-full rounded-[36px] p-6 border border-neutral-100 shadow-md items-center">
            {/* Checked Icon */}
            <View className="w-16 h-16 bg-emerald-50 rounded-full justify-center items-center mb-5 border border-emerald-100 shadow-xs">
              <Check size={28} color="#10B981" strokeWidth={3.5} />
            </View>
            
            <Text className="text-neutral-900 font-extrabold text-base text-center">Application Submitted!</Text>
            
            <Text className="text-gray-400 text-[10px] text-center mt-2.5 px-4 leading-4.5 font-medium">
              Thank you for registering. Our vetting committee will review your profile details. You will receive updates via email and phone.
            </Text>

            <TouchableOpacity
              onPress={() => {
                setShowSuccessModal(false);
                router.replace('/(tabs)/home');
              }}
              className="w-full bg-neutral-900 py-3.5 rounded-full items-center justify-center mt-6 shadow-xs"
            >
              <Text className="text-white font-bold text-xs uppercase tracking-wider">Go to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
