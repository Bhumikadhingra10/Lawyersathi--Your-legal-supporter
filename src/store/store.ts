import { create } from 'zustand';
import { User, Booking, BookingStatus, DocumentUpload } from '../types';

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
  createBooking: (packageName: string, amount: number) => string;
  updateBookingDetails: (bookingId: string, brideName: string, groomName: string) => void;
  uploadDocument: (bookingId: string, type: DocumentUpload['type'], uri: string, name: string) => void;
  removeDocument: (bookingId: string, type: DocumentUpload['type']) => void;
  payBooking: (bookingId: string, paymentId: string) => void;
  advanceBookingStatus: (bookingId: string) => void;
  upgradeBooking: (bookingId: string, paymentId: string) => void;
  
  // App
  selectedLocation: string;
  setLocation: (location: string) => void;
  

  // Lawyer Applications
  lawyerApplications: any[];
  addLawyerApplication: (app: any) => void;
  deleteLawyerApplication: (email: string) => void;

  // Advocate Chat
  chatMessages: any[];
  sendChatMessage: (text: string, sender: 'user' | 'advocate') => void;
  clearChat: () => void;
}



export const useStore = create<AppState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  selectedLocation: 'Delhi NCR',
  bookings: [],
  currentBookingId: null,

  loginWithEmail: async (email, displayName) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({
        user: {
          uid: 'u_' + Math.random().toString(36).substr(2, 9),
          email,
          phoneNumber: null,
          displayName: displayName || email,
          photoURL: null,
        },
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Login failed', isLoading: false });
    }
  },

  signupWithEmail: async (email, displayName, gender) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({
        user: {
          uid: 'u_' + Math.random().toString(36).substr(2, 9),
          email,
          phoneNumber: null,
          displayName,
          photoURL: null,
          gender: gender || null,
        },
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Signup failed', isLoading: false });
    }
  },

  loginWithPhone: async (phoneNumber) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'OTP Send failed', isLoading: false });
    }
  },

  verifyOTP: async (otp, displayName, gender, phoneNumber) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({
        user: {
          uid: 'u_' + Math.random().toString(36).substr(2, 9),
          email: null,
          phoneNumber: phoneNumber ? (phoneNumber.startsWith('+91') ? phoneNumber : '+91 ' + phoneNumber) : '+91 98765 43210',
          displayName: displayName || 'New LawyerSathi Client',
          photoURL: null,
          gender: gender || null,
        },
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'OTP Verification failed', isLoading: false });
    }
  },

  logout: async () => {
    set({ user: null, bookings: [], currentBookingId: null });
  },

  updateUserPhoto: (photoURL) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: {
          ...currentUser,
          photoURL
        }
      });
    }
  },

  setLocation: (selectedLocation) => set({ selectedLocation }),

  createBooking: (packageName, amount) => {
    const bookingId = 'B_' + Math.random().toString(36).substr(2, 5).toUpperCase();
    const newBooking: Booking = {
      id: bookingId,
      userId: get().user?.uid || 'anonymous',
      packageId: packageName === 'Complete Court Marriage Package' ? 'PKG1' : 'PKG2',
      packageName,
      status: 'Documents Uploaded',
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
      createdAt: new Date().toISOString().split('T')[0],
    };
    set(state => ({
      bookings: [newBooking, ...state.bookings],
      currentBookingId: bookingId
    }));
    return bookingId;
  },

  updateBookingDetails: (bookingId, brideName, groomName) => {
    set(state => ({
      bookings: state.bookings.map(b =>
        b.id === bookingId ? { ...b, brideName, groomName } : b
      )
    }));
  },

  uploadDocument: (bookingId, type, uri, name) => {
    set(state => ({
      bookings: state.bookings.map(b => {
        if (b.id !== bookingId) return b;
        
        // Remove existing document of the same type if it exists
        const cleanedDocs = b.documents.filter(doc => doc.type !== type);
        
        const newDoc: DocumentUpload = {
          id: 'doc_' + Math.random().toString(36).substr(2, 9),
          type,
          name,
          uri,
          uploadedAt: new Date().toISOString().split('T')[0],
          progress: 100,
          status: 'completed',
          
        };
        
        return {
          ...b,
          documents: [...cleanedDocs, newDoc]
        };
      })
    }));
  },

  removeDocument: (bookingId, type) => {
    set(state => ({
      bookings: state.bookings.map(b => {
        if (b.id !== bookingId) return b;
        return {
          ...b,
          documents: b.documents.filter(doc => doc.type !== type)
        };
      })
    }));
  },



  payBooking: (bookingId, paymentId) => {
    set(state => ({
      bookings: state.bookings.map(b =>
        b.id === bookingId ? { ...b, paymentStatus: 'Paid', paymentId } : b
      )
    }));
  },

  upgradeBooking: (bookingId, paymentId) => {
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
  },

  advanceBookingStatus: (bookingId) => {
    const stages: BookingStatus[] = [
      'Documents Uploaded',
      'Verification Complete',
      'Advocate Assigned',
      'Appointment Scheduled',
      'Marriage Conducted',
      'Certificate Processing',
      'Completed'
    ];
    
    set(state => ({
      bookings: state.bookings.map(b => {
        if (b.id !== bookingId) return b;
        const currentIndex = stages.indexOf(b.status);
        if (currentIndex < stages.length - 1) {
          return { ...b, status: stages[currentIndex + 1] };
        }
        return b;
      })
    }));
  },

  // Lawyer Applications
  lawyerApplications: [],
  addLawyerApplication: (app) => {
    set(state => ({ lawyerApplications: [...state.lawyerApplications, app] }));
  },
  deleteLawyerApplication: (email) => {
    set(state => ({
      lawyerApplications: state.lawyerApplications.filter(app => app.email !== email)
    }));
  },

  // Advocate Chat
  chatMessages: [
    {
      id: 'init_1',
      text: "Hello! I am your partner advocate. How can I assist you with your marriage registration or legal requirements today?",
      sender: 'advocate',
      createdAt: new Date().toISOString()
    }
  ],
  sendChatMessage: (text, sender) => {
    const newMsg = {
      id: 'chat_' + Math.random().toString(36).substr(2, 9),
      text,
      sender,
      createdAt: new Date().toISOString()
    };
    set(state => ({ chatMessages: [...state.chatMessages, newMsg] }));
  },
  clearChat: () => {
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
  }
}));
