import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Ensure .env is loaded reliably regardless of current working directory
const possibleEnvPaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), 'server/.env'),
  path.resolve(process.cwd(), '.env'),
];

for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import translationRoutes from './routes/translationRoutes';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Express {
  const app = express();

  // CORS configuration
  const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or matching origin
        if (!origin || origin === allowedOrigin || origin.startsWith('http://localhost:')) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );

  // Parse JSON bodies with a safe limit
  app.use(express.json({ limit: '100kb' }));

  // Mount API routes
  app.use('/api', translationRoutes);

  // 404 handler for undefined routes
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found. Available endpoints: GET /api/health, POST /api/translate',
      code: 'NOT_FOUND',
    });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
}
