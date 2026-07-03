import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { initDb } from './db/db';

// Import Routes
import authRoutes from './routes/auth';
import bookingRoutes from './routes/bookings';
import chatRoutes from './routes/chat';
import lawyerRoutes from './routes/lawyers';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure upload directories exist
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Static folder for uploaded documents/images
app.use('/uploads', express.static(uploadDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/lawyers', lawyerRoutes);

// Root Route
app.get('/', (req, res) => {
  res.send('<h1>LawyerSathi Backend API Server is running!</h1><p>Use <code>/health</code> to check status.</p>');
});

// Simple Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'LawyerSathi backend is running smoothly' });
});

// Initialize DB and Start Server
const startServer = async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
