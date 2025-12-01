import { validateQuery, isSelectQuery } from '../services/queryValidator.js';

/**
 * Basic unit tests for query validator
 * Run with: node --test test/queryValidator.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert';

test('validateQuery - should reject destructive keywords', () => {
  const sql = 'DROP TABLE users';
  const result = validateQuery(sql);
  assert.strictEqual(result.valid, false);
  assert.ok(result.error.includes('Destructive operations'));
});

test('validateQuery - should reject multiple statements', () => {
  const sql = 'SELECT * FROM users; DELETE FROM users';
  const result = validateQuery(sql);
  assert.strictEqual(result.valid, false);
  assert.ok(result.error.includes('Multiple statements'));
});

test('validateQuery - should accept valid SELECT query', () => {
  const sql = 'SELECT * FROM users WHERE id = 1';
  const result = validateQuery(sql);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.error, null);
  assert.ok(result.sanitizedSql);
});

test('validateQuery - should append LIMIT if missing', () => {
  const sql = 'SELECT * FROM users';
  const result = validateQuery(sql);
  assert.strictEqual(result.valid, true);
  assert.ok(result.sanitizedSql.includes('LIMIT'));
});

test('validateQuery - should not append LIMIT if already present', () => {
  const sql = 'SELECT * FROM users LIMIT 10';
  const result = validateQuery(sql);
  const limitCount = (result.sanitizedSql.match(/LIMIT/gi) || []).length;
  assert.strictEqual(limitCount, 1);
});

test('validateQuery - should reject dangerous functions', () => {
  const sql = 'SELECT pg_sleep(10)';
  const result = validateQuery(sql);
  assert.strictEqual(result.valid, false);
  assert.ok(result.error.includes('Dangerous'));
});

test('isSelectQuery - should identify SELECT queries', () => {
  assert.strictEqual(isSelectQuery('SELECT * FROM users'), true);
  assert.strictEqual(isSelectQuery('  select id from orders'), true);
  assert.strictEqual(isSelectQuery('UPDATE users SET name = "test"'), false);
});

console.log('All query validator tests passed!');
