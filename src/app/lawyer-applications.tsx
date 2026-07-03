import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Mail, Phone, Calendar, Briefcase, FileText, MapPin, Trash2 } from 'lucide-react-native';
import { useStore } from '../store/store';

export default function LawyerApplicationsScreen() {
  const router = useRouter();
  const lawyerApplications = useStore(state => state.lawyerApplications);
  const deleteLawyerApplication = useStore(state => state.deleteLawyerApplication);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

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
          <Text className="text-neutral-900 font-extrabold text-base">Lawyer Applications</Text>
          <Text className="text-gold font-bold text-[9px] uppercase tracking-wider">Advocate Onboarding Submissions</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {lawyerApplications.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <View className="w-16 h-16 bg-neutral-50 rounded-full justify-center items-center mb-4 border border-neutral-150 shadow-xs">
              <FileText size={24} color="#9CA3AF" />
            </View>
            <Text className="text-neutral-900 font-extrabold text-sm text-center">No Applications Received</Text>
            <Text className="text-gray-400 text-[10px] text-center mt-1 px-8 leading-4">
              Submitted advocate registration profiles will appear here for review. Share the Lawyer onboarding form to start receiving applications.
            </Text>
          </View>
        ) : (
          <View className="mb-8">
            <Text className="text-neutral-900 font-extrabold text-[10px] uppercase tracking-wider mb-4 text-gold">
              Total Applications ({lawyerApplications.length})
            </Text>
            
            {lawyerApplications.map((app, idx) => (
              <View 
                key={idx}
                className="bg-white border border-neutral-200 rounded-[28px] p-5 mb-5 shadow-xs"
              >
                {/* Header info */}
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 mr-2">
                    <Text className="text-neutral-900 font-extrabold text-sm">{app.name}</Text>
                    <View className="flex-row items-center mt-1">
                      <Calendar size={10} color="#9CA3AF" />
                      <Text className="text-gray-400 text-[9px] font-semibold ml-1">
                        Applied: {formatDate(app.appliedAt)}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Experience and Actions */}
                  <View className="flex-row items-center gap-2">
                    {/* Experience Badge */}
                    {app.experience ? (
                      <View className="bg-amber-50 border border-gold/10 px-2 py-1 rounded-lg">
                        <Text className="text-gold text-[9px] font-bold uppercase tracking-wider">
                          {app.experience} Yrs Exp
                        </Text>
                      </View>
                    ) : null}

                    {/* Delete Option */}
                    <TouchableOpacity
                      onPress={() => deleteLawyerApplication(app.email)}
                      className="bg-red-50 border border-red-100 p-1.5 rounded-lg"
                    >
                      <Trash2 size={12} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Sub info */}
                <View className="bg-neutral-50 rounded-2xl p-3 border border-neutral-100 mb-4 space-y-2">
                  <View className="flex-row items-center">
                    <Mail size={12} color="#9CA3AF" />
                    <Text className="text-neutral-700 text-[11px] font-semibold ml-2 select-text">{app.email}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Phone size={12} color="#9CA3AF" />
                    <Text className="text-neutral-700 text-[11px] font-semibold ml-2 select-text">{app.phone}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Briefcase size={12} color="#9CA3AF" />
                    <Text className="text-neutral-700 text-[11px] font-semibold ml-2">Gender: {app.gender}</Text>
                  </View>
                </View>

                {/* Specializations */}
                {app.selectedSpecs && app.selectedSpecs.length > 0 && (
                  <View className="mb-3">
                    <Text className="text-neutral-900 font-extrabold text-[9px] uppercase tracking-wider mb-1.5 text-gold">Specializations</Text>
                    <View className="flex-row flex-wrap gap-1">
                      {app.selectedSpecs.map((spec: string) => (
                        <View key={spec} className="bg-neutral-900 px-2.5 py-0.5 rounded-full">
                          <Text className="text-white text-[8px] font-bold">{spec}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}



                {/* SDMs list */}
                {app.selectedSDMOffices && app.selectedSDMOffices.length > 0 && (
                  <View className="mb-3">
                    <Text className="text-neutral-900 font-extrabold text-[9px] uppercase tracking-wider mb-1 text-gold">Preferred SDMs</Text>
                    <View className="flex-row flex-wrap gap-1.5 mt-0.5">
                      {app.selectedSDMOffices.map((sdm: string) => (
                        <View key={sdm} className="flex-row items-center bg-neutral-100 border border-neutral-200 py-1 px-2.5 rounded-xl">
                          <MapPin size={8} color="#9CA3AF" className="mr-1" />
                          <Text className="text-neutral-700 text-[9px] font-bold">{sdm}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Uploaded Documents */}
                {app.documents && app.documents.length > 0 && (
                  <View className="mt-3 pt-3 border-t border-neutral-100">
                    <Text className="text-neutral-900 font-extrabold text-[9px] uppercase tracking-wider mb-2 text-gold">Uploaded Credentials</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {app.documents.map((doc: any) => (
                        <TouchableOpacity 
                          key={doc.id}
                          onPress={() => Linking.openURL(doc.uri)}
                          className="flex-row items-center bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 py-1.5 px-3 rounded-xl"
                        >
                          <FileText size={10} color="#D4AF37" className="mr-1.5" />
                          <View className="flex-col max-w-[150px]">
                            <Text className="text-neutral-800 text-[9px] font-bold">{doc.type}</Text>
                            <Text className="text-gray-400 text-[7px] font-medium" numberOfLines={1}>{doc.name}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
