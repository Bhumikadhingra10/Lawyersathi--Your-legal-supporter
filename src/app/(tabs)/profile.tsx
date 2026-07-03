import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Modal, Platform, Alert } from 'react-native';
import { ShieldCheck, LogIn, UserPlus, Camera, Trash2, Upload, LogOut, ArrowRight, Calendar, FileText, CreditCard, Bell, Briefcase, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/store';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useStore(state => state.user);
  const updateUserPhoto = useStore(state => state.updateUserPhoto);
  const logout = useStore(state => state.logout);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);

  const presetAvatars = [
    { uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=150&h=150&q=80', label: 'Female 1' },
    { uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?fit=crop&w=150&h=150&q=80', label: 'Female 2' },
    { uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=150&h=150&q=80', label: 'Female 3' },
    { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150&h=150&q=80', label: 'Male 1' },
    { uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=150&h=150&q=80', label: 'Male 2' },
    { uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fit=crop&w=150&h=150&q=80', label: 'Male 3' },
  ];

  const menuItems = [
    { 
      title: 'Bookings', 
      subtitle: 'Manage your marriage registrations', 
      icon: Calendar, 
      action: () => router.push('/(tabs)/bookings') 
    },
    { 
      title: 'Documents', 
      subtitle: 'Upload and verify identity proofs', 
      icon: FileText, 
      action: () => router.push('/documents-vault') 
    },
    { 
      title: 'Payment History', 
      subtitle: 'View receipts and transactions', 
      icon: CreditCard, 
      action: () => router.push('/payment-history')
    },
    { 
      title: 'Notifications', 
      subtitle: 'View updates and announcements', 
      icon: Bell, 
      action: () => setNotificationModalVisible(true) 
    },
    { 
      title: 'Lawyer Applications', 
      subtitle: 'Register as a legal consultant partner', 
      icon: Briefcase, 
      action: () => router.push('/lawyer-applications') 
    },
    { 
      title: 'About Us', 
      subtitle: 'Learn more about LawyerSathi', 
      icon: Info, 
      action: () => router.push('/about') 
    },
  ];

  const handleUploadPhoto = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            updateUserPhoto(reader.result as string);
            setPhotoModalVisible(false);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      // Fallback for native devices: pick a random high-quality mock portrait
      const randomAvatars = [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=150&h=150&q=80',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?fit=crop&w=150&h=150&q=80',
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?fit=crop&w=150&h=150&q=80',
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?fit=crop&w=150&h=150&q=80',
      ];
      const randomAvatar = randomAvatars[Math.floor(Math.random() * randomAvatars.length)];
      updateUserPhoto(randomAvatar);
      setPhotoModalVisible(false);
      Alert.alert('Success', 'Profile photo updated successfully!');
    }
  };

  const handleRemovePhoto = () => {
    updateUserPhoto(null);
    setPhotoModalVisible(false);
    Alert.alert('Success', 'Profile photo removed.');
  };

  if (!user) {
    return (
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
        className="flex-1 bg-white px-10"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require('../../../assets/images/logo_shield_transparent.png')}
          className="w-20 h-20 opacity-30 mb-6"
          resizeMode="contain"
        />
        <Text className="text-neutral-900 font-bold text-2xl text-center mb-2">Welcome to LawyerSathi</Text>
        <Text className="text-neutral-500 text-sm text-center mb-8 px-4 leading-5">
          Sign in to access your personal profile, review active marriage bookings, upload documents, and chat with legal experts.
        </Text>
        
        {/* Sign In Button */}
        <TouchableOpacity
          onPress={() => router.push('/login')}
          className="w-full bg-gold py-4 rounded-2xl flex-row justify-center items-center mb-3 shadow-sm active:opacity-90"
          style={{ backgroundColor: '#D4AF37' }}
        >
          <LogIn size={18} color="#FFFFFF" className="mr-2" />
          <Text className="text-white font-bold text-sm uppercase tracking-wider">Sign In</Text>
        </TouchableOpacity>

        {/* Sign Up Button */}
        <TouchableOpacity
          onPress={() => router.push('/signup')}
          className="w-full py-4 rounded-2xl flex-row justify-center items-center border border-neutral-200 active:bg-neutral-50"
        >
          <UserPlus size={18} color="#D4AF37" className="mr-2" />
          <Text className="text-neutral-900 font-bold text-sm uppercase tracking-wider">Create Account</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-neutral-100 items-center">
        <Text className="text-neutral-900 font-bold text-lg">My Profile</Text>
        <Text className="text-gold font-bold text-[10px] tracking-wider uppercase">Account Details</Text>
      </View>

      <ScrollView className="flex-grow px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View className="bg-neutral-50 rounded-3xl p-5 border border-neutral-100 flex-row items-center mb-6">
          <TouchableOpacity 
            onPress={() => setPhotoModalVisible(true)}
            className="relative"
            activeOpacity={0.8}
          >
            <View className="w-16 h-16 rounded-full bg-neutral-200 border border-gold/15 overflow-hidden">
              <Image
                source={{ 
                  uri: user.photoURL || 
                    (user.gender === 'Female' 
                      ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=150&h=150&q=80' 
                      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=crop&w=150&h=150&q=80') 
                }}
                className="w-full h-full"
              />
            </View>
            <View className="absolute bottom-0 right-0 bg-gold w-5 h-5 rounded-full justify-center items-center border border-white" style={{ backgroundColor: '#D4AF37' }}>
              <Camera size={10} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <View className="ml-4 flex-1">
            <View className="flex-row items-center">
              <Text className="text-neutral-900 font-bold text-base mr-1">{user.displayName || 'LawyerSathi Client'}</Text>
              <ShieldCheck size={12} color="#D4AF37" />
            </View>
            <Text className="text-gray-400 text-[10px] font-bold tracking-wider">{user.email || user.phoneNumber}</Text>
            {user.gender && (
              <View className="bg-amber-50/80 border border-gold/10 px-2 py-0.5 rounded-md self-start mt-1">
                <Text className="text-gold text-[9px] font-bold uppercase tracking-wider">{user.gender}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Features & Options Section */}
        <View className="mb-6">
          <Text className="text-gray-400 text-[10px] font-bold tracking-wider uppercase mb-3 px-1">Services & Features</Text>
          <View className="bg-neutral-50 rounded-3xl border border-neutral-100 overflow-hidden p-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={item.action}
                  className={`flex-row items-center p-3.5 rounded-2xl active:bg-neutral-100/70 ${
                    index < menuItems.length - 1 ? 'border-b border-neutral-100/50 mb-1' : ''
                  }`}
                >
                  <View className="w-9 h-9 bg-white rounded-xl justify-center items-center mr-3 border border-neutral-150 shadow-xs">
                    <Icon size={16} color="#B8860B" strokeWidth={2.5} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-neutral-900 font-bold text-xs">{item.title}</Text>
                    <Text className="text-neutral-400 text-[9px] font-medium mt-0.5">{item.subtitle}</Text>
                  </View>
                  <ArrowRight size={14} color="#9CA3AF" />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Account Actions Section */}
        <View className="mt-4 mb-10">
          <Text className="text-gray-400 text-[10px] font-bold tracking-wider uppercase mb-3 px-1">Account Actions</Text>
          <TouchableOpacity
            onPress={async () => {
              await logout();
              router.replace('/login');
            }}
            className="bg-red-50/50 border border-red-100/50 rounded-2xl p-4 flex-row items-center justify-between active:bg-red-50"
          >
            <View className="flex-row items-center">
              <LogOut size={16} color="#EF4444" className="mr-3" />
              <Text className="text-red-600 font-bold text-sm">Sign Out</Text>
            </View>
            <ArrowRight size={14} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Photo Modal */}
      <Modal
        visible={photoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          {/* Dismiss overlay */}
          <TouchableOpacity 
            className="flex-grow" 
            onPress={() => setPhotoModalVisible(false)} 
            activeOpacity={1}
          />
          
          {/* Modal Container */}
          <View className="bg-white rounded-t-3xl p-6 pb-8 border-t border-neutral-100">
            <Text className="text-neutral-900 font-bold text-lg text-center mb-1">Profile Photo</Text>
            <Text className="text-neutral-400 text-xs text-center mb-6">Choose a preset avatar or upload your own photo</Text>

            {/* Presets Header */}
            <Text className="text-neutral-500 font-bold text-[10px] tracking-wider uppercase mb-3 px-1">Preset Avatars</Text>
            
            {/* Presets Horizontal list */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="flex-row mb-6 py-1"
            >
              {presetAvatars.map((avatar, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    updateUserPhoto(avatar.uri);
                    setPhotoModalVisible(false);
                    Alert.alert('Success', 'Profile photo updated!');
                  }}
                  className="mr-4 items-center"
                >
                  <View className="w-14 h-14 rounded-full border border-neutral-200 overflow-hidden mb-1">
                    <Image source={{ uri: avatar.uri }} className="w-full h-full" />
                  </View>
                  <Text className="text-[9px] text-neutral-500 font-medium">{avatar.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Actions */}
            <View className="gap-3">
              {/* Upload Button */}
              <TouchableOpacity
                onPress={handleUploadPhoto}
                className="w-full border border-neutral-200 py-3.5 rounded-2xl flex-row justify-center items-center active:bg-neutral-50"
              >
                <Upload size={16} color="#D4AF37" className="mr-2" />
                <Text className="text-neutral-950 font-bold text-sm uppercase tracking-wider">Upload from Device</Text>
              </TouchableOpacity>

              {/* Remove Button (only show if user has custom photoURL) */}
              {user.photoURL && (
                <TouchableOpacity
                  onPress={handleRemovePhoto}
                  className="w-full border border-red-100 py-3.5 rounded-2xl flex-row justify-center items-center bg-red-50/50 active:bg-red-50"
                >
                  <Trash2 size={16} color="#EF4444" className="mr-2" />
                  <Text className="text-red-600 font-bold text-sm uppercase tracking-wider">Remove Current Photo</Text>
                </TouchableOpacity>
              )}

              {/* Cancel Button */}
              <TouchableOpacity
                onPress={() => setPhotoModalVisible(false)}
                className="w-full bg-neutral-950 py-3.5 rounded-2xl flex-row justify-center items-center mt-2 active:opacity-90"
              >
                <Text className="text-white font-bold text-sm uppercase tracking-wider">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={notificationModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setNotificationModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6 relative">
          {/* Backdrop Touch Area */}
          <TouchableOpacity 
            className="absolute inset-0 w-full h-full"
            activeOpacity={1}
            onPress={() => setNotificationModalVisible(false)}
          />

          {/* Content Card */}
          <View className="bg-white w-full rounded-[32px] p-6 border border-neutral-100 shadow-md items-center z-10">
            {/* Header */}
            <View className="flex-row justify-between items-center w-full mb-6">
              <Text className="text-neutral-900 font-extrabold text-base">Notifications</Text>
              <TouchableOpacity 
                onPress={() => setNotificationModalVisible(false)}
                className="bg-neutral-150 p-1.5 rounded-full"
              >
                <Text className="text-[10px] font-bold text-gray-500 px-1">X</Text>
              </TouchableOpacity>
            </View>

            {/* Empty State */}
            <View className="py-8 items-center justify-center">
              <View className="w-16 h-16 bg-neutral-50 rounded-full justify-center items-center mb-4 border border-neutral-150 shadow-xs">
                <Bell size={24} color="#B8860B" />
              </View>
              <Text className="text-neutral-900 font-extrabold text-sm text-center">No New Notifications</Text>
              <Text className="text-gray-400 text-[10px] text-center mt-1 px-4 leading-4">
                You are all caught up! When you receive updates about your registrations or appointments, they will appear here.
              </Text>
            </View>

            {/* Action button */}
            <TouchableOpacity
              onPress={() => setNotificationModalVisible(false)}
              className="w-full bg-neutral-900 py-3.5 rounded-full items-center justify-center mt-2 shadow-xs"
            >
              <Text className="text-white font-bold text-xs uppercase tracking-wider">Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
