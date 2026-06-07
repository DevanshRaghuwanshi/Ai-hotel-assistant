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
    curr.check_in_date, curr.check_out_date,
    g.full_name as guest_name, g.phone as guest_phone,
    next_res.check_in_date as next_check_in,
    CASE 
      WHEN curr.id IS NOT NULL THEN 'occupied'
      ELSE 'available'
    END as dynamic_status
  FROM rooms r
  LEFT JOIN reservations curr ON r.id = curr.room_id 
    AND curr.status = 'confirmed'
    AND curr.check_in_date <= CURRENT_DATE 
    AND curr.check_out_date > CURRENT_DATE
  LEFT JOIN guests g ON curr.guest_id = g.id
  LEFT JOIN reservations next_res ON r.id = next_res.room_id
    AND next_res.status = 'confirmed'
    AND next_res.check_in_date > CURRENT_DATE
  ORDER BY r.room_number
`);
 res.json({ rooms: result.rows.map(r => ({...r, status: r.dynamic_status})) });
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
});
//booking history
router.get('/bookings', async (req, res) => {
  try {
    const { name, email, date } = req.query;
    
    let query = `
      SELECT 
        r.id as reservation_id,
        g.full_name as guest_name,
        g.email,
        g.phone,
        rm.room_number,
        rm.room_type,
        r.check_in_date,
        r.check_out_date,
        r.num_guests,
        r.total_amount,
        r.status,
        r.created_at
      FROM reservations r
      JOIN guests g ON r.guest_id = g.id
      JOIN rooms rm ON r.room_id = rm.id
      WHERE 1=1
    `;
    
    const params = [];

    if (name) {
      params.push(`%${name}%`);
      query += ` AND LOWER(g.full_name) LIKE LOWER($${params.length})`;
    }

    if (email) {
      params.push(`%${email}%`);
      query += ` AND LOWER(g.email) LIKE LOWER($${params.length})`;
    }

    if (date) {
      params.push(date);
      query += ` AND (r.check_in_date = $${params.length} OR r.check_out_date = $${params.length})`;
    }

    query += ` ORDER BY r.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ bookings: result.rows });
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