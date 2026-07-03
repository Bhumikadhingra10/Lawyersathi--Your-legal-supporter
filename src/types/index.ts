export interface User {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  photoURL: string | null;
  gender?: string | null;
}

export type BookingStatus =
  | 'Documents Uploaded'
  | 'Verification Complete'
  | 'Advocate Assigned'
  | 'Appointment Scheduled'
  | 'Marriage Conducted'
  | 'Certificate Processing'
  | 'Completed';

export interface DocumentUpload {
  id: string;
  type: 'Bride Identity Proof' | 'Groom Identity Proof' | 'Address Proof' | 'Age Proof' | 'Affidavits' | 'Marriage Documents' | 'Witnesses';
  name: string;
  uri: string;
  uploadedAt: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
}

export interface Booking {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  status: BookingStatus;
  brideName: string;
  groomName: string;
  documents: DocumentUpload[];
  sdmId: string | null;
  sdmName: string | null;
  sdmAddress: string | null;
  appointmentDate: string | null;
  appointmentSlot: string | null;
  paymentStatus: 'Unpaid' | 'Paid';
  paymentId: string | null;
  amount: number;
  advocateName: string | null;
  advocatePhone: string | null;
  createdAt: string;
}



export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  createdAt: string;
}

export interface LegalService {
  id: string;
  title: string;
  subtitle?: string;
  iconName: string;
  route: string;
}
