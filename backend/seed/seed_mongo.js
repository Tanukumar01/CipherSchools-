import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Assignment from '../models/Assignment.js';

dotenv.config();

/**
 * MongoDB Seed Script
 * Populates the database with sample SQL assignments
 */

const assignments = [
  {
    title: 'Top Customers by Order Value',
    difficulty: 'Medium',
    shortDescription: 'Find the top 5 customers by total order value using JOINs and aggregation',
    question: `Write a SQL query to find the top 5 customers by total order value. 
    
Your query should:
- Join the customers and orders tables
- Calculate the total amount spent by each customer
- Order the results by total spending (highest first)
- Limit the results to the top 5 customers
- Include customer name, email, and total spent`,
    sampleSchemas: [
      {
        table: 'customers',
        columns: ['id', 'name', 'email', 'country', 'join_date'],
        sampleRows: [
          [1, 'Alice Johnson', 'alice@example.com', 'USA', '2023-01-15'],
          [2, 'Bob Smith', 'bob@example.com', 'Canada', '2023-02-20'],
          [3, 'Charlie Brown', 'charlie@example.com', 'UK', '2023-03-10']
        ]
      },
      {
        table: 'orders',
        columns: ['id', 'customer_id', 'product_id', 'quantity', 'order_date', 'total_amount'],
        sampleRows: [
          [1, 1, 1, 1, '2023-11-01', 1299.99],
          [2, 1, 2, 2, '2023-11-01', 59.98],
          [3, 2, 3, 1, '2023-11-02', 199.99]
        ]
      }
    ]
  },
  {
    title: 'Products by Category',
    difficulty: 'Easy',
    shortDescription: 'Count products in each category and calculate average price',
    question: `Write a SQL query to analyze products by category.
    
Your query should:
- Group products by category
- Count the number of products in each category
- Calculate the average price per category
- Order results by number of products (descending)
- Include category name, product count, and average price (rounded to 2 decimals)`,
    sampleSchemas: [
      {
        table: 'products',
        columns: ['id', 'name', 'price', 'category', 'stock_quantity'],
        sampleRows: [
          [1, 'Laptop Pro 15', 1299.99, 'Electronics', 50],
          [2, 'Wireless Mouse', 29.99, 'Electronics', 200],
          [3, 'Office Chair', 199.99, 'Furniture', 75]
        ]
      }
    ]
  },
  {
    title: 'Monthly Revenue Trend',
    difficulty: 'Hard',
    shortDescription: 'Calculate total revenue for each month using date functions',
    question: `Write a SQL query to analyze monthly revenue trends.
    
Your query should:
- Extract the year and month from order_date
- Calculate the total revenue for each month
- Count the number of orders per month
- Order results chronologically (oldest to newest)
- Format the output as: year, month, total_revenue, order_count

Hint: Use date functions like EXTRACT() or DATE_TRUNC()`,
    sampleSchemas: [
      {
        table: 'orders',
        columns: ['id', 'customer_id', 'product_id', 'quantity', 'order_date', 'total_amount'],
        sampleRows: [
          [1, 1, 1, 1, '2023-11-01', 1299.99],
          [2, 1, 2, 2, '2023-11-01', 59.98],
          [3, 2, 3, 1, '2023-11-02', 199.99]
        ]
      }
    ]
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing assignments
    await Assignment.deleteMany({});
    console.log('✓ Cleared existing assignments');

    // Insert new assignments
    await Assignment.insertMany(assignments);
    console.log(`✓ Inserted ${assignments.length} assignments`);

    console.log('\n✅ Database seeding completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
