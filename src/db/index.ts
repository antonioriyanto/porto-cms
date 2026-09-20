import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';
import 'dotenv/config';

export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5432/postgres',
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' && process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : false
});

// Prevent unhandled error events from crashing the Node process
pool.on('error', (err) => {
  // Silent or log warn
  console.warn('[Postgres Pool Warning]:', err.message);
});

export const db = drizzle(pool, { schema });
export { pool };

