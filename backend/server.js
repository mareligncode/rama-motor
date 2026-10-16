import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';
import apiRoutes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';
import { auditContextMiddleware } from './middleware/auditContext.js';
import { startOutboxWorker } from './services/outboxWorker.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

// Connect to MongoDB and start background outbox worker
connectDB().then(() => {
  startOutboxWorker({ pollIntervalMs: 2000 });
});

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(auditContextMiddleware);

// Root health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Rama Delivery Backend API',
    version: '1.0.0',
    documentation: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      devices: '/api/v1/devices',
      notifications: '/api/v1/notifications',
    },
  });
});

// Mount version 1 API routes
app.use('/api/v1', apiRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Rama Delivery Server running on http://localhost:${PORT}`);
});

export default app;