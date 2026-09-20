import { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { db } from '../../db';
import { adminUsers, adminSessions, auditLogs } from '../../db/schema';
import { eq } from 'drizzle-orm';
import rateLimit from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again later.' }
});

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const users = await db.select().from(adminUsers).where(eq(adminUsers.email, email.toLowerCase()));
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Set expiry to 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await db.insert(adminSessions).values({
      userId: user.id,
      tokenHash,
      expiresAt
    });

    await db.insert(auditLogs).values({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      ipAddress: req.ip
    });

    res.cookie('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/logout', async (req, res) => {
  const sessionId = req.cookies.admin_session;
  if (sessionId) {
    const tokenHash = crypto.createHash('sha256').update(sessionId).digest('hex');
    await db.delete(adminSessions).where(eq(adminSessions.tokenHash, tokenHash));
    res.clearCookie('admin_session');
  }
  res.json({ success: true });
});

export default router;
