import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { dbAll, dbGet, dbRun } from '../db/db';

const router = Router();

// Multer Storage Configuration for Document Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.resolve(__dirname, '../../uploads');
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Interfaces
interface DBBooking {
  id: string;
  user_id: string;
  package_id: string;
  package_name: string;
  status: string;
  bride_name: string;
  groom_name: string;
  appointment_date: string | null;
  appointment_slot: string | null;
  payment_status: string;
  payment_id: string | null;
  amount: number;
  advocate_name: string | null;
  advocate_phone: string | null;
  created_at: string;
}

interface DBDocument {
  id: string;
  booking_id: string;
  type: string;
  name: string;
  uri: string;
  status: string;
  uploaded_at: string;
}

// GET /api/bookings/:userId
// Returns list of bookings for user along with their associated uploaded documents
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const bookings = await dbAll<DBBooking>('SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    
    // Fetch and append documents for each booking
    const bookingsWithDocs = await Promise.all(
      bookings.map(async (booking) => {
        const documents = await dbAll<DBDocument>('SELECT * FROM documents WHERE booking_id = ?', [booking.id]);
        return {
          ...booking,
          // Rename database snake_case fields to React Native camelCase expectations
          userId: booking.user_id,
          packageId: booking.package_id,
          packageName: booking.package_name,
          brideName: booking.bride_name,
          groomName: booking.groom_name,
          appointmentDate: booking.appointment_date,
          appointmentSlot: booking.appointment_slot,
          paymentStatus: booking.payment_status,
          paymentId: booking.payment_id,
          advocateName: booking.advocate_name,
          advocatePhone: booking.advocate_phone,
          createdAt: booking.created_at,
          documents: documents.map(d => ({
            id: d.id,
            type: d.type,
            name: d.name,
            uri: d.uri,
            status: d.status,
            uploadedAt: d.uploaded_at,
            progress: 100 // default mock complete progress
          }))
        };
      })
    );

    res.json(bookingsWithDocs);
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// POST /api/bookings
// Create a new booking
router.post('/', async (req, res) => {
  const { userId, packageName, amount } = req.body;

  if (!userId || !packageName || amount === undefined) {
    return res.status(400).json({ error: 'userId, packageName, and amount are required' });
  }

  const bookingId = 'B_' + Math.random().toString(36).substring(2, 7).toUpperCase();
  const packageId = packageName === 'Complete Court Marriage Package' ? 'PKG1' : 'PKG2';
  const status = 'Documents Uploaded';
  const createdAt = new Date().toISOString().split('T')[0];

  try {
    await dbRun(
      `INSERT INTO bookings (id, user_id, package_id, package_name, status, bride_name, groom_name, payment_status, amount, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [bookingId, userId, packageId, packageName, status, '', '', 'Unpaid', amount, createdAt]
    );

    res.json({ success: true, bookingId });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// PUT /api/bookings/:id
// Update bride and groom details for booking
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { brideName, groomName } = req.body;

  try {
    const booking = await dbGet<DBBooking>('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await dbRun(
      'UPDATE bookings SET bride_name = ?, groom_name = ? WHERE id = ?',
      [brideName || '', groomName || '', id]
    );

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// POST /api/bookings/:id/pay
// Mark booking payment status as 'Paid'
router.post('/:id/pay', async (req, res) => {
  const { id } = req.params;
  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: 'paymentId is required' });
  }

  try {
    const booking = await dbGet<DBBooking>('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await dbRun(
      'UPDATE bookings SET payment_status = ?, payment_id = ? WHERE id = ?',
      ['Paid', paymentId, id]
    );

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error paying for booking:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// POST /api/bookings/:id/upgrade
// Upgrade the package to the premium tier and record payment
router.post('/:id/upgrade', async (req, res) => {
  const { id } = req.params;
  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: 'paymentId is required' });
  }

  try {
    const booking = await dbGet<DBBooking>('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await dbRun(
      `UPDATE bookings 
       SET package_name = ?, package_id = ?, amount = ?, payment_status = ?, payment_id = ? 
       WHERE id = ?`,
      ['Complete Court Marriage Package', 'PKG1', 14999, 'Paid', paymentId, id]
    );

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error upgrading booking:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// POST /api/bookings/:id/advance
// Progress the stage status of a booking (helper for workflow progression testing)
router.post('/:id/advance', async (req: Request, res: Response) => {
  const { id } = req.params;

  const stages = [
    'Documents Uploaded',
    'Verification Complete',
    'Advocate Assigned',
    'Appointment Scheduled',
    'Marriage Conducted',
    'Certificate Processing',
    'Completed'
  ];

  try {
    const booking = await dbGet<DBBooking>('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const currentIndex = stages.indexOf(booking.status);
    let nextStatus = booking.status;
    
    // Setup mock advocate details when transitioning
    let advocateUpdateSql = '';
    let advocateParams: any[] = [];

    if (currentIndex < stages.length - 1) {
      nextStatus = stages[currentIndex + 1];
      
      // If advancing to Advocate Assigned, populate advocate details
      if (nextStatus === 'Advocate Assigned') {
        advocateUpdateSql = ', advocate_name = ?, advocate_phone = ?';
        advocateParams = ['Adv. Rajesh Sharma', '+91 98989 12345'];
      } 
      // If advancing to Appointment Scheduled, populate appointment details
      else if (nextStatus === 'Appointment Scheduled') {
        advocateUpdateSql = ', appointment_date = ?, appointment_slot = ?';
        advocateParams = [
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
          '11:00 AM - 12:30 PM'
        ];
      }
    }

    await dbRun(
      `UPDATE bookings SET status = ? ${advocateUpdateSql} WHERE id = ?`,
      [nextStatus, ...advocateParams, id]
    );

    res.json({ success: true, status: nextStatus });
  } catch (error: any) {
    console.error('Error advancing booking status:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// POST /api/bookings/:id/document
// Uploads a document attachment (using Multer middleware)
router.post('/:id/document', upload.single('file'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type, name } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  if (!type || !name) {
    return res.status(400).json({ error: 'Document type and name are required' });
  }

  // Construct download URI that points to our backend upload server
  const serverPort = process.env.PORT || 5000;
  // Use a relative path or direct host URL (client should resolve dynamic base URL)
  const fileUri = `/uploads/${req.file.filename}`;

  const docId = 'doc_' + Math.random().toString(36).substring(2, 11);
  const uploadedAt = new Date().toISOString().split('T')[0];

  try {
    const booking = await dbGet<DBBooking>('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Remove older documents of same type if they exist
    const oldDoc = await dbGet<DBDocument>('SELECT * FROM documents WHERE booking_id = ? AND type = ?', [id, type]);
    if (oldDoc) {
      await dbRun('DELETE FROM documents WHERE id = ?', [oldDoc.id]);
      
      // Attempt to delete physical file
      const oldFilename = oldDoc.uri.split('/uploads/')[1];
      if (oldFilename) {
        const oldFilePath = path.resolve(__dirname, '../../uploads', oldFilename);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    }

    await dbRun(
      `INSERT INTO documents (id, booking_id, type, name, uri, status, uploaded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [docId, id, type, name, fileUri, 'completed', uploadedAt]
    );

    res.json({
      success: true,
      document: {
        id: docId,
        type,
        name,
        uri: fileUri,
        status: 'completed',
        uploadedAt,
        progress: 100
      }
    });
  } catch (error: any) {
    console.error('Error saving document:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// DELETE /api/bookings/:id/document/:type
// Removes a document from the booking
router.delete('/:id/document/:type', async (req, res) => {
  const { id, type } = req.params;

  try {
    const doc = await dbGet<DBDocument>('SELECT * FROM documents WHERE booking_id = ? AND type = ?', [id, type]);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete record from database
    await dbRun('DELETE FROM documents WHERE id = ?', [doc.id]);

    // Delete physical file from uploads folder
    const filename = doc.uri.split('/uploads/')[1];
    if (filename) {
      const filePath = path.resolve(__dirname, '../../uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

export default router;
