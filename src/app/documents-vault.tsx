import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Platform, Modal, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Search, FileText, Trash2, Eye, Plus, Download } from 'lucide-react-native';
import { useStore } from '../store/store';

type FilterTab = 'all' | 'client' | 'lawyer';

interface VaultItem {
  id: string;
  type: string;
  name: string;
  uri: string;
  uploadedAt: string;
  source: 'client' | 'lawyer';
  bookingId?: string;
  packageName?: string;
  ownerName: string;
}

export default function DocumentsVaultScreen() {
  const router = useRouter();
  const allBookings = useStore(state => state.bookings);
  const bookings = allBookings; // Include all bookings (paid and unpaid)
  const lawyerApplications = useStore(state => state.lawyerApplications);
  const removeDocument = useStore(state => state.removeDocument);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

  // Combine and format documents from all bookings and lawyer applications
  const vaultItems = useMemo(() => {
    const items: VaultItem[] = [];

    // 1. Client Bookings Documents
    bookings.forEach(booking => {
      const clientName = booking.brideName && booking.groomName
        ? `${booking.brideName} & ${booking.groomName}`
        : 'Marriage Registration';

      booking.documents.forEach(doc => {
        items.push({
          id: doc.id,
          type: doc.type,
          name: doc.name,
          uri: doc.uri,
          uploadedAt: doc.uploadedAt,
          source: 'client',
          bookingId: booking.id,
          packageName: booking.packageName,
          ownerName: clientName
        });
      });
    });

    // 2. Lawyer Application Credentials
    lawyerApplications.forEach(app => {
      if (app.documents && Array.isArray(app.documents)) {
        app.documents.forEach((doc: any) => {
          items.push({
            id: doc.id || Math.random().toString(36).substr(2, 9),
            type: doc.type || 'Bar Credentials',
            name: doc.name,
            uri: doc.uri,
            uploadedAt: app.appliedAt || new Date().toISOString().split('T')[0],
            source: 'lawyer',
            packageName: 'Lawyer Application Credentials',
            ownerName: app.name || 'Advocate Applicant'
          });
        });
      }
    });

    // Sort by uploaded date descending
    return items.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }, [bookings, lawyerApplications]);

  // Filter items based on search and active tab selection
  const filteredItems = useMemo(() => {
    return vaultItems.filter(item => {
      // Tab filter
      if (activeTab === 'client' && item.source !== 'client') return false;
      if (activeTab === 'lawyer' && item.source !== 'lawyer') return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.ownerName.toLowerCase().includes(query) ||
        (item.bookingId && item.bookingId.toLowerCase().includes(query))
      );
    });
  }, [vaultItems, activeTab, searchQuery]);

  const handleRemoveItem = (item: VaultItem) => {
    if (item.source === 'client' && item.bookingId) {
      removeDocument(item.bookingId, item.type as any);
    }
  };

  const handleDownload = () => {
    if (!previewImageUri) return;
    try {
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = previewImageUri;
        const isPdf = previewImageUri.startsWith('data:application/pdf') || previewImageUri.toLowerCase().endsWith('.pdf');
        link.download = isPdf ? `document_${Date.now()}.pdf` : `document_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        Linking.openURL(previewImageUri);
      }
    } catch (err) {
      console.log('Download error:', err);
      alert('Failed to download file.');
    }
  };

  const handleOpen = () => {
    if (!previewImageUri) return;
    try {
      if (Platform.OS === 'web') {
        if (previewImageUri.startsWith('data:')) {
          const newWindow = window.open();
          if (newWindow) {
            newWindow.document.write(
              `<iframe src="${previewImageUri}" style="width:100%; height:100%; border:none; margin:0; padding:0;"></iframe>`
            );
          } else {
            alert('Popup blocked! Please allow popups to view.');
          }
        } else {
          window.open(previewImageUri, '_blank');
        }
      } else {
        Linking.openURL(previewImageUri);
      }
    } catch (err) {
      console.log('Open error:', err);
      alert('Failed to open file.');
    }
  };

  const handleOpenDocument = (uri: string) => {
    if (Platform.OS === 'web') {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(
          `<iframe src="${uri}" style="width:100%; height:100%; border:none; margin:0; padding:0;"></iframe>`
        );
      } else {
        alert('Popup blocked! Please allow popups to open this document.');
      }
    } else {
      // In native app context
      setPreviewImageUri(uri);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-neutral-100 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-4 p-2 bg-neutral-50 rounded-full border border-neutral-150 active:bg-neutral-100"
          >
            <ChevronLeft size={16} color="#111111" />
          </TouchableOpacity>
          <View>
            <Text className="text-neutral-900 font-extrabold text-base">Documents Vault</Text>
            <Text className="text-gold font-bold text-[9px] uppercase tracking-wider">All Uploaded Files</Text>
          </View>
        </View>

        {/* CTA to Upload new */}
        <TouchableOpacity
          onPress={() => router.push('/document-upload')}
          className="bg-neutral-900 px-3.5 py-2 rounded-full flex-row items-center gap-1 active:opacity-90 shadow-sm"
        >
          <Plus size={12} color="#FFFFFF" strokeWidth={3} />
          <Text className="text-white font-bold text-[10px] uppercase tracking-wider">Add File</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View className="flex-1 px-6 pt-4">
        {/* Search Input */}
        <View className="flex-row items-center bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-2.5 mb-4">
          <Search size={16} color="#9CA3AF" />
          <TextInput
            placeholder="Search by file name, category, client, ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-grow ml-2.5 text-neutral-800 text-xs outline-none"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Filter Tabs */}
        <View className="flex-row gap-2 mb-6">
          {(['all', 'client', 'lawyer'] as FilterTab[]).map(tab => {
            const isSelected = activeTab === tab;
            const label = tab === 'all' ? 'All Files' : tab === 'client' ? 'Client Uploads' : 'Lawyer Credentials';
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full border ${isSelected ? 'bg-neutral-950 border-neutral-950' : 'bg-white border-neutral-200 active:bg-neutral-50'}`}
              >
                <Text className={`font-bold text-[10px] uppercase tracking-wider ${isSelected ? 'text-white' : 'text-neutral-500'}`}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Documents list */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {filteredItems.length === 0 ? (
            <View className="py-20 items-center justify-center">
              <View className="w-16 h-16 bg-neutral-50 rounded-full justify-center items-center mb-4 border border-neutral-150 shadow-xs">
                <FileText size={24} color="#9CA3AF" />
              </View>
              <Text className="text-neutral-900 font-extrabold text-sm text-center">No Files Found</Text>
              <Text className="text-gray-400 text-[10px] text-center mt-1 px-8 leading-4">
                {searchQuery ? 'Try adjusting your search keywords or filter settings.' : 'Upload document copies in the bookings section to populate the vault.'}
              </Text>
            </View>
          ) : (
            <View className="mb-8">
              {filteredItems.map(item => {
                const isClientDoc = item.source === 'client';
                const isImage = item.uri.startsWith('data:image/') || item.uri.endsWith('.jpg') || item.uri.endsWith('.png') || item.uri.endsWith('.jpeg');

                return (
                  <View 
                    key={item.id} 
                    className="bg-white border border-neutral-200 rounded-[24px] p-4 mb-4 shadow-xs flex-col"
                  >
                    <View className="flex-row items-center mb-3">
                      {/* Document Type Icon / Preview Thumbnail */}
                      <View className="w-12 h-12 bg-neutral-50 rounded-xl justify-center items-center border border-neutral-150 overflow-hidden mr-3">
                        {isImage ? (
                          Platform.OS === 'web' ? (
                            <img 
                              src={item.uri} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                          ) : (
                            <Image 
                              source={{ uri: item.uri }} 
                              className="w-full h-full"
                              resizeMode="cover"
                            />
                          )
                        ) : (
                          <FileText size={20} color="#D4AF37" />
                        )}
                      </View>

                      {/* Document Details Info */}
                      <View className="flex-1 min-w-0">
                        <View className="flex-row items-center flex-wrap gap-1.5">
                          <Text className="text-neutral-900 font-extrabold text-xs truncate" numberOfLines={1}>{item.type}</Text>
                          <View className={`px-2 py-0.5 rounded-full ${isClientDoc ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-gold/10'}`}>
                            <Text className={`font-black text-[7px] uppercase tracking-wider ${isClientDoc ? 'text-emerald-600' : 'text-gold'}`}>
                              {isClientDoc ? 'Client File' : 'Credential'}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-gray-400 text-[8px] mt-0.5 font-medium" numberOfLines={1}>
                          File: {item.name}
                        </Text>
                        <Text className="text-gray-505 text-[9px] font-bold mt-1" numberOfLines={1}>
                          Owner: {item.ownerName}
                        </Text>
                      </View>
                    </View>

                    {/* Metadata summary */}
                    <View className="bg-neutral-50 rounded-xl p-2.5 border border-neutral-100 flex-row justify-between items-center mb-3.5">
                      <View>
                        <Text className="text-[7px] text-gray-400 font-bold uppercase tracking-wider">Associated With</Text>
                        <Text className="text-[9px] text-neutral-800 font-bold mt-0.5" numberOfLines={1}>
                          {item.bookingId ? `Booking Ref: ${item.bookingId}` : 'Onboarding Profile'}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-[7px] text-gray-400 font-bold uppercase tracking-wider">Uploaded On</Text>
                        <Text className="text-[9px] text-neutral-800 font-bold mt-0.5">{item.uploadedAt}</Text>
                      </View>
                    </View>

                    {/* Actions Menu */}
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => setPreviewImageUri(item.uri)}
                        className="flex-grow flex-row justify-center items-center py-2 px-2 bg-neutral-50 rounded-xl border border-neutral-250 active:bg-neutral-100"
                      >
                        <Eye size={12} color="#D4AF37" />
                        <Text className="text-neutral-800 font-bold text-[9px] ml-1.5">Quick View</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleOpenDocument(item.uri)}
                        className="flex-grow flex-row justify-center items-center py-2 px-2 bg-neutral-50 rounded-xl border border-neutral-250 active:bg-neutral-100"
                      >
                        <Download size={12} color="#D4AF37" />
                        <Text className="text-neutral-800 font-bold text-[9px] ml-1.5">Open File</Text>
                      </TouchableOpacity>

                      {isClientDoc && (
                        <TouchableOpacity
                          onPress={() => handleRemoveItem(item)}
                          className="flex-row justify-center items-center py-2 px-3 bg-red-50/50 rounded-xl border border-red-100/55 active:bg-red-50"
                        >
                          <Trash2 size={12} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Decoupled Image Preview Modal */}
      <Modal
        visible={!!previewImageUri}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImageUri(null)}
      >
        <View className="flex-1 bg-black/90 justify-center items-center p-4 relative">
          {/* Backdrop Touch Area */}
          <TouchableOpacity 
            className="absolute inset-0 w-full h-full"
            activeOpacity={1}
            onPress={() => setPreviewImageUri(null)}
          />
          
          {/* Content Card */}
          <View className="w-full h-[80%] max-w-lg bg-neutral-900 rounded-3xl overflow-hidden justify-between p-4 border border-neutral-800 z-10">
            {/* Header */}
            <View className="flex-row justify-between items-center w-full pb-3 border-b border-neutral-800 mb-4">
              <Text className="text-white font-extrabold text-sm">Document Preview</Text>
              <TouchableOpacity 
                onPress={() => setPreviewImageUri(null)}
                className="bg-neutral-800 p-1.5 rounded-full"
              >
                <Text className="text-[10px] font-bold text-gray-400 px-1">Close</Text>
              </TouchableOpacity>
            </View>

            {/* Image display */}
            <View className="flex-1 w-full justify-center items-center bg-black/30 rounded-2xl overflow-hidden mb-4 relative" style={{ minHeight: 300 }}>
              {previewImageUri ? (
                (previewImageUri.startsWith('data:application/pdf') || previewImageUri.toLowerCase().endsWith('.pdf')) ? (
                  <View className="items-center justify-center p-6">
                    <FileText size={64} color="#D4AF37" strokeWidth={1.5} />
                    <Text className="text-white font-bold text-sm mt-4 text-center">PDF Document</Text>
                    <Text className="text-gray-400 text-[10px] mt-2 text-center leading-4">
                      This file is a PDF. Use the buttons below to open it in a new window or download it to your device.
                    </Text>
                  </View>
                ) : Platform.OS === 'web' ? (
                  <img 
                    src={previewImageUri} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  />
                ) : (
                  <Image 
                    source={{ uri: previewImageUri }} 
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                    resizeMode="contain"
                  />
                )
              ) : (
                <Text className="text-gray-500 text-xs">No image loaded</Text>
              )}
            </View>

            {/* Bottom Actions */}
            <View className="flex-row gap-2.5 w-full mt-2 flex-wrap">
              <TouchableOpacity
                onPress={handleOpen}
                className="flex-1 bg-neutral-800 py-3.5 rounded-2xl items-center justify-center border border-neutral-700"
              >
                <Text className="text-white font-bold text-xs uppercase tracking-wider">Open File</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDownload}
                className="flex-1 bg-gold py-3.5 rounded-2xl items-center justify-center shadow-xs"
              >
                <Text className="text-neutral-950 font-bold text-xs uppercase tracking-wider">Download</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPreviewImageUri(null)}
                className="w-full bg-neutral-950 py-3 rounded-2xl items-center justify-center border border-neutral-850 mt-1"
              >
                <Text className="text-gray-450 font-bold text-xs uppercase tracking-wider">Dismiss</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
