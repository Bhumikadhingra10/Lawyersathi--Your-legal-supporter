// Import actual firebase SDK modules if available in package.json
// For testing and quick-start, we export simple mock services that replicate real firebase behaviors.
// In a real production deployment, run `npm install firebase` and uncomment the imports below.

/*
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "lawyersathi.firebaseapp.com",
  projectId: "lawyersathi",
  storageBucket: "lawyersathi.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
*/

export const firebaseAuth = {
  signInWithGoogle: async (email?: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const finalEmail = email || 'google.client@gmail.com';
    const emailPart = finalEmail.split('@')[0];
    const displayName = emailPart.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    return {
      user: {
        uid: 'g_user_' + Math.random().toString(36).substr(2, 9),
        email: finalEmail,
        displayName: displayName,
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=crop&w=100&h=100&q=80',
      }
    };
  },
  
  sendPhoneOTP: async (phoneNumber: string) => {
    console.log(`[Firebase SMS Mock] Sending OTP to ${phoneNumber}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 'mock-verification-id';
  },

  verifyPhoneOTP: async (verificationId: string, otp: string) => {
    console.log(`[Firebase SMS Mock] Verifying OTP ${otp} for verification ID ${verificationId}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (otp === '123456' || otp.length === 6) {
      return {
        user: {
          uid: 'p_user_' + Math.random().toString(36).substr(2, 9),
          phoneNumber: '+91 98765 43210',
          displayName: 'Phone Client Test',
          email: null,
          photoURL: null
        }
      };
    }
    throw new Error('Invalid OTP code. Please enter 123456 or any 6-digit code for testing.');
  }
};

export const firebaseStorage = {
  uploadFile: async (path: string, fileUri: string, onProgress?: (progress: number) => void) => {
    console.log(`[Firebase Storage Mock] Uploading file from ${fileUri} to ${path}`);
    
    // Simulate upload progress
    for (let progress = 10; progress <= 100; progress += 30) {
      if (onProgress) onProgress(Math.min(progress, 100));
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // For live mock previews, return the actual local fileUri (like base64 data URL) so the user can preview the uploaded image in real time!
    return fileUri;
  }
};

export const firebaseFirestore = {
  saveBooking: async (bookingData: any) => {
    console.log('[Firebase Firestore Mock] Saving booking:', bookingData);
    await new Promise(resolve => setTimeout(resolve, 800));
    return true;
  },
  
  getUserBookings: async (userId: string) => {
    console.log(`[Firebase Firestore Mock] Querying bookings for user ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return [];
  }
};
