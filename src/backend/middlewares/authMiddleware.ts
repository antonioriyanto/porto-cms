import { Request, Response, NextFunction } from 'express';
import { db } from '../../db';
import { adminSessions, adminUsers } from '../../db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.cookies.admin_session;
    if (!sessionId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // In a real app, hash the incoming session ID to compare with DB
    const tokenHash = crypto.createHash('sha256').update(sessionId).digest('hex');

    const sessions = await db.select().from(adminSessions).where(eq(adminSessions.tokenHash, tokenHash));
    if (sessions.length === 0) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const session = sessions[0];
    if (new Date() > new Date(session.expiresAt)) {
      await db.delete(adminSessions).where(eq(adminSessions.id, session.id));
      return res.status(401).json({ error: 'Session expired' });
    }

    const users = await db.select().from(adminUsers).where(eq(adminUsers.id, session.userId));
    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
