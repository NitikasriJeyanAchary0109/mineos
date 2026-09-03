import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ingestionRoutes from './routes/ingestion';
import { isCloudConnected, supabase } from './config/supabase';
import { bufferQueue } from './services/bufferQueue';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// CORS configuration for public internet access from frontend & cloud
app.use(
  cors({
    origin: '*', // Allow dashboard clients from any origin/port
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.text({ type: ['text/plain', 'text/*'] }));

// Request logging
app.use((req, _res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`📡 [${req.method}] ${req.path}`);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    system: 'IRON MINDS — M-SAFE Ingestion API',
    version: '1.0.0',
    cloud_database: isCloudConnected ? 'Connected (Supabase)' : 'Local In-Memory Mode',
    supabase_configured: Boolean(supabase),
    buffer_queue_size: bufferQueue.getQueueLength(),
    timestamp: new Date().toISOString(),
  });
});

// Mount Ingestion API Routes
app.use('/api', ingestionRoutes);

// Root fallback
app.get('/', (_req, res) => {
  res.send({
    message: 'IRON MINDS — M-SAFE Real-time Ingestion Backend is active.',
    endpoints: [
      'POST /api/entry/ppe-scan (Jetson AI entry)',
      'POST /api/sensors/environment (MQ gas & flame)',
      'POST /api/sensors/wearable (Health, IMU fall, SOS)',
      'POST /api/sensors/helmet (Shift helmet wear check)',
      'GET /api/readings/latest (Live cache telemetry)',
      'GET /api/health (System status)',
    ],
  });
});

app.listen(PORT, () => {
  console.log('===============================================================');
  console.log(`🚀 [M-SAFE] Ingestion API running at http://localhost:${PORT}`);
  console.log(`🔌 [Supabase] Status: ${isCloudConnected ? 'Cloud Connected' : 'Local Fallback'}`);
  console.log('===============================================================');
});

export default app;
