import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import roomRoutes from './routes/roomRoutes';
import studentRoutes from './routes/studentRoutes';
import paymentRoutes from './routes/paymentRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Enhanced logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  let responseBody: unknown;

  // Log incoming request
  console.log(`\n🔵 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('📥 Request Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📥 Request Body:', JSON.stringify(req.body, null, 2));
  }
  // Capture response body
  res.send = function (body) {
    responseBody = body;
    try {
      responseBody = JSON.parse(body as string);
    } catch {
      responseBody = body;
    }
    return originalSend.call(this, body);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`\n🔴 [${new Date().toISOString()}] Response to ${req.method} ${req.originalUrl}`);
    console.log(`📤 Status: ${res.statusCode} | Duration: ${duration}ms`);
    console.log('📤 Response Body:', JSON.stringify(responseBody, null, 2));
    console.log('─'.repeat(80));
  });

  next();
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/rooms', roomRoutes);
app.use('/students', studentRoutes);
app.use('/payments', paymentRoutes);
app.use('/chambres', roomRoutes);
app.use('/etudiants', studentRoutes);

app.use(errorHandler);
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('💥 Unhandled error:', err);
  res.status((err as any).status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
