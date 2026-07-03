import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Info } from 'lucide-react-native';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-neutral-100 flex-row items-center">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mr-4 p-2 bg-neutral-50 rounded-full border border-neutral-150"
        >
          <ChevronLeft size={16} color="#111111" />
        </TouchableOpacity>
        <View>
          <Text className="text-neutral-900 font-extrabold text-base">About LawyerSathi</Text>
          <Text className="text-gold font-bold text-[9px] uppercase tracking-wider">Advocate Partner Network</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-6 pt-6" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Title / Description */}
        <View className="items-center mb-6">
          <View className="w-12 h-12 bg-amber-50 rounded-2xl justify-center items-center mb-3 border border-gold/20 shadow-sm">
            <Info size={24} color="#D4AF37" />
          </View>
          <Text className="text-neutral-900 font-extrabold text-lg text-center">About Our Platform</Text>
          <Text className="text-gold font-bold text-[10px] tracking-wider uppercase mt-1">Your Trusted Marriage Registration Partner</Text>
        </View>

        {/* Brief Summary */}
        <Text className="text-neutral-700 text-xs leading-5 text-center px-4 mb-8 font-medium">
          LawyerSathi is a premier legal services network that simplifies marriage registration in Delhi NCR. By partnering with vetted, highly experienced advocates, we handle the complex paperwork, verification, and registrar scheduling so you can focus on your special day.
        </Text>

        {/* Workflow - How It Works */}
        <Text className="text-neutral-900 font-extrabold text-xs uppercase tracking-wider mb-4 text-gold">How LawyerSathi Works</Text>
        
        <View className="mb-8">
          {/* Step 1 */}
          <View className="flex-row mb-5">
            <View className="w-7 h-7 rounded-full bg-neutral-950 items-center justify-center mr-3.5 shadow-sm">
              <Text className="text-white text-xs font-bold">1</Text>
            </View>
            <View className="flex-1">
              <Text className="text-neutral-900 font-bold text-xs">Choose & Book Package</Text>
              <Text className="text-gray-500 text-[10px] leading-4 mt-0.5 font-medium">
                Select our all-inclusive marriage package and pay the fees securely via Razorpay.
              </Text>
            </View>
          </View>

          {/* Step 2 */}
          <View className="flex-row mb-5">
            <View className="w-7 h-7 rounded-full bg-neutral-950 items-center justify-center mr-3.5 shadow-sm">
              <Text className="text-white text-xs font-bold">2</Text>
            </View>
            <View className="flex-1">
              <Text className="text-neutral-900 font-bold text-xs">Upload Required Documents</Text>
              <Text className="text-gray-500 text-[10px] leading-4 mt-0.5 font-medium">
                Submit identity, address, and age proofs for both bride and groom directly in the app.
              </Text>
            </View>
          </View>

          {/* Step 3 */}
          <View className="flex-row mb-5">
            <View className="w-7 h-7 rounded-full bg-neutral-950 items-center justify-center mr-3.5 shadow-sm">
              <Text className="text-white text-xs font-bold">3</Text>
            </View>
            <View className="flex-1">
              <Text className="text-neutral-900 font-bold text-xs">Advocate Vetting & File Prep</Text>
              <Text className="text-gray-500 text-[10px] leading-4 mt-0.5 font-medium">
                Our partner advocate verifies your documents and prepares the legal files and declarations.
              </Text>
            </View>
          </View>

          {/* Step 4 */}
          <View className="flex-row mb-5">
            <View className="w-7 h-7 rounded-full bg-neutral-950 items-center justify-center mr-3.5 shadow-sm">
              <Text className="text-white text-xs font-bold">4</Text>
            </View>
            <View className="flex-1">
              <Text className="text-neutral-900 font-bold text-xs">SDM Office Appointment</Text>
              <Text className="text-gray-500 text-[10px] leading-4 mt-0.5 font-medium">
                Your appointment slot is scheduled at the Registrar/SDM office under the applicable Act.
              </Text>
            </View>
          </View>

          {/* Step 5 */}
          <View className="flex-row mb-1">
            <View className="w-7 h-7 rounded-full bg-neutral-950 items-center justify-center mr-3.5 shadow-sm">
              <Text className="text-white text-xs font-bold">5</Text>
            </View>
            <View className="flex-1">
              <Text className="text-neutral-900 font-bold text-xs">Receive Marriage Certificate</Text>
              <Text className="text-gray-500 text-[10px] leading-4 mt-0.5 font-medium">
                Visit the SDM office with our advocate, complete quick physical verification, and collect your government certificate.
              </Text>
            </View>
          </View>
        </View>

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-full bg-neutral-900 rounded-full py-4 items-center shadow-md mt-4"
        >
          <Text className="text-white font-bold text-xs uppercase tracking-wider">Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
