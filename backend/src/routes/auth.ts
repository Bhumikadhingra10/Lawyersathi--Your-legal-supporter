import { Router } from 'express';
import { dbGet, dbRun } from '../db/db';

const router = Router();

// Interfaces
interface DBUser {
  uid: string;
  email: string | null;
  phone_number: string | null;
  display_name: string | null;
  photo_url: string | null;
  gender: string | null;
  role: string;
}

// Helper to generate custom user UID
const generateUid = (prefix: string) => {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}`;
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, displayName } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check if user exists
    let user = await dbGet<DBUser>('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      // Create user if not exists
      const uid = generateUid('u');
      await dbRun(
        'INSERT INTO users (uid, email, display_name, role) VALUES (?, ?, ?, ?)',
        [uid, email, displayName || email, 'client']
      );
      user = await dbGet<DBUser>('SELECT * FROM users WHERE uid = ?', [uid]);
    }

    res.json({ user });
  } catch (error: any) {
    console.error('Error during email login:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, displayName, gender } = req.body;
  if (!email || !displayName) {
    return res.status(400).json({ error: 'Email and Name are required' });
  }

  try {
    let user = await dbGet<DBUser>('SELECT * FROM users WHERE email = ?', [email]);
    if (user) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const uid = generateUid('u');
    await dbRun(
      'INSERT INTO users (uid, email, display_name, gender, role) VALUES (?, ?, ?, ?, ?)',
      [uid, email, displayName, gender || null, 'client']
    );

    user = await dbGet<DBUser>('SELECT * FROM users WHERE uid = ?', [uid]);
    res.json({ user });
  } catch (error: any) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// POST /api/auth/phone-login
router.post('/phone-login', async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  // Simulate sending SMS
  console.log(`[SMS OTP Server] Sending OTP code 123456 to ${phoneNumber}`);
  res.json({ success: true, message: 'OTP sent successfully (mock code: 123456)' });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { otp, displayName, gender, phoneNumber } = req.body;

  if (!otp) {
    return res.status(400).json({ error: 'OTP code is required' });
  }

  // For testing/mock compatibility, allow '123456' or any 6-digit OTP
  if (otp !== '123456' && otp.length !== 6) {
    return res.status(400).json({ error: 'Invalid OTP code. Please enter 123456 or any 6-digit code for testing.' });
  }

  const formattedPhone = phoneNumber ? (phoneNumber.startsWith('+91') ? phoneNumber : '+91 ' + phoneNumber) : '+91 98765 43210';

  try {
    // Check if user exists by phone
    let user = await dbGet<DBUser>('SELECT * FROM users WHERE phone_number = ?', [formattedPhone]);

    if (!user) {
      // Create user if not exists
      const uid = generateUid('u');
      await dbRun(
        'INSERT INTO users (uid, phone_number, display_name, gender, role) VALUES (?, ?, ?, ?, ?)',
        [uid, formattedPhone, displayName || 'New LawyerSathi Client', gender || null, 'client']
      );
      user = await dbGet<DBUser>('SELECT * FROM users WHERE uid = ?', [uid]);
    }

    res.json({ user });
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// PUT /api/auth/photo
router.put('/photo', async (req, res) => {
  const { uid, photoURL } = req.body;
  if (!uid) {
    return res.status(400).json({ error: 'User UID is required' });
  }

  try {
    await dbRun('UPDATE users SET photo_url = ? WHERE uid = ?', [photoURL, uid]);
    const user = await dbGet<DBUser>('SELECT * FROM users WHERE uid = ?', [uid]);
    res.json({ success: true, user });
  } catch (error: any) {
    console.error('Error updating photo:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

export default router;
