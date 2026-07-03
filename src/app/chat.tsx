import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Send, Trash2, HelpCircle, CheckCircle2 } from 'lucide-react-native';
import { useStore } from '../store/store';

const ADVOCATE_RESPONSES = [
  { keywords: ['hi', 'hello', 'hey', 'start'], text: 'Hello! I am your partner advocate. How can I assist you with your marriage registration today?' },
  { keywords: ['document', 'requirement', 'id', 'proof', 'aadhaar'], text: 'To register a marriage in Delhi, you generally need the Aadhaar Cards, Age Proofs (like birth certificate or school certificate), passport photos, and 2-3 witnesses with their IDs. You can upload these directly in the Documents section of this app!' },
  { keywords: ['price', 'cost', 'package', 'fees'], text: 'Our Marriage Registration package is ₹14,999 flat. It includes all government fees, documentation, affidavit drafting, and on-site representative support.' },
  { keywords: ['time', 'duration', 'how long'], text: 'Under the Hindu Marriage Act, it takes about 2-3 working days for verification and registration. Under the Special Marriage Act (direct court marriage), a 30-day public notice is legally required.' },
  { keywords: ['witness', 'how many'], text: 'For Hindu Marriage Act, you need 2 witnesses. For Special Marriage Act, you need 3 witnesses. They must bring their Aadhaar cards and address proofs.' }
];

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lawyerName?: string; avatar?: string }>();
  
  const chatMessages = useStore(state => state.chatMessages);
  const sendChatMessage = useStore(state => state.sendChatMessage);
  const clearChat = useStore(state => state.clearChat);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const lawyerName = params.lawyerName || 'Adv. Hitesh Sethi';
  const avatar = params.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=120&h=120&q=80';

  const faqChips = [
    'What documents do I need?',
    'How long does court marriage take?',
    'How many witnesses are needed?',
    'What is included in the package?'
  ];

  useEffect(() => {
    // Scroll to end on load
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const userText = inputVal.trim();
    sendChatMessage(userText, 'user');
    setInputVal('');
    
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 50);

    // Simulate advocate typing reply
    setIsTyping(true);
    setTimeout(() => {
      let replyText = `Thank you for your message. I am currently reviewing your query regarding "${userText}". I will assist you with the required registration details.`;
      const query = userText.toLowerCase();

      for (const item of ADVOCATE_RESPONSES) {
        if (item.keywords.some(keyword => query.includes(keyword))) {
          replyText = item.text;
          break;
        }
      }

      sendChatMessage(replyText, 'advocate');
      setIsTyping(false);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }, 1200);
  };

  const handleChipPress = (text: string) => {
    sendChatMessage(text, 'user');
    setIsTyping(true);
    setTimeout(() => {
      let replyText = `I will check the details for "${text}" and help you get started.`;
      const query = text.toLowerCase();

      for (const item of ADVOCATE_RESPONSES) {
        if (item.keywords.some(keyword => query.includes(keyword))) {
          replyText = item.text;
          break;
        }
      }

      sendChatMessage(replyText, 'advocate');
      setIsTyping(false);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
    >
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-12 pb-3 bg-white border-b border-neutral-100 flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="mr-3 p-1.5 bg-neutral-50 rounded-full border border-neutral-150"
            >
              <ChevronLeft size={16} color="#111111" />
            </TouchableOpacity>

            {/* Advocate Avatar */}
            <View className="w-9 h-9 rounded-full justify-center items-center overflow-hidden mr-3 relative border border-gold/15">
              <Image
                source={{ uri: avatar }}
                className="w-full h-full"
                contentFit="cover"
              />
              <View className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
            </View>
            
            <View className="flex-1">
              <Text className="text-neutral-900 font-extrabold text-sm leading-4" numberOfLines={1}>{lawyerName}</Text>
              <Text className="text-emerald-500 font-bold text-[9px] uppercase tracking-wider">Online • Advocate Partner</Text>
            </View>
          </View>
          
          <TouchableOpacity onPress={clearChat} className="p-2 ml-2">
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Scrollable Chat Area */}
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 px-6 pt-4"
          contentContainerStyle={{ paddingBottom: 20 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {chatMessages.map((message) => {
            const isUser = message.sender === 'user';
            return (
              <View 
                key={message.id}
                className={`flex-row mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <View className="w-6 h-6 rounded-full border border-gold/10 overflow-hidden mr-2">
                    <Image
                      source={{ uri: avatar }}
                      className="w-full h-full"
                      contentFit="cover"
                    />
                  </View>
                )}
                
                <View 
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${isUser ? 'bg-gold' : 'bg-neutral-100 border border-neutral-150'}`}
                >
                  <Text className={`text-xs leading-4.5 font-medium ${isUser ? 'text-white' : 'text-neutral-800'}`}>
                    {message.text}
                  </Text>
                </View>
              </View>
            );
          })}

          {isTyping && (
            <View className="flex-row items-center mb-4">
              <View className="w-6 h-6 rounded-full border border-gold/10 overflow-hidden mr-2">
                <Image
                  source={{ uri: avatar }}
                  className="w-full h-full"
                  contentFit="cover"
                />
              </View>
              <View className="bg-neutral-100 border border-neutral-150 rounded-2xl px-4 py-3 flex-row items-center gap-1.5">
                <ActivityIndicator size="small" color="#D4AF37" />
                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Advocate is typing...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Help FAQ Chips */}
        <View className="px-6 py-2 bg-white">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {faqChips.map(chip => (
              <TouchableOpacity
                key={chip}
                onPress={() => handleChipPress(chip)}
                className="flex-row items-center bg-amber-50/50 border border-gold/15 py-2 px-3 rounded-full mr-2"
              >
                <HelpCircle size={10} color="#D4AF37" className="mr-1" />
                <Text className="text-gold font-bold text-[9px]">{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Bottom Input Area */}
        <View className="px-6 py-3 border-t border-neutral-100 bg-white flex-row items-center gap-3">
          <View className="flex-1 bg-neutral-50 border border-neutral-200 rounded-full px-4 py-3 flex-row items-center">
            <TextInput
              value={inputVal}
              onChangeText={setInputVal}
              placeholder="Type message to advocate..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-neutral-800 text-xs font-semibold p-0"
              onSubmitEditing={handleSend}
            />
          </View>
          <TouchableOpacity 
            onPress={handleSend}
            className="w-10 h-10 bg-gold rounded-full justify-center items-center shadow-xs"
          >
            <Send size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
