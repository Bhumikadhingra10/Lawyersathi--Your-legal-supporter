import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Platform, Modal, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Camera, FolderOpen, FileCheck, ShieldAlert, Trash2, FileText } from 'lucide-react-native';
import { useStore } from '../store/store';
import { firebaseStorage } from '../services/firebase';
import * as ImagePicker from 'expo-image-picker';

type DocType =
  | 'Bride Identity Proof'
  | 'Groom Identity Proof'
  | 'Address Proof'
  | 'Age Proof'
  | 'Affidavits'
  | 'Marriage Documents'
  | 'Witnesses';

const getCleanFileName = (type: string, originalFileName: string) => {
  const extension = originalFileName.split('.').pop() || 'jpg';
  return `${type.toLowerCase().replace(/ /g, '_')}_${Date.now()}.${extension}`;
};

const getCapturedFileName = () => {
  return `captured_${Date.now()}.jpg`;
};

export default function DocumentUploadScreen() {
  const router = useRouter();
  const allBookings = useStore(state => state.bookings);
  const bookings = allBookings; // Allow all bookings (paid and unpaid)
  const currentBookingId = useStore(state => state.currentBookingId);
  const uploadDocStore = useStore(state => state.uploadDocument);
  const removeDocument = useStore(state => state.removeDocument);
  const createBooking = useStore(state => state.createBooking);

  // Auto-create a demo booking if none exists so users can always add files
  useEffect(() => {
    if (allBookings.length === 0) {
      createBooking('Complete Court Marriage Package', 14999);
    }
  }, [allBookings, createBooking]);

  const [activeUploadType, setActiveUploadType] = useState<DocType | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Web camera states
  const [webCamVisible, setWebCamVisible] = useState(false);
  const [webCamType, setWebCamType] = useState<DocType | null>(null);
  const [videoStream, setVideoStream] = useState<any>(null);

  // Image preview state
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

  const activeBooking = bookings.find(b => b.id === currentBookingId) || bookings[0];

  const docTypes: DocType[] = [
    'Bride Identity Proof',
    'Groom Identity Proof',
    'Address Proof',
    'Age Proof',
    'Affidavits',
    'Marriage Documents',
    'Witnesses'
  ];

  const getDocStatus = (type: DocType) => {
    if (!activeBooking) return 'missing';
    const found = activeBooking.documents.find(d => d.type === type);
    return found ? 'completed' : 'missing';
  };

  const startWebCam = async (type: DocType) => {
    setWebCamType(type);
    setWebCamVisible(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'environment' } 
      });
      setVideoStream(stream);
      setTimeout(() => {
        const videoElement = document.getElementById('webcam-video') as HTMLVideoElement;
        if (videoElement) {
          videoElement.srcObject = stream;
        }
      }, 300);
    } catch (err) {
      console.log('Error starting webcam:', err);
      alert('Could not access camera. Please check browser permissions.');
      setWebCamVisible(false);
      setWebCamType(null);
    }
  };

  const stopWebCam = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track: any) => track.stop());
      setVideoStream(null);
    }
    setWebCamVisible(false);
    setWebCamType(null);
  };

  const capturePhoto = async () => {
    if (!webCamType) return;
    const videoElement = document.getElementById('webcam-video') as HTMLVideoElement;
    if (videoElement) {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        stopWebCam();
        await handleUpload(webCamType, dataUrl, getCapturedFileName());
      }
    }
  };

  const handleUpload = async (type: DocType, uri: string, originalFileName: string) => {
    if (!activeBooking) {
      alert('Please confirm your package first.');
      return;
    }
    setActiveUploadType(type);
    setUploading(true);
    setUploadProgress(0);
    
    const cleanFileName = getCleanFileName(type, originalFileName);
    
    try {
      const uploadUrl = await firebaseStorage.uploadFile(
        `bookings/${activeBooking.id}/${cleanFileName}`,
        uri,
        (progress) => setUploadProgress(progress)
      );
      
      // Save in Zustand
      uploadDocStore(activeBooking.id, type, uploadUrl, cleanFileName);
    } catch (err) {
      console.log('Upload error:', err);
      alert('Upload failed');
    } finally {
      setUploading(false);
      setActiveUploadType(null);
    }
  };

  const handleTakePhoto = async (type: DocType) => {
    if (!activeBooking) {
      alert('Please confirm your package first.');
      return;
    }

    if (Platform.OS === 'web') {
      await startWebCam(type);
      return;
    }
    
    if (!activeBooking) {
      alert('Please confirm your package first.');
      return;
    }
    
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access camera is required!');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await handleUpload(type, asset.uri, asset.fileName || 'camera_photo.jpg');
      }
    } catch (err) {
      console.log('Camera error:', err);
      alert('Failed to launch camera.');
    }
  };

  const handleBrowseFiles = async (type: DocType) => {
    if (!activeBooking) {
      alert('Please confirm your package first.');
      return;
    }

    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,application/pdf';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async () => {
            await handleUpload(type, reader.result as string, file.name);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }

    if (!activeBooking) {
      alert('Please confirm your package first.');
      return;
    }
    
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access library is required!');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await handleUpload(type, asset.uri, asset.fileName || 'library_photo.jpg');
      }
    } catch (err) {
      console.log('Library error:', err);
      alert('Failed to browse files.');
    }
  };

  const handleRemoveFile = (type: DocType) => {
    if (activeBooking) {
      removeDocument(activeBooking.id, type);
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

  if (!activeBooking) {
    return (
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="px-6 pt-12 pb-4 bg-white border-b border-neutral-100 flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <ChevronLeft size={22} color="#111111" />
          </TouchableOpacity>
          <View>
            <Text className="text-neutral-900 font-bold text-lg">Upload Documents</Text>
            <Text className="text-gray-400 text-[9px] font-bold tracking-wider uppercase">
              Booking Ref: N/A
            </Text>
          </View>
        </View>
        <View className="flex-1 justify-center items-center px-10">
          <Image
            source={require('../../assets/images/logo_shield_transparent.png')}
            className="w-16 h-16 opacity-15 mb-6"
            resizeMode="contain"
          />
          <Text className="text-neutral-900 font-bold text-lg text-center">No Active Paid Booking</Text>
          <Text className="text-gray-400 text-xs text-center mt-2 mb-8 leading-5">
            Please purchase a court marriage package and complete the payment successfully before uploading your documents.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/package')}
            className="bg-gold px-8 py-3.5 rounded-full"
            style={{ backgroundColor: '#D4AF37' }}
          >
            <Text className="text-white font-bold text-xs uppercase tracking-wider">Explore Packages</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-neutral-100 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ChevronLeft size={22} color="#111111" />
        </TouchableOpacity>
        <View>
          <Text className="text-neutral-900 font-bold text-lg">Upload Documents</Text>
          <Text className="text-gray-400 text-[9px] font-bold tracking-wider uppercase">
            Booking Ref: {activeBooking ? activeBooking.id : 'N/A'}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {/* Verification Warning Notice */}
        <View className="bg-amber-50 rounded-2xl p-4 flex-row items-start mb-6 border border-gold/15">
          <ShieldAlert size={18} color="#D4AF37" className="mt-0.5" />
          <View className="ml-3 flex-1">
            <Text className="text-neutral-900 font-bold text-xs">Verify Document Clarity</Text>
            <Text className="text-gray-500 text-[10px] leading-4 mt-0.5">
              Ensure Aadhaar QR codes and photos are clearly visible. Scan copies are preferred. Blurry files will delay advocate approval.
            </Text>
          </View>
        </View>

        {/* Upload Categories */}
        <View className="mb-12">
          {docTypes.map(type => {
            const status = getDocStatus(type);
            const isUploadingThis = uploading && activeUploadType === type;
            const docDetails = activeBooking?.documents.find(d => d.type === type);

            return (
              <View 
                key={type} 
                className={`border rounded-2xl p-4 mb-4 ${status === 'completed' ? 'border-emerald-100 bg-emerald-50/10' : 'border-neutral-200 bg-white'}`}
              >
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-1 flex-row items-center">
                    {status === 'completed' && docDetails && (
                      <TouchableOpacity 
                        onPress={() => setPreviewImageUri(docDetails.uri)}
                        activeOpacity={0.8}
                        className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-250 overflow-hidden mr-3"
                      >
                        <Image 
                          source={{ uri: docDetails.uri }} 
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    )}
                    <View className="flex-1">
                      <Text className="text-neutral-800 font-bold text-sm">{type}</Text>
                      {status === 'completed' && docDetails ? (
                        <TouchableOpacity onPress={() => setPreviewImageUri(docDetails.uri)} activeOpacity={0.7}>
                          <Text className="text-gray-450 text-[10px] mt-0.5 underline">
                            File: {docDetails.name} • {docDetails.uploadedAt}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <Text className="text-gray-400 text-[10px] mt-0.5">Required document</Text>
                      )}
                    </View>
                  </View>
                  
                  {status === 'completed' && docDetails ? (
                    <TouchableOpacity 
                      onPress={() => setPreviewImageUri(docDetails.uri)}
                      className="flex-row items-center bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full active:bg-emerald-100/50"
                    >
                      <FileCheck size={10} color="#10B981" />
                      <Text className="text-emerald-600 font-bold text-[9px] ml-1 mr-1">Completed</Text>
                      <Text className="text-emerald-500 font-bold text-[8px] uppercase tracking-wider border-l border-emerald-250 pl-1.5">View</Text>
                    </TouchableOpacity>
                  ) : (
                    <View className="bg-neutral-100 px-2 py-1 rounded-full">
                      <Text className="text-gray-500 font-bold text-[9px]">Missing</Text>
                    </View>
                  )}
                </View>

                {/* Loading Progress Bar */}
                {isUploadingThis && (
                  <View className="mb-3">
                    <View className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden mb-1.5">
                      <View style={{ width: `${uploadProgress}%` }} className="h-full bg-gold rounded-full" />
                    </View>
                    <Text className="text-gold text-[9px] font-bold">Uploading... {uploadProgress}%</Text>
                  </View>
                )}

                {/* Action Controls */}
                {!isUploadingThis && (
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => handleTakePhoto(type)}
                      disabled={uploading}
                      className="flex-1 flex-row justify-center items-center py-2 px-2 bg-neutral-50 rounded-xl border border-neutral-200 active:bg-neutral-100"
                    >
                      <Camera size={12} color="#D4AF37" />
                      <Text className="text-neutral-800 font-bold text-[9px] ml-1">Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleBrowseFiles(type)}
                      disabled={uploading}
                      className="flex-1 flex-row justify-center items-center py-2 px-2 bg-neutral-50 rounded-xl border border-neutral-200 active:bg-neutral-100"
                    >
                      <FolderOpen size={12} color="#D4AF37" />
                      <Text className="text-neutral-800 font-bold text-[9px] ml-1">Browse Files</Text>
                    </TouchableOpacity>
                    {status === 'completed' && (
                      <TouchableOpacity
                        onPress={() => handleRemoveFile(type)}
                        disabled={uploading}
                        className="flex-row justify-center items-center py-2 px-2.5 bg-red-50/50 rounded-xl border border-red-100/55 active:bg-red-50"
                      >
                        <Trash2 size={12} color="#EF4444" />
                        <Text className="text-red-600 font-bold text-[9px] ml-1">Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Done Button */}
      <View className="px-6 py-4 border-t border-neutral-100 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-full bg-neutral-900 rounded-full py-4 items-center"
        >
          <Text className="text-white font-bold text-sm tracking-wider uppercase">
            All Uploads Done
          </Text>
        </TouchableOpacity>
      </View>
      {/* Web Camera Capture Modal */}
      {Platform.OS === 'web' && (
        <Modal
          visible={webCamVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={stopWebCam}
        >
          <View className="flex-1 bg-black/85 justify-center items-center p-6">
            <View className="bg-white w-full max-w-md rounded-3xl p-6 border border-neutral-100 shadow-xl items-center">
              {/* Header */}
              <View className="flex-row justify-between items-center w-full mb-4">
                <View>
                  <Text className="text-neutral-900 font-extrabold text-base">Live Camera Capture</Text>
                  <Text className="text-gray-400 text-[9px] font-bold uppercase tracking-wider mt-0.5">
                    Document: {webCamType}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={stopWebCam}
                  className="bg-neutral-150 p-1.5 rounded-full"
                >
                  <Text className="text-[10px] font-bold text-gray-500 px-1">X</Text>
                </TouchableOpacity>
              </View>

              {/* Video Preview Container */}
              <View className="w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-neutral-250 mb-5 relative justify-center items-center">
                <video 
                  id="webcam-video" 
                  autoPlay 
                  playsInline 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3 w-full">
                <TouchableOpacity
                  onPress={stopWebCam}
                  className="flex-1 border border-neutral-200 py-3.5 rounded-2xl items-center justify-center active:bg-neutral-50"
                >
                  <Text className="text-neutral-950 font-bold text-xs uppercase tracking-wider">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={capturePhoto}
                  className="flex-1 bg-neutral-900 py-3.5 rounded-2xl items-center justify-center active:opacity-90 shadow-sm"
                >
                  <Text className="text-white font-bold text-xs uppercase tracking-wider">Capture</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Full-Screen Image Preview Modal */}
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
