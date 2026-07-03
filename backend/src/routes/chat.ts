import { Router } from 'express';
import { dbAll, dbRun } from '../db/db';

const router = Router();

// Interfaces
interface DBChatMessage {
  id: string;
  booking_id: string | null;
  text: string;
  sender: string;
  created_at: string;
}

// GET /api/chat
// Fetches the chat messages
router.get('/', async (req, res) => {
  try {
    const messages = await dbAll<DBChatMessage>('SELECT * FROM chat_messages ORDER BY created_at ASC');
    
    // Format response to fit frontend structures
    const formatted = messages.map(m => ({
      id: m.id,
      bookingId: m.booking_id,
      text: m.text,
      sender: m.sender,
      createdAt: m.created_at
    }));

    // If database is empty, return a default welcome message
    if (formatted.length === 0) {
      const defaultMsg = {
        id: 'init_1',
        text: "Hello! I am your partner advocate. How can I assist you with your marriage registration or legal requirements today?",
        sender: 'advocate',
        createdAt: new Date().toISOString()
      };
      return res.json([defaultMsg]);
    }

    res.json(formatted);
  } catch (error: any) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// POST /api/chat
// Saves a new chat message
router.post('/', async (req, res) => {
  const { text, sender, bookingId } = req.body;

  if (!text || !sender) {
    return res.status(400).json({ error: 'text and sender are required' });
  }

  const id = 'chat_' + Math.random().toString(36).substring(2, 11);
  const createdAt = new Date().toISOString();

  try {
    await dbRun(
      'INSERT INTO chat_messages (id, booking_id, text, sender, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, bookingId || null, text, sender, createdAt]
    );

    res.json({
      success: true,
      message: {
        id,
        bookingId: bookingId || null,
        text,
        sender,
        createdAt
      }
    });
  } catch (error: any) {
    console.error('Error saving chat message:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// POST /api/chat/clear
// Clears chat message history
router.post('/clear', async (req, res) => {
  try {
    await dbRun('DELETE FROM chat_messages');
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error clearing chat:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

export default router;
