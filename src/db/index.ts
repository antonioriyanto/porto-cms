import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';
import 'dotenv/config';

export const isDatabaseConfigured = Boolean(
  process.env.DATABASE_URL && 
  process.env.DATABASE_URL.trim() !== '' && 
  process.env.DATABASE_URL !== 'DATABASE_URL' && 
  !process.env.DATABASE_URL.includes('placeholder')
);

const isServerless = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

// Serverless-friendly pg.Pool configuration
const poolConfig: pg.PoolConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5432/postgres',
  // In serverless, keep pool size to 1 to prevent exhausting pooler connections
  max: isServerless ? 1 : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('supabase') || process.env.DATABASE_URL?.includes('pooler'))
    ? { rejectUnauthorized: false }
    : false
};

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: pg.Pool | undefined;
}

export const pool = globalThis.__pgPool || new pg.Pool(poolConfig);
if (process.env.NODE_ENV !== 'production' && !isServerless) {
  globalThis.__pgPool = pool;
}

// Prevent unhandled error events from crashing the process
pool.on('error', (err) => {
  console.warn('[Postgres Pool Warning]:', err.message);
});

export const db = drizzle(pool, { schema });

/**
 * Health check helper for database connectivity.
 */
export async function testConnection(): Promise<boolean> {
  if (!isDatabaseConfigured) return false;
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (err: any) {
    console.error('[Postgres Connection Failed]:', err.message);
    return false;
  }
}

export async function checkDatabaseHealth(): Promise<{ connected: boolean; message: string }> {
  if (!isDatabaseConfigured) {
    return { connected: false, message: 'DATABASE_URL not configured (using local store)' };
  }
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return { connected: true, message: 'Connected to Supabase PostgreSQL' };
  } catch (err: any) {
    return { connected: false, message: err.message || 'Database connection error' };
  }
}



