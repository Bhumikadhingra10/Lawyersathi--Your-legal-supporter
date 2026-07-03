import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { ChevronLeft, Mail, CheckCircle2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '' }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 pt-12">
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
        <Text className="text-neutral-900 text-3xl font-bold text-center">Reset Password</Text>
        <Text className="text-gray-500 text-sm text-center mt-2 px-6">
          Enter your registered email address to receive password reset instructions
        </Text>
      </View>

      <View className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm mb-6">
        {success ? (
          <View className="items-center py-4">
            <CheckCircle2 size={48} color="#D4AF37" className="mb-4" />
            <Text className="text-neutral-900 font-bold text-base text-center">Reset Link Sent!</Text>
            <Text className="text-gray-500 text-xs text-center mt-2 px-2">
              We have sent a password reset link to your email. Please check your inbox.
            </Text>
            <TouchableOpacity
              onPress={() => router.replace('/login')}
              className="mt-6 w-full bg-gold rounded-xl py-3 items-center"
            >
              <Text className="text-white font-bold text-sm">Back to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text className="text-neutral-800 text-xs font-bold mb-2 ml-1">Email Address</Text>
            <View className="flex-row items-center bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-3.5 mb-6">
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

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              className="w-full bg-gold rounded-xl py-3.5 flex-row justify-center items-center"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-white font-bold text-sm tracking-wider uppercase">
                  Send Reset Link
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
