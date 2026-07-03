import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Helper to determine base URL depending on platform & environment
export const getBaseUrl = () => {
  // Use environment variable if defined (for production deployment)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // If running in Expo Go or development, we can try to extract host IP
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000`;
  }
  
  // Platform fallback for simulators
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }
  
  return 'http://localhost:5000';
};

export const BASE_URL = getBaseUrl();

// Helper for fetch requests
async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! Status: ${response.status}`);
    }
    
    return data;
  } catch (error: any) {
    console.error(`API Request to ${endpoint} failed:`, error);
    throw error;
  }
}

// Authentication endpoints
export const apiAuth = {
  login: async (email: string, displayName?: string) => {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, displayName }),
    });
  },
  
  signup: async (email: string, displayName: string, gender?: string) => {
    return request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, displayName, gender }),
    });
  },
  
  phoneLogin: async (phoneNumber: string) => {
    return request('/api/auth/phone-login', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  },
  
  verifyOtp: async (otp: string, displayName?: string, gender?: string, phoneNumber?: string) => {
    return request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ otp, displayName, gender, phoneNumber }),
    });
  },
  
  updatePhoto: async (uid: string, photoURL: string) => {
    return request('/api/auth/photo', {
      method: 'PUT',
      body: JSON.stringify({ uid, photoURL }),
    });
  }
};

// Bookings & Documents endpoints
export const apiBookings = {
  getBookings: async (userId: string) => {
    return request(`/api/bookings/${userId}`);
  },
  
  createBooking: async (userId: string, packageName: string, amount: number) => {
    return request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ userId, packageName, amount }),
    });
  },
  
  updateBooking: async (bookingId: string, brideName: string, groomName: string) => {
    return request(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify({ brideName, groomName }),
    });
  },
  
  payBooking: async (bookingId: string, paymentId: string) => {
    return request(`/api/bookings/${bookingId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ paymentId }),
    });
  },
  
  upgradeBooking: async (bookingId: string, paymentId: string) => {
    return request(`/api/bookings/${bookingId}/upgrade`, {
      method: 'POST',
      body: JSON.stringify({ paymentId }),
    });
  },
  
  advanceBooking: async (bookingId: string) => {
    return request(`/api/bookings/${bookingId}/advance`, {
      method: 'POST',
    });
  },
  
  uploadDocument: async (bookingId: string, type: string, fileUri: string, name: string) => {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('name', name);
    
    // For React Native, FormData file attachment requires this specific object structure:
    const fileType = fileUri.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
    
    formData.append('file', {
      uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
      type: fileType,
      name: name || (fileUri.endsWith('.pdf') ? 'document.pdf' : 'document.jpg'),
    } as any);

    const url = `${BASE_URL}/api/bookings/${bookingId}/document`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          // Do NOT set Content-Type header when uploading FormData in React Native/Web; let the browser/fetch client set the boundary automatically!
        },
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload document');
      }
      return data;
    } catch (error) {
      console.error('Document upload API failed:', error);
      throw error;
    }
  },
  
  removeDocument: async (bookingId: string, type: string) => {
    return request(`/api/bookings/${bookingId}/document/${type}`, {
      method: 'DELETE',
    });
  }
};

// Chat endpoints
export const apiChat = {
  getMessages: async () => {
    return request('/api/chat');
  },
  
  sendMessage: async (text: string, sender: 'user' | 'advocate', bookingId?: string) => {
    return request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ text, sender, bookingId }),
    });
  },
  
  clearChat: async () => {
    return request('/api/chat/clear', {
      method: 'POST',
    });
  }
};

// Lawyers/Advocates Application endpoints
export const apiLawyers = {
  getApplications: async () => {
    return request('/api/lawyers');
  },
  
  addApplication: async (application: {
    name: string;
    email: string;
    phone: string;
    experience?: string;
    barCouncilId?: string;
    resumeUri?: string;
  }) => {
    return request('/api/lawyers', {
      method: 'POST',
      body: JSON.stringify(application),
    });
  },
  
  deleteApplication: async (email: string) => {
    return request(`/api/lawyers/${email}`, {
      method: 'DELETE',
    });
  }
};
