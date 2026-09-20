import { Request, Response, NextFunction } from 'express';
import { dataStore } from '../services/dataStore';

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
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const session = dataStore.getSession(sessionId);
    if (!session) {
      res.clearCookie('admin_session');
      return res.status(401).json({ error: 'Session invalid or expired' });
    }

    req.user = {
      id: session.userId,
      email: session.email,
      role: session.role
    };

    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
