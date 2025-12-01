import { pgPool } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const STATEMENT_TIMEOUT_MS = parseInt(process.env.QUERY_STATEMENT_TIMEOUT_MS) || 2000;
const LOCK_TIMEOUT_MS = parseInt(process.env.QUERY_LOCK_TIMEOUT_MS) || 2000;

/**
 * SANDBOXED QUERY EXECUTION SERVICE
 * 
 * Security measures:
 * 1. Uses read-only PostgreSQL role (configured in docker/env)
 * 2. Enforces statement timeout to prevent long-running queries
 * 3. Enforces lock timeout to prevent deadlocks
 * 4. Runs in a transaction that is always rolled back (extra safety)
 * 5. Returns sanitized error messages (no stack traces to client)
 */

/**
 * Executes a validated SQL query in the sandbox
 * @param {string} sql - Pre-validated and sanitized SQL query
 * @returns {Promise<Object>} { success: boolean, rows: [], fields: [], error: string|null }
 */
export const executeSandboxQuery = async (sql) => {
  const client = await pgPool.connect();
  
  try {
    // Start a transaction (extra safety layer)
    await client.query('BEGIN');
    
    // Set timeouts to prevent resource exhaustion
    await client.query(`SET LOCAL statement_timeout = '${STATEMENT_TIMEOUT_MS}ms'`);
    await client.query(`SET LOCAL lock_timeout = '${LOCK_TIMEOUT_MS}ms'`);
    
    // Execute the user's query
    const result = await client.query(sql);
    
    // Rollback transaction (we're just reading, but this ensures no side effects)
    await client.query('ROLLBACK');
    
    // Extract field metadata
    const fields = result.fields.map(field => ({
      name: field.name,
      dataTypeID: field.dataTypeID
    }));
    
    return {
      success: true,
      rows: result.rows,
      fields: fields,
      rowCount: result.rowCount,
      error: null
    };
    
  } catch (error) {
    // Rollback on error
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
    }
    
    // SECURITY: Sanitize error messages
    // Don't expose internal database structure or stack traces
    let sanitizedError = 'Query execution failed';
    
    if (error.code === '57014') {
      sanitizedError = 'Query timeout: Your query took too long to execute';
    } else if (error.code === '42P01') {
      sanitizedError = 'Table not found';
    } else if (error.code === '42703') {
      sanitizedError = 'Column not found';
    } else if (error.code === '42601') {
      sanitizedError = 'SQL syntax error';
    } else if (error.message) {
      // Return a cleaned version of the error message (remove technical details)
      sanitizedError = error.message.split('\n')[0]; // First line only
    }
    
    console.error('Query execution error:', error.code, error.message);
    
    return {
      success: false,
      rows: [],
      fields: [],
      rowCount: 0,
      error: sanitizedError
    };
    
  } finally {
    client.release();
  }
};

/**
 * Test database connection
 * @returns {Promise<boolean>} true if connection is healthy
 */
export const testConnection = async () => {
  try {
    const result = await pgPool.query('SELECT 1 AS test');
    return result.rows[0].test === 1;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};
