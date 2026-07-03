import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, Modal, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { User, Mail, Lock, Globe, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');
import { useStore } from '../../store/store';
import { firebaseAuth } from '../../services/firebase';

export default function SignupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const signupWithEmail = useStore(state => state.signupWithEmail);

  const { control, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      name: '',
      email: '',
      gender: '',
      password: '',
      confirmPassword: ''
    }
  });

  const password = watch('password');

  const onSubmit = async (data: any) => {
    setLoading(true);
    setAuthError(null);
    try {
      await signupWithEmail(data.email, data.name, data.gender);
      router.replace('/home');
    } catch (err: any) {
      setAuthError(err.message || 'Signup failed. Please try again.');
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
          <Text className="text-neutral-900 text-3xl font-bold">Create Account</Text>
          <Text className="text-gray-500 text-sm mt-1 text-center">Get started with marriage registration</Text>
        </View>
      </View>

      <View className="px-6 mt-6 flex-1 justify-between">
        <View className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm">
          {authError && (
            <View className="bg-red-50 p-3 rounded-xl mb-4">
              <Text className="text-red-600 text-xs font-medium text-center">{authError}</Text>
            </View>
          )}

          {/* Form Fields */}
          <View>
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

            <Text className="text-neutral-800 text-xs font-bold mb-2 ml-1">Email Address</Text>
            <View className="flex-row items-center bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-3 mb-3">
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

            <Text className="text-neutral-800 text-xs font-bold mb-2 ml-1">Password</Text>
            <View className="flex-row items-center bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-3 mb-3">
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

            <Text className="text-neutral-800 text-xs font-bold mb-2 ml-1">Confirm Password</Text>
            <View className="flex-row items-center bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-3 mb-6">
              <Lock size={18} color="#9CA3AF" />
              <Controller
                control={control}
                name="confirmPassword"
                rules={{
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
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
            {errors.confirmPassword && <Text className="text-red-500 text-[10px] font-bold ml-1 mb-2">{errors.confirmPassword.message}</Text>}

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
                    Create Account
                  </Text>
                  <ArrowRight size={16} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* OAuth Dividers & Buttons */}
        <View className="my-6">
          <View className="flex-row items-center mb-4">
            <View className="flex-1 h-[1px] bg-neutral-150" />
            <Text className="text-gray-400 text-xs px-3 font-semibold uppercase">Or Sign Up With</Text>
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
            <Text className="text-neutral-800 font-bold text-sm ml-2">Sign Up with Google</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center items-center pb-6">
            <Text className="text-gray-500 text-xs font-semibold">Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text className="text-gold font-bold text-xs ml-1.5">Sign In</Text>
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
              <Text className="text-neutral-900 text-lg font-bold mt-3">Sign up with Google</Text>
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
