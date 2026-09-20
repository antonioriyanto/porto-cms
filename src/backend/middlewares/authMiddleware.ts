import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { dataStore } from '../services/dataStore';
import { isDatabaseConfigured, db } from '../../db';
import * as schema from '../../db/schema';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.cookies?.admin_session;
    if (!sessionId) {
      return res.status(401).json({ success: false, error: 'Unauthorized', message: 'Unauthorized' });
    }

    // 1. Try memory session
    let session = dataStore.getSession(sessionId);

    // 2. If not found in memory, lookup PostgreSQL admin_sessions (serverless cross-instance support)
    if (!session && isDatabaseConfigured) {
      try {
        const tokenHash = crypto.createHash('sha256').update(sessionId).digest('hex');
        const dbSessions = await db
          .select({
            sessionId: schema.adminSessions.id,
            userId: schema.adminSessions.userId,
            expiresAt: schema.adminSessions.expiresAt,
            email: schema.adminUsers.email,
            role: schema.adminUsers.role
          })
          .from(schema.adminSessions)
          .innerJoin(schema.adminUsers, eq(schema.adminSessions.userId, schema.adminUsers.id))
          .where(eq(schema.adminSessions.tokenHash, tokenHash))
          .limit(1);

        if (dbSessions.length > 0) {
          const dbSess = dbSessions[0];
          if (new Date(dbSess.expiresAt).getTime() > Date.now()) {
            session = {
              userId: dbSess.userId,
              email: dbSess.email,
              role: dbSess.role || 'SUPER_ADMIN',
              expiresAt: new Date(dbSess.expiresAt).getTime()
            };
            dataStore.createSession(sessionId, { id: dbSess.userId, email: dbSess.email, role: dbSess.role || 'SUPER_ADMIN' });
          }
        }
      } catch (dbErr: any) {
        console.warn('[Auth Middleware DB Lookup Warning]:', dbErr.message);
      }
    }

    if (!session) {
      res.clearCookie('admin_session', { path: '/' });
      return res.status(401).json({ success: false, error: 'Session invalid or expired', message: 'Session invalid or expired' });
    }

    req.user = {
      id: session.userId,
      email: session.email,
      role: session.role
    };

    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Internal Server Error' });
  }
};

