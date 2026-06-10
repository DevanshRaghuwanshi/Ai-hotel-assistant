const Groq = require('groq-sdk');
const pool = require('./db');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });



// Tool execution - this is where AI decisions become real actions
async function executeTool(toolName, toolArgs) {
  console.log(`Executing tool: ${toolName}`, toolArgs);

if (toolName === 'check_room_availability') {
    const result = await pool.query(`
      SELECT r.* FROM rooms r
      WHERE LOWER(r.room_type) = LOWER($1)
      AND r.hotel_id = $2
      AND r.id NOT IN (
        SELECT room_id FROM reservations 
        WHERE status = 'confirmed'
        AND check_in_date <= CURRENT_DATE 
        AND check_out_date > CURRENT_DATE
      )
    `, [toolArgs.room_type, toolArgs.hotel_id]);
    if (result.rows.length === 0) {
      return { available: false, message: `No ${toolArgs.room_type} rooms available` };
    }
    return { available: true, rooms: result.rows, count: result.rows.length };
  }

  if (toolName === 'create_reservation') {
    toolArgs.num_guests = parseInt(toolArgs.num_guests);
      // Validate all required fields
  if (!toolArgs.full_name || toolArgs.full_name.trim() === '') {
    return { success: false, message: 'Guest name is required' };
  }
  if (!toolArgs.email || !toolArgs.email.includes('@')) {
    return { success: false, message: 'Valid email is required' };
  }
  if (!toolArgs.phone) {
    return { success: false, message: 'Phone number is required' };
  }
  if (!toolArgs.id_proof_number) {
    return { success: false, message: 'ID proof is required' };
  }

  // Check for duplicate reservation
  const duplicate = await pool.query(
    `SELECT * FROM reservations r 
     JOIN guests g ON r.guest_id = g.id 
     WHERE g.email = $1 
     AND r.check_in_date = $2 
     AND r.status = 'confirmed'`,
    [toolArgs.email, toolArgs.check_in_date]
  );

  if (duplicate.rows.length > 0) {
    return { success: false, message: 'A reservation already exists for this guest on this date' };
  }
    // Find available room of requested type
const roomResult = await pool.query(`
      SELECT * FROM rooms r
      WHERE LOWER(r.room_type) = LOWER($1)
      AND r.hotel_id = $2
      AND r.id NOT IN (
        SELECT room_id FROM reservations 
        WHERE status = 'confirmed'
        AND check_in_date <= CURRENT_DATE 
        AND check_out_date > CURRENT_DATE
      )
      LIMIT 1
    `, [toolArgs.room_type, toolArgs.hotel_id]);
    if (roomResult.rows.length === 0) {
      return { success: false, message: 'No rooms available for this type' };
    }

    const room = roomResult.rows[0];

    // Calculate total amount
    const checkIn = new Date(toolArgs.check_in_date);
    const checkOut = new Date(toolArgs.check_out_date);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalAmount = nights * room.price_per_night;

    // Create or find guest
    let guest;
    const existingGuest = await pool.query(
      'SELECT * FROM guests WHERE email = $1',
      [toolArgs.email]
    );

    if (existingGuest.rows.length > 0) {
      guest = existingGuest.rows[0];
    } else {
const newGuest = await pool.query(
  'INSERT INTO guests (full_name, email, phone, id_proof_type, id_proof_number, hotel_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
  [toolArgs.full_name, toolArgs.email, toolArgs.phone, toolArgs.id_proof_type, toolArgs.id_proof_number, toolArgs.hotel_id]
);
      guest = newGuest.rows[0];
    }

    // Create reservation
const reservation = await pool.query(
      'INSERT INTO reservations (guest_id, room_id, check_in_date, check_out_date, num_guests, total_amount, status, hotel_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [guest.id, room.id, toolArgs.check_in_date, toolArgs.check_out_date, toolArgs.num_guests, totalAmount, 'confirmed', toolArgs.hotel_id]
    );

    // Mark room as occupied
    await pool.query(
      "UPDATE rooms SET status = 'occupied' WHERE id = $1",
      [room.id]
    );

    return {
      success: true,
      reservation_id: reservation.rows[0].id,
      guest_name: toolArgs.full_name,
      room_number: room.room_number,
      room_type: room.room_type,
      check_in: toolArgs.check_in_date,
      check_out: toolArgs.check_out_date,
      nights: nights,
      total_amount: totalAmount,
      message: 'Reservation created successfully'
    };
  }

  if (toolName === 'get_reservation') {
    const result = await pool.query(
      `SELECT r.*, g.full_name, g.email, g.phone, rm.room_number, rm.room_type 
       FROM reservations r 
       JOIN guests g ON r.guest_id = g.id 
       JOIN rooms rm ON r.room_id = rm.id 
       WHERE g.email = $1 
       ORDER BY r.created_at DESC LIMIT 1`,
      [toolArgs.email]
    );

    if (result.rows.length === 0) {
      return { found: false, message: 'No reservation found for this email' };
    }

    return { found: true, reservation: result.rows[0] };
  }
}

