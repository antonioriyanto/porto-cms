import { Router } from 'express';
import crypto from 'crypto';
import { dataStore } from '../services/dataStore';
import rateLimit from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // reasonable limit for testing and admin usage
  message: { error: 'Too many login attempts, please try again later.' }
});

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const user = await dataStore.verifyAdminUser(email, password);
    if (!user) {
      dataStore.addAuditLog('anonymous', 'LOGIN_FAILED', { email, ip: req.ip });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate random session token
    const token = crypto.randomBytes(32).toString('hex');
    dataStore.createSession(token, user);
    dataStore.addAuditLog(user.id, 'LOGIN_SUCCESS', { email: user.email, ip: req.ip });

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
        role: user.role,
        displayName: user.displayName
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/session', async (req, res) => {
  try {
    const token = req.cookies?.admin_session;
    if (!token) {
      return res.status(401).json({ error: 'No active session' });
    }

    const session = dataStore.getSession(token);
    if (!session) {
      res.clearCookie('admin_session');
      return res.status(401).json({ error: 'Session expired' });
    }

    res.json({
      user: {
        id: session.userId,
        email: session.email,
        role: session.role
      }
    });
  } catch (error: any) {
    console.error('Session error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies?.admin_session;
    if (token) {
      dataStore.deleteSession(token);
      res.clearCookie('admin_session');
    }
    res.json({ success: true });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
