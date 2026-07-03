import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const getDbPath = () => {
  if (process.env.DATABASE_URL) {
    if (path.isAbsolute(process.env.DATABASE_URL)) {
      return process.env.DATABASE_URL;
    }
    return path.resolve(__dirname, '../../', process.env.DATABASE_URL);
  }
  return path.resolve(__dirname, '../../data/database.sqlite');
};
const DB_PATH = getDbPath();

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Connect to SQLite Database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', DB_PATH);
  }
});

// Helper to run query with Promise
export const dbRun = (sql: string, params: any[] = []): Promise<{ id: number | string; changes: number }> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

// Helper to query all records with Promise
export const dbAll = <T>(sql: string, params: any[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as T[]);
      }
    });
  });
};

// Helper to query a single record with Promise
export const dbGet = <T>(sql: string, params: any[] = []): Promise<T | null> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve((row as T) || null);
      }
    });
  });
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

    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('Failed to initialize database tables:', err);
    throw err;
  }
};

export default db;