// Main agent function
async function runAgent(conversationHistory, hotel_id) {
  const systemPrompt = `You are a booking assistant for The Grand Hotel, Mumbai.
Today's date is ${new Date().toISOString().split('T')[0]}.

When a guest wants to book a room, collect these details one by one:
- full_name
- email
- phone
- id_proof_type (Aadhar, Passport, or Driving License)
- id_proof_number
- room_type (Standard, Deluxe, Family, Suite)
- check_in_date (YYYY-MM-DD)
- check_out_date (YYYY-MM-DD)
- num_guests (number)

When you have ALL details confirmed by the guest, respond with ONLY this JSON and absolutely nothing else before or after it:
{"action": "create_reservation", "full_name": "...", "email": "...", "phone": "...", "id_proof_type": "...", "id_proof_number": "...", "room_type": "...", "check_in_date": "...", "check_out_date": "...", "num_guests": 1}

For availability questions respond with:
{"action": "check_availability", "room_type": "..."}

For looking up bookings respond with:
{"action": "get_reservation", "email": "..."}
- NEVER show the JSON to the guest
- NEVER ask the guest to confirm the JSON
- Just output the raw JSON silently when ready to book
- NEVER call create_reservation if full_name is empty or missing
- NEVER call create_reservation twice for the same guest

For general questions just answer normally in plain text.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory
  ];

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: messages,
    max_tokens: 1024,
  });

  const content = response.choices[0].message.content.trim();

  // Try to parse as JSON action
  try {
    const parsed = JSON.parse(content);

    if (parsed.action === 'create_reservation') {
      parsed.num_guests = parseInt(parsed.num_guests);
      parsed.hotel_id = hotel_id;
        console.log('hotel_id being set:', hotel_id);
      const result = await executeTool('create_reservation', parsed);
      if (result.success) {
        return {
          reply: `Booking confirmed! Here are your details:\n- Reservation ID: ${result.reservation_id}\n- Guest: ${result.guest_name}\n- Room: ${result.room_number} (${result.room_type})\n- Check-in: ${result.check_in}\n- Check-out: ${result.check_out}\n- Nights: ${result.nights}\n- Total: ₹${result.total_amount}\n\nWe look forward to welcoming you at The Grand Hotel!`,
          tool_used: 'create_reservation',
          tool_result: result
        };
      } else {
        return { reply: `Sorry, ${result.message}. Please try a different room type.` };
      }
    }

    if (parsed.action === 'check_availability') {
      const result = await executeTool('check_room_availability', { room_type: parsed.room_type, hotel_id: hotel_id });
      if (result.available) {
        const roomList = result.rooms.map(r => `Room ${r.room_number} - ₹${r.price_per_night}/night`).join('\n');
        return { reply: `We have ${result.count} ${parsed.room_type} room(s) available:\n${roomList}` };
      } else {
        return { reply: `Sorry, no ${parsed.room_type} rooms are available right now.` };
      }
    }

    if (parsed.action === 'get_reservation') {
      const result = await executeTool('get_reservation', { email: parsed.email });
      if (result.found) {
        const r = result.reservation;
        return { reply: `Found your reservation:\n- Room: ${r.room_number} (${r.room_type})\n- Check-in: ${r.check_in_date}\n- Check-out: ${r.check_out_date}\n- Status: ${r.status}\n- Total: ₹${r.total_amount}` };
      } else {
        return { reply: 'No reservation found for that email.' };
      }
    }

  } catch (e) {
    // Not JSON — just a normal text response
  }

  return { reply: content };
}

module.exports = { runAgent };