import cookieParser from 'cookie-parser';
import express from 'express';
import { AppDataSource } from './db/data-source';
import { errorHandler, notFound } from './errors';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';
import leadRoutes from './routes/leads';

export const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // behind nginx in production
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.get('/api/health', async (_req, res) => {
  try {
    await AppDataSource.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ error: 'Database unavailable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);
