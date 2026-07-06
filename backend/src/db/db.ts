import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lawyersathi';
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection and log database connection info
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL database:', err.message);
  } else {
    console.log('Connected to PostgreSQL database successfully');
    release();
  }
});

// Helper to translate sqlite placeholder '?' to postgres '$1', '$2', etc.
function convertSqliteToPg(sql: string): string {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

// Helper to run query with Promise (INSERT, UPDATE, DELETE)
export const dbRun = async (sql: string, params: any[] = []): Promise<{ id: number | string; changes: number }> => {
  const convertedSql = convertSqliteToPg(sql);
  const result = await pool.query(convertedSql, params);
  return { id: '', changes: result.rowCount || 0 };
};

// Helper to query all records with Promise
export const dbAll = async <T>(sql: string, params: any[] = []): Promise<T[]> => {
  const convertedSql = convertSqliteToPg(sql);
  const result = await pool.query(convertedSql, params);
  return result.rows as T[];
};

// Helper to query a single record with Promise
export const dbGet = async <T>(sql: string, params: any[] = []): Promise<T | null> => {
  const convertedSql = convertSqliteToPg(sql);
  const result = await pool.query(convertedSql, params);
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows[0] as T;
};

// Initialize Tables
export const initDb = async () => {
  try {
    // Users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        uid TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        phone_number TEXT UNIQUE,
        display_name TEXT,
        photo_url TEXT,
        gender TEXT,
        role TEXT DEFAULT 'client'
      )
    `);

    // Bookings table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        package_id TEXT,
        package_name TEXT,
        status TEXT,
        bride_name TEXT,
        groom_name TEXT,
        appointment_date TEXT,
        appointment_slot TEXT,
        payment_status TEXT,
        payment_id TEXT,
        amount INTEGER,
        advocate_name TEXT,
        advocate_phone TEXT,
        created_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(uid)
      )
    `);

    // Documents table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        booking_id TEXT NOT NULL,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        uri TEXT NOT NULL,
        status TEXT DEFAULT 'completed',
        uploaded_at TEXT,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
      )
    `);

    // Chat messages table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        booking_id TEXT,
        text TEXT NOT NULL,
        sender TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

    // Lawyer applications table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS lawyer_applications (
        email TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        experience TEXT,
        bar_council_id TEXT,
        resume_uri TEXT,
        status TEXT DEFAULT 'pending',
        created_at TEXT NOT NULL
      )
    `);
    console.log('PostgreSQL database tables initialized successfully');
  } catch (err) {
    console.error('Failed to initialize PostgreSQL database tables:', err);
    throw err;
  }
};

export default pool;
