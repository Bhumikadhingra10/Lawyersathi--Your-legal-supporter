import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { ChevronLeft, KeyRound } from 'lucide-react-native';
import { useStore } from '../../store/store';
import { firebaseAuth } from '../../services/firebase';

const { width } = Dimensions.get('window');

export default function OTPScreen() {
  const router = useRouter();
  const { phone, name, gender } = useLocalSearchParams<{ phone: string; name: string; gender: string }>();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);

  const verifyOTPStore = useStore(state => state.verifyOTP);
  
  // Dynamic secure verification code
  const [currentOTP, setCurrentOTP] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResendSMS = () => {
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    setCurrentOTP(newOTP);
  };

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { otp: '' }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setErrorMsg(null);
    if (data.otp !== currentOTP) {
      setErrorMsg('Invalid verification code. Please check the code displayed on screen.');
      setLoading(false);
      return;
    }
    try {
      const res = await firebaseAuth.verifyPhoneOTP('mock-verification-id', data.otp);
      await verifyOTPStore(data.otp, name, gender, phone);
      router.replace('/home');
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await firebaseAuth.sendPhoneOTP(phone || '');
      const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
      setCurrentOTP(newOTP);
      setTimer(30);
    } catch (err: any) {
      setErrorMsg('Failed to resend OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>

      <View className="px-6 pt-12">
        {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} className="flex-row items-center py-2 mb-6">
        <ChevronLeft size={20} color="#111111" />
        <Text className="text-neutral-900 font-semibold text-sm ml-1">Back</Text>
      </TouchableOpacity>

      <View className="items-center mb-8">
        <Image
          source={require('../../../assets/images/logo_banner.png')}
          style={{ width: width - 48, aspectRatio: 1020 / 339 }}
          contentFit="contain"
        />
        <Text className="text-neutral-900 text-2xl font-bold text-center mt-6">Verify Mobile Number</Text>
        <Text className="text-gray-505 text-xs text-center mt-2 px-8 leading-4">
          We have sent a secure 6-digit verification code to your registered mobile number <Text className="font-bold text-neutral-850">{phone || '+91 98765 43210'}</Text>.
        </Text>
      </View>

      <View className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm mb-6">
        {/* Dynamic Secure OTP Info Box */}
        <View className="bg-amber-50/50 border border-gold/15 p-4 rounded-2xl mb-5 flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-amber-800 text-[9px] font-extrabold uppercase tracking-wider">Verification Code</Text>
            <Text className="text-gray-450 text-[9px] mt-0.5 leading-3">Use this code to verify your mobile number session.</Text>
          </View>
          <View className="bg-neutral-950 px-4 py-2 rounded-xl border border-neutral-800">
            <Text className="text-gold font-extrabold text-sm tracking-wider">{currentOTP}</Text>
          </View>
        </View>

        {errorMsg && (
          <View className="bg-red-50 p-3 rounded-xl mb-4">
            <Text className="text-red-600 text-xs font-medium text-center">{errorMsg}</Text>
          </View>
        )}

        <Text className="text-neutral-800 text-xs font-bold mb-2 ml-1">6-Digit Verification Code</Text>
        <View className="flex-row items-center bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-3.5 mb-4">
          <KeyRound size={18} color="#9CA3AF" />
          <Controller
            control={control}
            name="otp"
            rules={{
              required: 'OTP code is required',
              pattern: { value: /^[0-9]{6}$/, message: 'OTP must be exactly 6 digits' }
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                onChangeText={onChange}
                value={value}
                placeholder="Enter 6-digit code"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                maxLength={6}
                className="flex-1 ml-3 text-neutral-800 font-bold text-base tracking-widest p-0"
              />
            )}
          />
        </View>
        {errors.otp && <Text className="text-red-500 text-[10px] font-bold ml-1 mb-4">{errors.otp.message}</Text>}

        {/* Resend and Actions */}
        <View className="flex-row justify-between items-center mb-6 px-1">
          <Text className="text-gray-500 text-xs font-medium">{"Didn't receive code?"}</Text>
          <TouchableOpacity onPress={handleResendSMS}>
            <Text className="text-gold font-bold text-xs">Resend Verification Code</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          className="w-full bg-gold rounded-xl py-3.5 flex-row justify-center items-center"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text className="text-white font-bold text-sm tracking-wider uppercase">
              Verify & Proceed
            </Text>
          )}
        </TouchableOpacity>
      </View>
      
      <View className="mb-4" />
      </View>
    </ScrollView>
  );
}
