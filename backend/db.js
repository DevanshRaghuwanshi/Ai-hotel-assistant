const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'hotel_db',
  user: 'postgres',
  password: process.env.DB_PASSWORD,
});

pool.connect((err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to PostgreSQL successfully');
  }
});

module.exports = pool;