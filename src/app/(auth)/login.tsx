import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, Modal, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Phone, Mail, Lock, Globe, ArrowRight, ShieldCheck, User } from 'lucide-react-native';
import { useStore } from '../../store/store';

const { width } = Dimensions.get('window');
import { firebaseAuth } from '../../services/firebase';

export default function LoginScreen() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const loginWithEmail = useStore(state => state.loginWithEmail);
  const loginWithPhone = useStore(state => state.loginWithPhone);

  const { control, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      phone: '',
      name: '',
      gender: '',
      email: '',
      password: ''
    }
  });

  const phoneVal = watch('phone');
  const nameVal = watch('name');
  const genderVal = watch('gender');

  // Auto-submit and direct to OTP screen when phone number, name, and gender are complete
  useEffect(() => {
    if (
      authMode === 'phone' &&
      phoneVal && phoneVal.trim().length === 10 &&
      nameVal && nameVal.trim().length > 0 &&
      genderVal
    ) {
      const timer = setTimeout(() => {
        handleSubmit(onSubmit)();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [phoneVal, nameVal, genderVal, authMode]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setAuthError(null);
    try {
      if (authMode === 'phone') {
        const cleanedPhone = data.phone.trim();
        if (!cleanedPhone) throw new Error('Phone number is required');
        await firebaseAuth.sendPhoneOTP(cleanedPhone);
        await loginWithPhone(cleanedPhone);
        router.push({
          pathname: '/otp',
          params: {
            phone: cleanedPhone,
            name: data.name.trim(),
            gender: data.gender
          }
        });
      } else {
        await loginWithEmail(data.email, data.email);
        router.replace('/home');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [gmailInput, setGmailInput] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  const handleGoogleSignIn = () => {
    setGmailInput('');
    setModalError(null);
    setShowGoogleModal(true);
  };

  const handleGoogleModalSubmit = async () => {
    if (!gmailInput.trim()) {
      setModalError('Gmail address is required');
      return;
    }
    if (!gmailInput.trim().toLowerCase().endsWith('@gmail.com')) {
      setModalError('Please enter a valid Gmail address (@gmail.com)');
      return;
    }
    setModalError(null);
    setShowGoogleModal(false);
    setLoading(true);
    setAuthError(null);
    try {
      const cleanedEmail = gmailInput.trim().toLowerCase();
      const res = await firebaseAuth.signInWithGoogle(cleanedEmail);
      await useStore.getState().loginWithEmail(res.user.email || cleanedEmail, res.user.email || cleanedEmail);
      router.replace('/home');
    } catch (err: any) {
      setAuthError(err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="bg-amber-50/20 rounded-b-[40px] overflow-hidden pb-6">
        {/* Logo Banner */}
        <Image
          source={require('../../../assets/images/logo_banner.png')}
          style={{ width: width, aspectRatio: 1020 / 339 }}
          contentFit="cover"
        />
        <View className="items-center px-6 mt-4">
          <Text className="text-neutral-900 text-3xl font-bold">Welcome Back</Text>
          <Text className="text-gray-500 text-sm mt-1 text-center">Sign in to manage marriage registration</Text>
        </View>
      </View>

      <View className="px-6 mt-6 flex-1 justify-between">
        <View className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm">
          {/* Mode Switcher Tabs */}
          <View className="flex-row bg-neutral-100 rounded-xl p-1 mb-6">
            <TouchableOpacity
              onPress={() => setAuthMode('phone')}
              className={`flex-1 py-2.5 rounded-lg items-center ${authMode === 'phone' ? 'bg-white shadow-xs' : ''}`}
            >
              <Text className={`text-xs font-bold ${authMode === 'phone' ? 'text-gold' : 'text-gray-500'}`}>Phone No / SMS OTP</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAuthMode('email')}
              className={`flex-1 py-2.5 rounded-lg items-center ${authMode === 'email' ? 'bg-white shadow-xs' : ''}`}
            >
              <Text className={`text-xs font-bold ${authMode === 'email' ? 'text-gold' : 'text-gray-500'}`}>Email</Text>
            </TouchableOpacity>
          </View>

          {authError && (
            <View className="bg-red-50 p-3 rounded-xl mb-4">
              <Text className="text-red-600 text-xs font-medium text-center">{authError}</Text>
            </View>
          )}

          {/* Form Fields */}
          {authMode === 'phone' ? (
            <View>
              {/* Full Name */}
              <Text className="text-neutral-800 text-xs font-bold mb-2 ml-1">Full Name</Text>
              <View className="flex-row items-center bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-3 mb-3">
                <User size={18} color="#9CA3AF" />
                <Controller
                  control={control}
                  name="name"
                  rules={{ required: 'Name is required' }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      onChangeText={onChange}
                      value={value}
                      placeholder="Enter your full name"
                      placeholderTextColor="#9CA3AF"
                      className="flex-1 ml-2 text-neutral-800 font-medium text-sm p-0"
                    />
                  )}
                />
              </View>
              {errors.name && <Text className="text-red-500 text-[10px] font-bold ml-1 mb-2">{errors.name.message}</Text>}

              {/* Phone Number */}
              <Text className="text-neutral-800 text-xs font-bold mb-2 ml-1">Phone Number</Text>
              <View className="flex-row items-center bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-3.5 mb-2">
                <Phone size={18} color="#9CA3AF" />
                <Text className="text-neutral-800 font-semibold text-sm ml-2 mr-1">+91</Text>
                <Controller
                  control={control}
                  name="phone"
                  rules={{
                    required: 'Phone number is required',
                    pattern: { value: /^[0-9]{10}$/, message: 'Enter a valid 10-digit number' }
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      onChangeText={onChange}
                      value={value}
                      placeholder="98765 43210"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                      className="flex-1 ml-1 text-neutral-800 font-medium text-sm p-0"
                    />
                  )}
                />
              </View>
              {errors.phone && <Text className="text-red-500 text-[10px] font-bold ml-1 mb-2">{errors.phone.message}</Text>}

              {/* Gender */}
              <Text className="text-neutral-800 text-xs font-bold mb-2 ml-1">Gender</Text>
              <Controller
                control={control}
                name="gender"
                rules={{ required: 'Gender is required' }}
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row gap-3 mb-3">
                    <TouchableOpacity
                      onPress={() => onChange('Male')}
                      className={`flex-1 py-3 border rounded-xl items-center justify-center flex-row ${
                        value === 'Male' 
                          ? 'bg-amber-50/50 border-gold' 
                          : 'bg-neutral-50 border-neutral-200'
                      }`}
                    >
                      <View className={`w-3.5 h-3.5 rounded-full border mr-2 items-center justify-center ${value === 'Male' ? 'border-gold' : 'border-neutral-350'}`}>
                        {value === 'Male' && <View className="w-2 h-2 rounded-full bg-gold" />}
                      </View>
                      <Text className={`text-sm font-semibold ${value === 'Male' ? 'text-gold' : 'text-neutral-600'}`}>Male</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => onChange('Female')}
                      className={`flex-1 py-3 border rounded-xl items-center justify-center flex-row ${
                        value === 'Female' 
                          ? 'bg-amber-50/50 border-gold' 
                          : 'bg-neutral-50 border-neutral-200'
                      }`}
                    >
                      <View className={`w-3.5 h-3.5 rounded-full border mr-2 items-center justify-center ${value === 'Female' ? 'border-gold' : 'border-neutral-350'}`}>
                        {value === 'Female' && <View className="w-2 h-2 rounded-full bg-gold" />}
                      </View>
                      <Text className={`text-sm font-semibold ${value === 'Female' ? 'text-gold' : 'text-neutral-600'}`}>Female</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.gender && <Text className="text-red-500 text-[10px] font-bold ml-1 mb-2">{errors.gender.message}</Text>}

              <Text className="text-gray-400 text-[10px] ml-1 mb-6">
                We will send a 6-digit OTP code to verify this number.
              </Text>
            </View>
          ) : (
            <View>
              <Text className="text-neutral-800 text-xs font-bold mb-2 ml-1">Email Address</Text>
              <View className="flex-row items-center bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-3.5 mb-4">
                <Mail size={18} color="#9CA3AF" />
                <Controller
                  control={control}
                  name="email"
                  rules={{
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Enter a valid email address' }
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      onChangeText={onChange}
                      value={value}
                      placeholder="name@email.com"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      className="flex-1 ml-2 text-neutral-800 font-medium text-sm p-0"
                    />
                  )}
                />
              </View>
              {errors.email && <Text className="text-red-500 text-[10px] font-bold ml-1 mb-2">{errors.email.message}</Text>}

              <Text className="text-neutral-800 text-xs font-bold mb-2 ml-1">Password</Text>
              <View className="flex-row items-center bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-3.5 mb-2">
                <Lock size={18} color="#9CA3AF" />
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      onChangeText={onChange}
                      value={value}
                      placeholder="••••••••"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry
                      autoCapitalize="none"
                      className="flex-1 ml-2 text-neutral-800 font-medium text-sm p-0"
                    />
                  )}
                />
              </View>
              {errors.password && <Text className="text-red-500 text-[10px] font-bold ml-1 mb-2">{errors.password.message}</Text>}

              <TouchableOpacity 
                onPress={() => router.push('/forgot-password')} 
                className="align-self-end py-1 mb-6"
              >
                <Text className="text-gold font-bold text-xs text-right">Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            className="w-full bg-gold rounded-xl py-3.5 flex-row justify-center items-center"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text className="text-white font-bold text-sm tracking-wider uppercase mr-2">
                  {authMode === 'phone' ? 'Get OTP Code' : 'Sign In'}
                </Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* OAuth Dividers & Buttons */}
        <View className="my-8">
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-[1px] bg-neutral-150" />
            <Text className="text-gray-400 text-xs px-3 font-semibold uppercase">Or Continue With</Text>
            <View className="flex-1 h-[1px] bg-neutral-150" />
          </View>

          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border border-neutral-200 rounded-xl py-3.5 flex-row justify-center items-center mb-6"
          >
            <Image
              source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }}
              style={{ width: 18, height: 18 }}
              contentFit="contain"
            />
            <Text className="text-neutral-800 font-bold text-sm ml-2">Continue with Gmail / Google</Text>
          </TouchableOpacity>

          {/* Footer Navigation */}
          <View className="flex-row justify-center items-center pb-8">
            <Text className="text-gray-500 text-xs font-semibold">New to LawyerSathi?</Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text className="text-gold font-bold text-xs ml-1.5">Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        visible={showGoogleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoogleModal(false)}
      >
        <Pressable 
          onPress={() => setShowGoogleModal(false)}
          className="flex-1 bg-black/50 justify-center items-center px-6"
        >
          <Pressable 
            onPress={(e) => e.stopPropagation()}
            className="bg-white w-full rounded-3xl p-6 border border-neutral-100 shadow-xl"
          >
            <View className="items-center mb-5">
              <Image
                source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }}
                style={{ width: 40, height: 40 }}
                contentFit="contain"
              />
              <Text className="text-neutral-900 text-lg font-bold mt-3">Sign in with Google</Text>
              <Text className="text-gray-400 text-[11px] text-center mt-1">
                Enter your Gmail address to continue to LawyerSathi
              </Text>
            </View>

            <Text className="text-neutral-800 text-xs font-bold mb-2 ml-1">Gmail Address</Text>
            <View className="flex-row items-center bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-3.5 mb-2">
              <Mail size={18} color="#9CA3AF" />
              <TextInput
                value={gmailInput}
                onChangeText={setGmailInput}
                placeholder="example@gmail.com"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                keyboardType="email-address"
                className="flex-1 ml-2 text-neutral-800 font-medium text-sm p-0"
              />
            </View>
            <Text className="text-neutral-400 text-[9px] ml-1 mb-4 leading-normal">
              For testing, enter any address ending with @gmail.com (e.g. advocate.demo@gmail.com).
            </Text>

            {modalError && (
              <Text className="text-red-500 text-[10px] font-bold ml-1 mb-4">{modalError}</Text>
            )}

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowGoogleModal(false)}
                className="flex-1 bg-neutral-100 rounded-xl py-3.5 items-center justify-center"
              >
                <Text className="text-gray-500 font-bold text-xs uppercase tracking-wider">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleGoogleModalSubmit}
                className="flex-1 bg-neutral-900 rounded-xl py-3.5 items-center justify-center flex-row"
              >
                <Image
                  source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }}
                  style={{ width: 14, height: 14 }}
                  className="mr-1.5"
                  contentFit="contain"
                />
                <Text className="text-white font-bold text-xs uppercase tracking-wider">Continue</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
