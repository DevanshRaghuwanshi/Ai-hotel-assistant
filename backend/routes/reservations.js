const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/manual', async (req, res) => {
  const { full_name, email, phone, id_proof_type, id_proof_number, room_id, check_in_date, check_out_date, num_guests } = req.body;
  const hotel_id = req.hotel?.hotel_id;

  try {
    // Get room details
    const roomResult = await pool.query(
      'SELECT * FROM rooms WHERE id = $1 AND hotel_id = $2',
      [room_id, hotel_id]
    );

    if (roomResult.rows.length === 0) {
      return res.status(400).json({ error: 'Room not found' });
    }

    const room = roomResult.rows[0];

    // Calculate total
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalAmount = nights * room.price_per_night;

    // Create or find guest
    let guest;
    const existingGuest = await pool.query(
      'SELECT * FROM guests WHERE email = $1 AND hotel_id = $2',
      [email, hotel_id]
    );

    if (existingGuest.rows.length > 0) {
      guest = existingGuest.rows[0];
    } else {
      const newGuest = await pool.query(
        'INSERT INTO guests (full_name, email, phone, id_proof_type, id_proof_number, hotel_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [full_name, email, phone, id_proof_type, id_proof_number, hotel_id]
      );
      guest = newGuest.rows[0];
    }

    // Create reservation
    const reservation = await pool.query(
      'INSERT INTO reservations (guest_id, room_id, check_in_date, check_out_date, num_guests, total_amount, status, hotel_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [guest.id, room.id, check_in_date, check_out_date, num_guests, totalAmount, 'confirmed', hotel_id]
    );

    res.json({
      reservation_id: reservation.rows[0].id,
      guest_name: full_name,
      room_number: room.room_number,
      room_type: room.room_type,
      check_in: check_in_date,
      check_out: check_out_date,
      nights,
      total_amount: totalAmount
    });

  } catch (error) {
    console.error('Manual reservation error:', error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;