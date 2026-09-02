import 'server-only';
import { Pool } from 'pg';
import './email'; // Trigger SMTP verification on startup

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const db = {
  query: (text: string, params?: unknown[]) => pool.query(text, params),
  pool
};
