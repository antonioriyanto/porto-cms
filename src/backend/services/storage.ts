import { createClient, SupabaseClient } from '@supabase/supabase-js';
import multer from 'multer';
import path from 'path';
import 'dotenv/config';

let supabaseClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) return false;
  if (!/^https?:\/\//i.test(url)) return false;
  if (url === 'SUPABASE_URL' || url.includes('placeholder') || key === 'placeholder_key') return false;

  return true;
}

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;
  if (!isSupabaseConfigured()) return null;

  try {
    const url = process.env.SUPABASE_URL!.trim();
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim();
    supabaseClient = createClient(url, key);
    return supabaseClient;
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
    return null;
  }
}

// Resilient proxy to prevent unhandled crashes if accessed without configuration
export const supabase: any = new Proxy({} as any, {
  get(_target, prop) {
    const client = getSupabase();
    if (client) {
      return (client as any)[prop];
    }

    if (prop === 'storage') {
      return {
        from: () => ({
          upload: async () => ({ data: null, error: new Error('Supabase Storage is not configured') }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
          download: async () => ({ data: null, error: new Error('Supabase Storage is not configured') }),
          remove: async () => ({ data: null, error: new Error('Supabase Storage is not configured') }),
        }),
      };
    }

    return undefined;
  },
});

/**
 * Optimized Multer Configuration for Vercel Serverless:
 * - 4MB File Size Limit (under Vercel's 4.5MB request payload ceiling)
 * - Strict Mime-Type & Extension validation for JPG, PNG, WEBP, and PDF
 */
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

export const uploadMulter = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB maximum
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_MIME_TYPES.includes(file.mimetype) || ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and PDF files are allowed.'));
    }
  },
});

/**
 * Direct upload helper that transfers memory buffer directly to Supabase Storage
 * and retrieves a permanent public URL.
 */
export async function uploadToSupabaseStorage(
  bucket: 'portfolio-media' | 'portfolio-private',
  fileName: string,
  buffer: Buffer,
  contentType: string
): Promise<{ publicUrl: string; error?: string }> {
  const client = getSupabase();
  if (!client) {
    return { publicUrl: '', error: 'Supabase Storage is not configured' };
  }

  try {
    const { error } = await client.storage.from(bucket).upload(fileName, buffer, {
      contentType,
      upsert: false,
    });

    if (error) {
      console.warn(`[Supabase Storage Error (${bucket})]:`, error.message);
      return { publicUrl: '', error: error.message };
    }

    const { data } = client.storage.from(bucket).getPublicUrl(fileName);
    return { publicUrl: data.publicUrl };
  } catch (err: any) {
    console.error(`[Supabase Upload Exception (${bucket})]:`, err.message);
    return { publicUrl: '', error: err.message };
  }
}

