import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import apiRouter from './routes/api';
import authRouter from './routes/auth';
import adminRouter from './routes/admin';

const app = express();

app.use(helmet({
  contentSecurityPolicy: false, // Vite requires inline scripts in dev
}));
app.use(cors({
  origin: process.env.PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());

// Trust proxy for Cloud Run
app.set('trust proxy', 1);

// API Routes
app.use('/api/v1/public', apiRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);

app.get('/api/healthz', (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/api/readyz', (req, res) => res.status(200).json({ status: 'ready' }));

export default app;
