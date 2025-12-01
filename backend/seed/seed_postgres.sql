-- CipherSQLStudio Seed Data
-- PostgreSQL sandbox database initialization
-- Creates sample tables and data for SQL learning assignments

-- Drop existing tables if they exist
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS products;

-- Create customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    country VARCHAR(50) NOT NULL,
    join_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Create products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    stock_quantity INTEGER DEFAULT 0
);

-- Create orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount DECIMAL(10, 2) NOT NULL
);

-- Insert sample customers
INSERT INTO customers (name, email, country, join_date) VALUES
('Alice Johnson', 'alice@example.com', 'USA', '2023-01-15'),
('Bob Smith', 'bob@example.com', 'Canada', '2023-02-20'),
('Charlie Brown', 'charlie@example.com', 'UK', '2023-03-10'),
('Diana Prince', 'diana@example.com', 'USA', '2023-04-05'),
('Ethan Hunt', 'ethan@example.com', 'France', '2023-05-12'),
('Fiona Green', 'fiona@example.com', 'Germany', '2023-06-18'),
('George Miller', 'george@example.com', 'Australia', '2023-07-22'),
('Hannah Lee', 'hannah@example.com', 'South Korea', '2023-08-30'),
('Ian Malcolm', 'ian@example.com', 'USA', '2023-09-14'),
('Julia Roberts', 'julia@example.com', 'Canada', '2023-10-01');

-- Insert sample products
INSERT INTO products (name, price, category, stock_quantity) VALUES
('Laptop Pro 15', 1299.99, 'Electronics', 50),
('Wireless Mouse', 29.99, 'Electronics', 200),
('Office Chair', 199.99, 'Furniture', 75),
('Desk Lamp', 39.99, 'Furniture', 120),
('USB-C Cable', 12.99, 'Electronics', 300),
('Monitor 27"', 349.99, 'Electronics', 60),
('Keyboard Mechanical', 89.99, 'Electronics', 100),
('Notebook Pack', 14.99, 'Stationery', 250),
('Pen Set', 9.99, 'Stationery', 400),
('Coffee Mug', 12.99, 'Kitchen', 150);

-- Insert sample orders
INSERT INTO orders (customer_id, product_id, quantity, order_date, total_amount) VALUES
(1, 1, 1, '2023-11-01', 1299.99),
(1, 2, 2, '2023-11-01', 59.98),
(2, 3, 1, '2023-11-02', 199.99),
(3, 5, 3, '2023-11-03', 38.97),
(4, 1, 1, '2023-11-04', 1299.99),
(4, 6, 1, '2023-11-04', 349.99),
(5, 2, 1, '2023-11-05', 29.99),
(6, 7, 1, '2023-11-06', 89.99),
(7, 8, 5, '2023-11-07', 74.95),
(8, 9, 10, '2023-11-08', 99.90),
(9, 10, 2, '2023-11-09', 25.98),
(10, 4, 1, '2023-11-10', 39.99),
(1, 5, 5, '2023-11-11', 64.95),
(2, 1, 1, '2023-11-12', 1299.99),
(3, 6, 1, '2023-11-13', 349.99),
(4, 2, 3, '2023-11-14', 89.97),
(5, 3, 2, '2023-11-15', 399.98),
(6, 10, 1, '2023-11-16', 12.99),
(7, 1, 1, '2023-11-17', 1299.99),
(8, 7, 1, '2023-11-18', 89.99);

-- Create read-only user for sandbox execution
-- This user will only have SELECT privileges
-- Create read-only user for sandbox execution (idempotent)
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'sandbox_reader') THEN

      CREATE ROLE sandbox_reader LOGIN PASSWORD '8427tanuK@';
   ELSE
      ALTER ROLE sandbox_reader WITH PASSWORD '8427tanuK@';
   END IF;
END
$do$;
GRANT CONNECT ON DATABASE "CipherSQLStdio_DB" TO sandbox_reader;
GRANT USAGE ON SCHEMA public TO sandbox_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO sandbox_reader;

-- Ensure future tables also get SELECT permission
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO sandbox_reader;

-- Verify setup
SELECT 'Customers count:', COUNT(*) FROM customers;
SELECT 'Products count:', COUNT(*) FROM products;
SELECT 'Orders count:', COUNT(*) FROM orders;
