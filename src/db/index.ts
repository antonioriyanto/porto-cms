import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';
import 'dotenv/config';

// Fallback to prevent dev server crash on startup
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

const pool = new pg.Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' && connectionString.includes('supabase') ? { rejectUnauthorized: false } : false
});

export const db = drizzle(pool, { schema });
