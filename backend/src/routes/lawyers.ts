import { Router } from 'express';
import { dbAll, dbRun, dbGet } from '../db/db';

const router = Router();

// Interfaces
interface DBLawyerApplication {
  name: string;
  email: string;
  phone: string;
  experience: string | null;
  bar_council_id: string | null;
  resume_uri: string | null;
  status: string;
  created_at: string;
}

// GET /api/lawyers
// Retrieves all registered lawyer applications
router.get('/', async (req, res) => {
  try {
    const apps = await dbAll<DBLawyerApplication>('SELECT * FROM lawyer_applications ORDER BY created_at DESC');
    
    // Map database snake_case fields to React Native camelCase expectations
    const formatted = apps.map(app => ({
      name: app.name,
      email: app.email,
      phone: app.phone,
      experience: app.experience,
      barCouncilId: app.bar_council_id,
      resumeUri: app.resume_uri,
      status: app.status,
      createdAt: app.created_at
    }));

    res.json(formatted);
  } catch (error: any) {
    console.error('Error fetching lawyer applications:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// POST /api/lawyers
// Submits a new lawyer registration application
router.post('/', async (req, res) => {
  const { name, email, phone, experience, barCouncilId, resumeUri } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'name, email, and phone are required fields' });
  }

  try {
    // Check if application with email already exists
    const existing = await dbGet<DBLawyerApplication>('SELECT * FROM lawyer_applications WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'An application with this email has already been submitted.' });
    }

    const createdAt = new Date().toISOString();
    await dbRun(
      `INSERT INTO lawyer_applications (name, email, phone, experience, bar_council_id, resume_uri, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, experience || null, barCouncilId || null, resumeUri || null, 'pending', createdAt]
    );

    res.json({
      success: true,
      application: {
        name,
        email,
        phone,
        experience,
        barCouncilId,
        resumeUri,
        status: 'pending',
        createdAt
      }
    });
  } catch (error: any) {
    console.error('Error submitting lawyer application:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// DELETE /api/lawyers/:email
// Removes a lawyer application
router.delete('/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const existing = await dbGet<DBLawyerApplication>('SELECT * FROM lawyer_applications WHERE email = ?', [email]);
    if (!existing) {
      return res.status(404).json({ error: 'Application not found' });
    }

    await dbRun('DELETE FROM lawyer_applications WHERE email = ?', [email]);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting lawyer application:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

export default router;
