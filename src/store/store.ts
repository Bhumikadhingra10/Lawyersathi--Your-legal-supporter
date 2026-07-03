import { create } from 'zustand';
import { User, Booking, BookingStatus, DocumentUpload } from '../types';
import { apiAuth, apiBookings, apiChat, apiLawyers, BASE_URL } from '../services/api';

// Map database User entity (snake_case) to client User interface (camelCase)
const mapUser = (dbUser: any): User => {
  if (!dbUser) return null as any;
  return {
    uid: dbUser.uid,
    email: dbUser.email || null,
    phoneNumber: dbUser.phone_number || null,
    displayName: dbUser.display_name || null,
    photoURL: dbUser.photo_url || null,
    gender: dbUser.gender || null,
  };
};

interface AppState {
  // Auth
  user: User | null;
  isLoading: boolean;
  error: string | null;
  loginWithEmail: (email: string, displayName: string) => Promise<void>;
  signupWithEmail: (email: string, displayName: string, gender?: string) => Promise<void>;
  loginWithPhone: (phoneNumber: string) => Promise<void>;
  verifyOTP: (otp: string, displayName?: string, gender?: string, phoneNumber?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserPhoto: (photoURL: string | null) => void;

  // Booking
  bookings: Booking[];
  currentBookingId: string | null;
  fetchBookings: (userId: string) => Promise<void>;
  createBooking: (packageName: string, amount: number) => string;
  updateBookingDetails: (bookingId: string, brideName: string, groomName: string) => Promise<void>;
  uploadDocument: (bookingId: string, type: DocumentUpload['type'], uri: string, name: string) => Promise<void>;
  removeDocument: (bookingId: string, type: DocumentUpload['type']) => Promise<void>;
  payBooking: (bookingId: string, paymentId: string) => Promise<void>;
  advanceBookingStatus: (bookingId: string) => Promise<void>;
  upgradeBooking: (bookingId: string, paymentId: string) => Promise<void>;
  
  // App
  selectedLocation: string;
  setLocation: (location: string) => void;

  // Lawyer Applications
  lawyerApplications: any[];
  fetchLawyerApplications: () => Promise<void>;
  addLawyerApplication: (app: any) => Promise<void>;
  deleteLawyerApplication: (email: string) => Promise<void>;

  // Advocate Chat
  chatMessages: any[];
  fetchChatMessages: () => Promise<void>;
  sendChatMessage: (text: string, sender: 'user' | 'advocate') => Promise<void>;
  clearChat: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  selectedLocation: 'Delhi NCR',
  bookings: [],
  currentBookingId: null,
  lawyerApplications: [],
  chatMessages: [],

  loginWithEmail: async (email, displayName) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiAuth.login(email, displayName);
      const mappedUser = mapUser(res.user);
      set({ user: mappedUser, isLoading: false });
      
      // Load user records upon successful authentication
      await get().fetchBookings(mappedUser.uid);
      await get().fetchChatMessages();
      await get().fetchLawyerApplications();
    } catch (err: any) {
      set({ error: err.message || 'Login failed', isLoading: false });
    }
  },

  signupWithEmail: async (email, displayName, gender) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiAuth.signup(email, displayName, gender);
      const mappedUser = mapUser(res.user);
      set({ user: mappedUser, isLoading: false });
      
      // Load user records upon successful authentication
      await get().fetchBookings(mappedUser.uid);
      await get().fetchChatMessages();
      await get().fetchLawyerApplications();
    } catch (err: any) {
      set({ error: err.message || 'Signup failed', isLoading: false });
    }
  },

  loginWithPhone: async (phoneNumber) => {
    set({ isLoading: true, error: null });
    try {
      await apiAuth.phoneLogin(phoneNumber);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'OTP Send failed', isLoading: false });
    }
  },

  verifyOTP: async (otp, displayName, gender, phoneNumber) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiAuth.verifyOtp(otp, displayName, gender, phoneNumber);
      const mappedUser = mapUser(res.user);
      set({ user: mappedUser, isLoading: false });
      
      // Load user records upon successful authentication
      await get().fetchBookings(mappedUser.uid);
      await get().fetchChatMessages();
      await get().fetchLawyerApplications();
    } catch (err: any) {
      set({ error: err.message || 'OTP Verification failed', isLoading: false });
    }
  },

  logout: async () => {
    set({ user: null, bookings: [], currentBookingId: null, chatMessages: [], lawyerApplications: [] });
  },

  updateUserPhoto: async (photoURL) => {
    const currentUser = get().user;
    if (!currentUser || !photoURL) return;

    try {
      const res = await apiAuth.updatePhoto(currentUser.uid, photoURL);
      if (res.success) {
        set({ user: mapUser(res.user) });
      }
    } catch (err) {
      console.error('Failed to update user photo:', err);
    }
  },

  setLocation: (selectedLocation) => set({ selectedLocation }),

  // Bookings Methods
  fetchBookings: async (userId) => {
    try {
      const bookings = await apiBookings.getBookings(userId);
      const resolvedBookings = bookings.map((b: any) => ({
        ...b,
        documents: b.documents.map((d: any) => ({
          ...d,
          uri: d.uri.startsWith('/uploads/') ? `${BASE_URL}${d.uri}` : d.uri
        }))
      }));
      set({ bookings: resolvedBookings });
      if (resolvedBookings.length > 0 && !get().currentBookingId) {
        set({ currentBookingId: resolvedBookings[0].id });
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  },

  createBooking: (packageName, amount) => {
    const bookingId = 'B_' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const packageId = packageName === 'Complete Court Marriage Package' ? 'PKG1' : 'PKG2';
    const status = 'Documents Uploaded';
    const createdAt = new Date().toISOString().split('T')[0];
    
    const newBooking: Booking = {
      id: bookingId,
      userId: get().user?.uid || 'anonymous',
      packageId,
      packageName,
      status,
      brideName: '',
      groomName: '',
      documents: [],
      sdmId: null,
      sdmName: null,
      sdmAddress: null,
      appointmentDate: null,
      appointmentSlot: null,
      paymentStatus: 'Unpaid',
      paymentId: null,
      amount,
      advocateName: null,
      advocatePhone: null,
      createdAt,
    };
    
    // Optimistically add the booking locally
    set(state => ({
      bookings: [newBooking, ...state.bookings],
      currentBookingId: bookingId
    }));

    // Persist booking asynchronously in the background
    const currentUser = get().user;
    if (currentUser) {
      apiBookings.createBooking(currentUser.uid, packageName, amount).catch(err => {
        console.error('Failed to persist new booking on backend:', err);
      });
    }

    return bookingId;
  },

  updateBookingDetails: async (bookingId, brideName, groomName) => {
    // Update local state immediately
    set(state => ({
      bookings: state.bookings.map(b =>
        b.id === bookingId ? { ...b, brideName, groomName } : b
      )
    }));

    try {
      await apiBookings.updateBooking(bookingId, brideName, groomName);
    } catch (err) {
      console.error('Failed to sync booking details to backend:', err);
    }
  },

  uploadDocument: async (bookingId, type, uri, name) => {
    try {
      const res = await apiBookings.uploadDocument(bookingId, type, uri, name);
      if (res.success && res.document) {
        const resolvedDoc = {
          ...res.document,
          uri: res.document.uri.startsWith('/uploads/') ? `${BASE_URL}${res.document.uri}` : res.document.uri
        };
        set(state => ({
          bookings: state.bookings.map(b => {
            if (b.id !== bookingId) return b;
            
            const cleanedDocs = b.documents.filter(doc => doc.type !== type);
            return {
              ...b,
              documents: [...cleanedDocs, resolvedDoc]
            };
          })
        }));
      }
    } catch (err) {
      console.error('Failed to upload document:', err);
    }
  },

  removeDocument: async (bookingId, type) => {
    // Remove local representation
    set(state => ({
      bookings: state.bookings.map(b => {
        if (b.id !== bookingId) return b;
        return {
          ...b,
          documents: b.documents.filter(doc => doc.type !== type)
        };
      })
    }));

    try {
      await apiBookings.removeDocument(bookingId, type);
    } catch (err) {
      console.error('Failed to remove document from backend:', err);
    }
  },

  payBooking: async (bookingId, paymentId) => {
    set(state => ({
      bookings: state.bookings.map(b =>
        b.id === bookingId ? { ...b, paymentStatus: 'Paid', paymentId } : b
      )
    }));

    try {
      await apiBookings.payBooking(bookingId, paymentId);
    } catch (err) {
      console.error('Failed to record payment in backend:', err);
    }
  },

  upgradeBooking: async (bookingId, paymentId) => {
    set(state => ({
      bookings: state.bookings.map(b =>
        b.id === bookingId ? { 
          ...b, 
          packageName: 'Complete Court Marriage Package', 
          amount: 14999,
          paymentId: paymentId
        } : b
      )
    }));

    try {
      await apiBookings.upgradeBooking(bookingId, paymentId);
    } catch (err) {
      console.error('Failed to record booking upgrade in backend:', err);
    }
  },

  advanceBookingStatus: async (bookingId) => {
    try {
      const res = await apiBookings.advanceBooking(bookingId);
      if (res.success) {
        const currentUser = get().user;
        if (currentUser) {
          await get().fetchBookings(currentUser.uid);
        }
      }
    } catch (err) {
      console.error('Failed to advance booking status in backend:', err);
    }
  },

  // Lawyer Application Methods
  fetchLawyerApplications: async () => {
    try {
      const lawyerApplications = await apiLawyers.getApplications();
      set({ lawyerApplications });
    } catch (err) {
      console.error('Failed to fetch lawyer applications:', err);
    }
  },

  addLawyerApplication: async (app) => {
    try {
      const res = await apiLawyers.addApplication(app);
      if (res.success && res.application) {
        set(state => ({
          lawyerApplications: [...state.lawyerApplications, res.application]
        }));
      }
    } catch (err) {
      console.error('Failed to submit lawyer application to backend:', err);
    }
  },

  deleteLawyerApplication: async (email) => {
    set(state => ({
      lawyerApplications: state.lawyerApplications.filter(app => app.email !== email)
    }));

    try {
      await apiLawyers.deleteApplication(email);
    } catch (err) {
      console.error('Failed to withdraw lawyer application from backend:', err);
    }
  },

  // Chat Methods
  fetchChatMessages: async () => {
    try {
      const chatMessages = await apiChat.getMessages();
      set({ chatMessages });
    } catch (err) {
      console.error('Failed to fetch chat messages:', err);
    }
  },

  sendChatMessage: async (text, sender) => {
    // Generate transient message locally first for responsive UI
    const tempId = 'chat_temp_' + Math.random().toString(36).substring(2, 9);
    const newMsg = {
      id: tempId,
      text,
      sender,
      createdAt: new Date().toISOString()
    };
    
    set(state => ({ chatMessages: [...state.chatMessages, newMsg] }));

    try {
      const res = await apiChat.sendMessage(text, sender, get().currentBookingId || undefined);
      if (res.success && res.message) {
        // Swap temp message with real persisted message
        set(state => ({
          chatMessages: state.chatMessages.map(m => m.id === tempId ? res.message : m)
        }));
      }
    } catch (err) {
      console.error('Failed to save chat message in backend:', err);
    }
  },

  clearChat: async () => {
    try {
      await apiChat.clearChat();
      set({
        chatMessages: [
          {
            id: 'init_1',
            text: "Hello! I am your partner advocate. How can I assist you with your marriage registration or legal requirements today?",
            sender: 'advocate',
            createdAt: new Date().toISOString()
          }
        ]
      });
    } catch (err) {
      console.error('Failed to reset chat session on backend:', err);
    }
  }
}));
