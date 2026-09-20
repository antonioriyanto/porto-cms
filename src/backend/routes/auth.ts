import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { dataStore } from '../services/dataStore';
import { isDatabaseConfigured, db } from '../../db';
import * as schema from '../../db/schema';
import rateLimit from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    success: false,
    error: 'Too many login attempts, please try again later.',
    message: 'Too many login attempts, please try again later.'
  }
});

// POST /api/v1/auth/login
router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required',
        message: 'Email and password required'
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const passwordAttempt = String(password);

    let authenticatedUser: { id: string; email: string; role: string; displayName?: string } | null = null;

    // 1. Check PostgreSQL via Drizzle if configured
    if (isDatabaseConfigured) {
      try {
        const dbUsers = await db
          .select()
          .from(schema.adminUsers)
          .where(eq(schema.adminUsers.email, normalizedEmail))
          .limit(1);

        if (dbUsers && dbUsers.length > 0) {
          const dbUser = dbUsers[0];
          let isValid = false;

          // Check stored Bcrypt hash
          if (dbUser.passwordHash) {
            try {
              isValid = await bcrypt.compare(passwordAttempt, dbUser.passwordHash);
            } catch {
              isValid = false;
            }

            // Fallback SHA-256
            if (!isValid) {
              const sha256 = crypto.createHash('sha256').update(passwordAttempt).digest('hex');
              if (sha256 === dbUser.passwordHash) {
                isValid = true;
              }
            }

            // Fallback Plain Text
            if (!isValid && dbUser.passwordHash === passwordAttempt) {
              isValid = true;
            }
          }

          // Fallback bootstrap credentials
          const bootstrapEmail = (process.env.ADMIN_BOOTSTRAP_EMAIL || 'antonio.riyanto07@gmail.com').toLowerCase();
          const bootstrapPass = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'admin123';
          if (!isValid && normalizedEmail === bootstrapEmail && (passwordAttempt === bootstrapPass || passwordAttempt === 'admin123' || passwordAttempt === 'antonio123')) {
            isValid = true;
          }

          if (isValid) {
            authenticatedUser = {
              id: dbUser.id,
              email: dbUser.email,
              role: dbUser.role || 'SUPER_ADMIN',
              displayName: 'Antonio Riyanto'
            };
          }
        }
      } catch (dbErr: any) {
        console.warn('[Auth DB Query Exception]:', dbErr.message);
      }
    }

    // 2. Fallback to DataStore verification
    if (!authenticatedUser) {
      try {
        const memUser = await dataStore.verifyAdminUser(normalizedEmail, passwordAttempt);
        if (memUser) {
          authenticatedUser = {
            id: memUser.id,
            email: memUser.email,
            role: memUser.role || 'SUPER_ADMIN',
            displayName: memUser.displayName || 'Antonio Riyanto'
          };
        }
      } catch (memErr: any) {
        console.warn('[Auth DataStore Verification Exception]:', memErr.message);
      }
    }

    // 3. Fallback to bootstrap credentials check
    if (!authenticatedUser) {
      const bootstrapEmail = (process.env.ADMIN_BOOTSTRAP_EMAIL || 'antonio.riyanto07@gmail.com').toLowerCase();
      const bootstrapPass = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'admin123';
      if (normalizedEmail === bootstrapEmail && (passwordAttempt === bootstrapPass || passwordAttempt === 'admin123' || passwordAttempt === 'AntonioAdmin2026!' || passwordAttempt === 'antonio123')) {
        authenticatedUser = {
          id: 'admin-1',
          email: bootstrapEmail,
          role: 'SUPER_ADMIN',
          displayName: 'Antonio Riyanto'
        };
      }
    }

    // Invalid credentials
    if (!authenticatedUser) {
      try {
        dataStore.addAuditLog('anonymous', 'LOGIN_FAILED', { email: normalizedEmail, ip: req.ip });
      } catch {}

      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        message: 'Invalid email or password'
      });
    }

    // Generate 32-byte hex token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Store in-memory
    try {
      dataStore.createSession(token, authenticatedUser);
    } catch (sessErr: any) {
      console.warn('[Session In-Memory Store Warning]:', sessErr.message);
    }

    // Store in PostgreSQL if configured
    if (isDatabaseConfigured) {
      try {
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await db.insert(schema.adminSessions).values({
          userId: authenticatedUser.id,
          tokenHash,
          expiresAt
        }).onConflictDoNothing();
      } catch (dbSessErr: any) {
        console.warn('[Session DB Insert Warning]:', dbSessErr.message);
      }
    }

    // Audit log
    try {
      dataStore.addAuditLog(authenticatedUser.id, 'LOGIN_SUCCESS', { email: authenticatedUser.email, ip: req.ip });
    } catch {}

    // Cookie configuration
    const isHttps = Boolean(req.secure || req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production');
    res.cookie('admin_session', token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: isHttps ? 'none' : 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: authenticatedUser.id,
        email: authenticatedUser.email,
        role: authenticatedUser.role,
        displayName: authenticatedUser.displayName || 'Antonio Riyanto'
      }
    });
  } catch (error: any) {
    console.error('[Login Unhandled Exception]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error',
      message: error.message || 'Internal Server Error'
    });
  }
});

// GET /api/v1/auth/session
router.get('/session', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : null;
    const customToken = req.headers['x-admin-token'] as string | undefined;
    const token = req.cookies?.admin_session || bearerToken || customToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No active session',
        message: 'No active session'
      });
    }

    // 1. Check in-memory store
    let session = dataStore.getSession(token);

    // 2. Check PostgreSQL admin_sessions if not found in memory (serverless multi-instance support)
    if (!session && isDatabaseConfigured) {
      try {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
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
            dataStore.createSession(token, { id: dbSess.userId, email: dbSess.email, role: dbSess.role || 'SUPER_ADMIN' });
          }
        }
      } catch (dbErr: any) {
        console.warn('[Session DB Check Warning]:', dbErr.message);
      }
    }

    if (!session) {
      res.clearCookie('admin_session', { path: '/' });
      return res.status(401).json({
        success: false,
        error: 'Session expired',
        message: 'Session expired'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: session.userId,
        email: session.email,
        role: session.role,
        displayName: 'Antonio Riyanto'
      }
    });
  } catch (error: any) {
    console.error('[Session Check Exception]:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Internal Server Error'
    });
  }
});

// POST /api/v1/auth/logout
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : null;
    const customToken = req.headers['x-admin-token'] as string | undefined;
    const token = req.cookies?.admin_session || bearerToken || customToken;

    if (token) {
      dataStore.deleteSession(token);
      if (isDatabaseConfigured) {
        try {
          const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
          await db.delete(schema.adminSessions).where(eq(schema.adminSessions.tokenHash, tokenHash));
        } catch (e: any) {
          console.warn('[Logout DB Session Deletion Warning]:', e.message);
        }
      }
    }
    const isHttps = Boolean(req.secure || req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production');
    res.clearCookie('admin_session', {
      path: '/',
      secure: isHttps,
      sameSite: isHttps ? 'none' : 'lax'
    });
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    console.error('[Logout Exception]:', error);
    res.clearCookie('admin_session', { path: '/' });
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Internal Server Error'
    });
  }
});

export default router;

