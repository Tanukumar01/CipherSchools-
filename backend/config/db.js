import mongoose from 'mongoose';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

/**
 * MongoDB connection
 * Used for storing assignment metadata and user progress (optional feature)
 */
export const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

/**
 * PostgreSQL connection pool
 * SECURITY: Uses read-only role (sandbox_reader) with SELECT-only privileges
 * This pool is used ONLY for executing student queries in a sandbox environment
 */
export const pgPool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  max: 10, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test PostgreSQL connection on initialization
pgPool.on('connect', () => {
  console.log('✓ PostgreSQL sandbox pool connected');
});

pgPool.on('error', (err) => {
  console.error('✗ PostgreSQL pool error:', err);
});

/**
 * Graceful shutdown handler
 */
export const closeConnections = async () => {
  await pgPool.end();
  await mongoose.connection.close();
  console.log('Database connections closed');
};
