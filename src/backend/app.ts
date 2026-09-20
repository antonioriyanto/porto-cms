import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import apiRouter from './routes/api';
import authRouter from './routes/auth';
import adminRouter from './routes/admin';
import { dbHealthMiddleware } from './middlewares/dbHealthMiddleware';

const app = express();

app.use(helmet({
  contentSecurityPolicy: false, // Vite requires inline scripts in dev
  frameguard: false, // Allow embedding in AI Studio preview iframe
  crossOriginResourcePolicy: false, // Prevent blocking cross-origin fetch in iframe
  crossOriginOpenerPolicy: false,
  originAgentCluster: false,
}));
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Token', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie', 'Authorization']
}));
app.options('*', cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());

// Trust proxy for Cloud Run and Vercel
app.set('trust proxy', 1);

// Health check endpoints (bypasses DB check for edge liveness)
app.get('/api/healthz', (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/api/readyz', (req, res) => res.status(200).json({ status: 'ready' }));

// Database guard for production & Vercel
app.use('/api/v1', dbHealthMiddleware);

// API Routes
app.use('/api/v1/public', apiRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);

// Centralized error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Centralized Error Handler]:', err);
  if (res.headersSent) {
    return next(err);
  }

  if (
    err?.code === 'ECONNREFUSED' ||
    err?.code === 'DATABASE_CONNECTION_FAILED' ||
    err?.message?.toLowerCase().includes('database connection failed')
  ) {
    return res.status(503).json({
      success: false,
      message: 'Database connection failed'
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

export default app;
