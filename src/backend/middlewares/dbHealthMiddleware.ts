import { Request, Response, NextFunction } from 'express';
import { isDatabaseConfigured, testConnection } from '../../db';

/**
 * Middleware ensuring database availability in Production / Vercel environments.
 * If PostgreSQL fails to connect, abort immediately with 503 status
 * without attempting any file write fallback.
 */
export async function dbHealthMiddleware(req: Request, res: Response, next: NextFunction) {
  const isVercelOrProd = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

  if (isVercelOrProd && isDatabaseConfigured) {
    try {
      const isConnected = await testConnection();
      if (!isConnected) {
        return res.status(503).json({
          success: false,
          message: 'Database connection failed'
        });
      }
    } catch (error) {
      return res.status(503).json({
        success: false,
        message: 'Database connection failed'
      });
    }
  }

  next();
}
