const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

// Sign Up
router.post('/signup', async (req, res) => {
  const { hotel_name, email, password, phone, address } = req.body;

  if (!hotel_name || !email || !password) {
    return res.status(400).json({ error: 'Hotel name, email and password required' });
  }

  try {
    // Check if email already exists
    const existing = await pool.query(
      'SELECT * FROM hotels WHERE email = $1', [email]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create hotel
    const result = await pool.query(
      'INSERT INTO hotels (hotel_name, email, password_hash, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING id, hotel_name, email',
      [hotel_name, email, password_hash, phone, address]
    );

    const hotel = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { hotel_id: hotel.id, hotel_name: hotel.hotel_name, email: hotel.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, hotel: { id: hotel.id, hotel_name: hotel.hotel_name, email: hotel.email } });

  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    // Find hotel
    const result = await pool.query(
      'SELECT * FROM hotels WHERE email = $1', [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const hotel = result.rows[0];

    // Check password
    const valid = await bcrypt.compare(password, hotel.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { hotel_id: hotel.id, hotel_name: hotel.hotel_name, email: hotel.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, hotel: { id: hotel.id, hotel_name: hotel.hotel_name, email: hotel.email } });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Get current hotel profile
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      'SELECT id, hotel_name, email, phone, address, plan, created_at FROM hotels WHERE id = $1',
      [decoded.hotel_id]
    );
    res.json({ hotel: result.rows[0] });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;