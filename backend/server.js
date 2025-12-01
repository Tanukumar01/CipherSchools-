import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectMongo, closeConnections } from './config/db.js';
import { testConnection } from './services/dbService.js';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

/**
 * MIDDLEWARE
 */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/**
 * ROUTES
 */
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  const pgHealthy = await testConnection();
  const mongoHealthy = connectMongo ? true : false;
  
  res.json({
    status: pgHealthy && mongoHealthy ? 'healthy' : 'degraded',
    postgres: pgHealthy ? 'connected' : 'disconnected',
    mongodb: mongoHealthy ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
    
  });
  console.log("DataBase connected");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

/**
 * SERVER STARTUP
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectMongo();
    
    // Test PostgreSQL connection
    const pgHealthy = await testConnection();
    if (!pgHealthy) {
      console.warn('⚠ Warning: PostgreSQL connection test failed');
    }
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n CipherSQLStudio Backend running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV}`);
      console.log(`   Health check: http://localhost:${PORT}/health\n`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * GRACEFUL SHUTDOWN
 */
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await closeConnections();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  await closeConnections();
  process.exit(0);
});

// Start the server
startServer();
