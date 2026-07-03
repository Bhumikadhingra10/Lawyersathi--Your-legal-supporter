import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ShieldCheck, UserCheck, Zap, ArrowRight } from 'lucide-react-native';
import { useStore } from '../store/store';

const IMAGES = [
  require('../../assets/images/couple_slide_1.jpg'),
  require('../../assets/images/couple_slide_2.jpg'),
  require('../../assets/images/couple_slide_3.jpg'),
  require('../../assets/images/couple_slide_4.jpg'),
];

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const logout = useStore(state => state.logout);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [currentImageIndex]);

  const handleGetStarted = () => {
    router.replace('/login');
  };

  const handleSkip = async () => {
    await logout();
    router.replace('/(tabs)');
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}>
      {/* Top Header/Brand Section with Banner Image covering full top */}
      <View style={{ width: width, aspectRatio: 1020 / 339, position: 'relative' }}>
        <Image
          source={require('../../assets/images/logo_banner.png')}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
        
        {/* Skip button overlay */}
        <TouchableOpacity 
          onPress={handleSkip}
          style={{ 
            position: 'absolute', 
            top: 50, 
            right: 24, 
            zIndex: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.45)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 99
          }}
        >
          <Text className="text-[#6D5218] font-bold text-xs">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Center Illustration & Interactive Dots */}
      <View className="items-center my-3">
        <Image
          source={IMAGES[currentImageIndex]}
          style={{ width: width * 0.63, height: width * 0.42 }}
          contentFit="cover"
          transition={1000}
        />
        
        {/* Page Indicator (Interactive Dots) */}
        <View className="flex-row justify-center items-center gap-1.5 mt-3">
          {IMAGES.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentImageIndex(index)}
              style={{ padding: 6 }}
            >
              <View 
                className={`rounded-full ${
                  currentImageIndex === index 
                    ? 'w-2.5 h-2.5 bg-gold' 
                    : 'w-2 h-2 bg-amber-100 border border-amber-200/40'
                }`}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Core Copy */}
      <View className="items-center px-8 mt-4">
        <Text className="text-neutral-900 text-2xl font-bold text-center leading-8">
          Your Marriage,
        </Text>
        <Text className="text-[#6D5218] text-2.5xl font-bold text-center leading-8 mb-2">
          Our Responsibility
        </Text>
        <Text className="text-neutral-600 text-sm text-center font-medium leading-5 px-4">
          Complete marriage registration with ease, trust and transparency.
        </Text>
      </View>

      {/* Feature Badges Row */}
      <View className="flex-row justify-around items-center px-4 mt-6">
        <View className="items-center w-1/3 px-2">
          <View className="w-10 h-10 bg-amber-50 rounded-full justify-center items-center mb-1">
            <ShieldCheck size={20} color="#D4AF37" />
          </View>
          <Text className="text-neutral-800 text-[10px] font-bold text-center">
            100% Legal & Secure
          </Text>
        </View>

        <View className="items-center w-1/3 px-2">
          <View className="w-10 h-10 bg-amber-50 rounded-full justify-center items-center mb-1">
            <UserCheck size={20} color="#D4AF37" />
          </View>
          <Text className="text-neutral-800 text-[10px] font-bold text-center">
            Expert Advocates
          </Text>
        </View>

        <View className="items-center w-1/3 px-2">
          <View className="w-10 h-10 bg-amber-50 rounded-full justify-center items-center mb-1">
            <Zap size={20} color="#D4AF37" />
          </View>
          <Text className="text-neutral-800 text-[10px] font-bold text-center">
            Fast & Hassle-Free
          </Text>
        </View>
      </View>

      {/* Spacer to replace original dot indicators layout */}
      <View className="mt-4" />

      {/* CTA Button */}
      <View className="px-6 pb-10">
        <TouchableOpacity 
          onPress={handleGetStarted}
          className="w-full bg-gold rounded-full py-4 flex-row justify-center items-center"
          style={{
            shadowColor: '#D4AF37',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4
          }}
        >
          <Text className="text-white font-bold text-sm tracking-wider mr-2 uppercase">
            Get Started
          </Text>
          <ArrowRight size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
