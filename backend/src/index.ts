import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

dotenv.config();

import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import resourceRoutes from './routes/resource.routes';
import fileRoutes from './routes/file.routes';
import reviewRoutes from './routes/review.routes';
import aiRoutes from './routes/ai.routes';
import courseRoutes from './routes/course.routes';
import userRoutes from './routes/user.routes';
import analyticsRoutes from './routes/analytics.routes';

const app = express();

app.use(helmet());

app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const API_PREFIX = '/api/v1';

app.get(`${API_PREFIX}/health`, (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
  });
});

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/resources`, resourceRoutes);
app.use(`${API_PREFIX}/files`, fileRoutes);
app.use(`${API_PREFIX}/reviews`, reviewRoutes);
app.use(`${API_PREFIX}/ai`, aiRoutes);
app.use(`${API_PREFIX}/courses`, courseRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
      path: req.path,
    },
  });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`📊 Prisma Studio: http://localhost:5555`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
});
