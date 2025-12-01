import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Try to connect as postgres (admin) to create tables
// If this fails, we might need to ask the user for credentials
const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  user: 'postgres', // Default admin user
  password: '8427tanuK@', // Updated with user provided password
  database: process.env.PG_DATABASE || 'CipherSQLStdio_DB',
});

async function seed() {
  try {
    const sqlPath = path.join(__dirname, 'seed_postgres.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Connecting to PostgreSQL...');
    const client = await pool.connect();
    
    console.log('Running seed script...');
    await client.query(sql);
    
    console.log(' Seed script executed successfully!');
    client.release();
    await pool.end();
  } catch (err) {
    console.error(' Error executing seed script:', err.message);
    if (err.code === '28P01') { // invalid_password
        console.log('\n Authentication failed for user "postgres" with password "root".');
        console.log('Please update the script with your actual PostgreSQL admin password.');
    }
    await pool.end();
    process.exit(1);
  }
}

seed();
