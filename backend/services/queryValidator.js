import dotenv from 'dotenv';

dotenv.config();

/**
 * SECURITY-CRITICAL MODULE
 * Validates and sanitizes SQL queries before execution in the sandbox
 * 
 * Defense-in-depth approach:
 * 1. Blacklist dangerous keywords (DROP, DELETE, etc.)
 * 2. Prevent multi-statement execution (semicolon abuse)
 * 3. Enforce row limits on SELECT queries
 * 4. Block potentially expensive operations (pg_sleep, etc.)
 */

const QUERY_ROW_LIMIT = parseInt(process.env.QUERY_ROW_LIMIT) || 500;

// Blacklist of destructive SQL keywords
const DESTRUCTIVE_KEYWORDS = /\b(DROP|ALTER|CREATE|INSERT|UPDATE|DELETE|TRUNCATE|GRANT|REVOKE|COPY|VACUUM)\b/i;

// Blacklist for expensive/dangerous PostgreSQL functions
const DANGEROUS_FUNCTIONS = /\b(pg_sleep|pg_terminate_backend|pg_cancel_backend|pg_read_file|pg_write_file)\b/i;

/**
 * Validates a SQL query for security and correctness
 * @param {string} sql - The SQL query to validate
 * @returns {Object} { valid: boolean, error: string|null, sanitizedSql: string|null }
 */
export const validateQuery = (sql) => {
  if (!sql || typeof sql !== 'string') {
    return { valid: false, error: 'Query must be a non-empty string', sanitizedSql: null };
  }

  const trimmedSql = sql.trim();

  // Check 1: Reject empty queries
  if (trimmedSql.length === 0) {
    return { valid: false, error: 'Query cannot be empty', sanitizedSql: null };
  }

  // Check 2: Reject destructive keywords
  if (DESTRUCTIVE_KEYWORDS.test(trimmedSql)) {
    return { 
      valid: false, 
      error: 'Destructive operations (DROP, ALTER, CREATE, INSERT, UPDATE, DELETE, etc.) are not allowed', 
      sanitizedSql: null 
    };
  }

  // Check 3: Reject dangerous functions
  if (DANGEROUS_FUNCTIONS.test(trimmedSql)) {
    return { 
      valid: false, 
      error: 'Dangerous PostgreSQL functions are not allowed', 
      sanitizedSql: null 
    };
  }

  // Check 4: Prevent multi-statement execution (semicolon abuse)
  // Count semicolons (allow one trailing semicolon, but not multiple statements)
  const semicolonCount = (trimmedSql.match(/;/g) || []).length;
  const endsWithSemicolon = trimmedSql.endsWith(';');
  
  if (semicolonCount > 1 || (semicolonCount === 1 && !endsWithSemicolon)) {
    return { 
      valid: false, 
      error: 'Multiple statements are not allowed. Please submit one query at a time.', 
      sanitizedSql: null 
    };
  }

  // Remove trailing semicolon for processing
  let sanitizedSql = endsWithSemicolon ? trimmedSql.slice(0, -1).trim() : trimmedSql;

  // Check 5: Enforce row limit on SELECT queries
  // Only apply to SELECT statements that don't already have a LIMIT clause
  if (/^\s*SELECT\b/i.test(sanitizedSql) && !/\bLIMIT\b/i.test(sanitizedSql)) {
    sanitizedSql += ` LIMIT ${QUERY_ROW_LIMIT}`;
  }

  return { valid: true, error: null, sanitizedSql };
};

/**
 * Additional runtime validation (can be extended)
 * @param {string} sql - The SQL query
 * @returns {boolean} true if query appears safe
 */
export const isSelectQuery = (sql) => {
  return /^\s*SELECT\b/i.test(sql.trim());
};
