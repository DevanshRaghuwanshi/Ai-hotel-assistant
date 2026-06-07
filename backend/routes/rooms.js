const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const pool = require('../db');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Get all available rooms
router.get('/available', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM rooms WHERE status = 'available' ORDER BY room_type"
    );
    res.json({ rooms: result.rows });
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all rooms with full status (for staff dashboard)
router.get('/all', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, 
        res.check_in_date, res.check_out_date,
        g.full_name as guest_name, g.phone as guest_phone
      FROM rooms r
      LEFT JOIN reservations res ON r.id = res.room_id 
        AND res.status = 'confirmed'
        AND res.check_in_date <= CURRENT_DATE 
        AND res.check_out_date > CURRENT_DATE
      LEFT JOIN guests g ON res.guest_id = g.id
      ORDER BY r.room_number
    `);
    res.json({ rooms: result.rows });
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get rooms by type
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const result = await pool.query(
      "SELECT * FROM rooms WHERE LOWER(room_type) = LOWER($1) AND status = 'available'",
      [type]
    );
    res.json({ rooms: result.rows });
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// AI powered room search
router.post('/search', async (req, res) => {
  const { message } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM rooms WHERE status = 'available' ORDER BY room_type"
    );
    const rooms = result.rows;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a helpful hotel assistant for The Grand Hotel.
Answer the guest's question based on the room data provided.
Always mention room numbers, prices and availability.

AVAILABLE ROOMS:
${JSON.stringify(rooms, null, 2)}`
        },
        { role: 'user', content: message }
      ],
      max_tokens: 1024,
    });

    res.json({
      reply: response.choices[0].message.content,
      rooms: rooms
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;