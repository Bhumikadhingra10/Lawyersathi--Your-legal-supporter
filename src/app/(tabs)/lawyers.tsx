import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Linking } from 'react-native';
import { Image } from 'expo-image';
import { Search, SlidersHorizontal, Star, Phone, Mail, Award, CheckCircle2, ShieldAlert } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/store';

const SERVICES = ['All Services', 'Marriage Registration', 'Divorce & Family Law', 'Property Registration'];

export default function LawyersScreen() {
  const router = useRouter();
  const lawyerApplications = useStore(state => state.lawyerApplications);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('All Services');
  const [showFilters, setShowFilters] = useState(false);

  const registeredLawyers = lawyerApplications.map((app, index) => {
    let avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=crop&w=150&h=150&q=80'; // Default Male
    if (app.gender === 'Female') {
      avatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=150&h=150&q=80';
    }

    return {
      id: `real_lawyer_${index}`,
      name: app.name.startsWith('Adv.') ? app.name : `Adv. ${app.name}`,
      avatar: avatar,
      experience: app.experience ? `${app.experience} Yrs Exp.` : '',
      expYears: parseInt(app.experience) || 0,
      rating: 5.0,
      reviews: 0,
      phone: app.phone,
      email: app.email,
      service: app.selectedSpecs?.[0] || 'Marriage Registration',
      verified: true,
    };
  });

  const filteredLawyers = registeredLawyers.filter(lawyer => {
    // Search filter
    const matchesSearch = lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          lawyer.service.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Service filter
    const matchesService = selectedService === 'All Services' || lawyer.service === selectedService;
    
    return matchesSearch && matchesService;
  });

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-neutral-100 flex-row justify-between items-center">
        <View>
          <Text className="text-neutral-900 font-bold text-lg">Top Advocates</Text>
          <Text className="text-gold font-bold text-[10px] tracking-wider uppercase">Verified Legal Partners</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-full border ${showFilters ? 'bg-amber-50 border-gold' : 'border-neutral-250 bg-neutral-50'}`}
        >
          <SlidersHorizontal size={16} color={showFilters ? '#D4AF37' : '#111111'} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-6 pt-4 pb-2 flex-row gap-3">
        <View className="flex-grow flex-row items-center bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-3">
          <Search size={16} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name or service..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 text-neutral-800 text-xs font-semibold p-0"
          />
        </View>
      </View>

      {/* Filter Options (Collapsible drawer/accordion) */}
      {showFilters && (
        <View className="px-6 py-3 bg-neutral-50 border-b border-neutral-100">
          {/* Service Filter */}
          <Text className="text-neutral-800 text-[10px] font-bold uppercase tracking-wider mb-2">Filter By Service</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-3">
            {SERVICES.map(service => (
              <TouchableOpacity
                key={service}
                onPress={() => setSelectedService(service)}
                className={`py-1.5 px-3 rounded-full border mr-2 ${selectedService === service ? 'bg-amber-50 border-gold' : 'bg-white border-neutral-250'}`}
              >
                <Text className={`text-[10px] font-bold ${selectedService === service ? 'text-gold' : 'text-neutral-700'}`}>
                  {service}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

        </View>
      )}

      {/* Lawyers List */}
      <ScrollView className="flex-grow px-6 pt-4" showsVerticalScrollIndicator={false}>
        {filteredLawyers.length === 0 ? (
          <View className="items-center justify-center py-20 px-8">
            <ShieldAlert size={48} color="#9CA3AF" />
            <Text className="text-neutral-900 font-bold text-sm text-center mt-4">No Advocates Found</Text>
            <Text className="text-gray-450 text-[11px] text-center mt-2 leading-4">
              {"We couldn't find any verified advocates matching your search filters. Try clearing some options."}
            </Text>
          </View>
        ) : (
          filteredLawyers.map(lawyer => (
            <View 
              key={lawyer.id} 
              className="bg-white border border-neutral-150 rounded-3xl p-5 mb-5 shadow-xs flex-row"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.03,
                shadowRadius: 5,
                elevation: 1
              }}
            >
              {/* Left Column: Avatar */}
              <View className="items-center mr-4 w-[28%]">
                <View className="w-16 h-16 rounded-full border border-gold/15 overflow-hidden">
                  <Image
                    source={{ uri: lawyer.avatar }}
                    className="w-full h-full"
                    contentFit="cover"
                  />
                </View>
              </View>

              {/* Right Column: Name, Badges, Details */}
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-neutral-900 font-extrabold text-sm mr-1.5">{lawyer.name}</Text>
                  {lawyer.verified && <CheckCircle2 size={12} color="#10B981" />}
                </View>

                {/* Primary Service Badge */}
                <View className="flex-row gap-2 mb-2.5">
                  <View className="bg-amber-50 border border-gold/10 px-2 py-0.5 rounded-md self-start">
                    <Text className="text-gold text-[8px] font-bold uppercase tracking-wider">{lawyer.service}</Text>
                  </View>
                  <View className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md self-start">
                    <Text className="text-emerald-700 text-[8px] font-bold uppercase tracking-wider">All Over Delhi</Text>
                  </View>
                </View>

                {/* Info Rows */}
                <View className="space-y-1 mb-4">
                  <View className="flex-row items-center">
                    <Phone size={12} color="#9CA3AF" />
                    <Text className="text-neutral-600 text-[10px] font-medium ml-1.5">{lawyer.phone}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Mail size={12} color="#9CA3AF" />
                    <Text className="text-neutral-600 text-[10px] font-medium ml-1.5" numberOfLines={1}>
                      {lawyer.email}
                    </Text>
                  </View>
                </View>


              </View>
            </View>
          ))
        )}
        <View className="mb-8" />
      </ScrollView>
    </View>
  );
}
