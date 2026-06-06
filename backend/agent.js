const Groq = require('groq-sdk');
const pool = require('./db');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Tool definitions - these are actions the AI can take
const tools = [
  {
    type: 'function',
    function: {
      name: 'check_room_availability',
      description: 'Check if rooms of a specific type are available',
      parameters: {
        type: 'object',
        properties: {
          room_type: {
            type: 'string',
            description: 'Type of room: Standard, Deluxe, Family, or Suite'
          }
        },
        required: ['room_type']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_reservation',
      description: 'Create a hotel reservation for a guest',
      parameters: {
        type: 'object',
        properties: {
          full_name: { type: 'string', description: 'Guest full name' },
          email: { type: 'string', description: 'Guest email address' },
          phone: { type: 'string', description: 'Guest phone number' },
          id_proof_type: { type: 'string', description: 'Type of ID: Aadhar, Passport, or Driving License' },
          id_proof_number: { type: 'string', description: 'ID proof number' },
          room_type: { type: 'string', description: 'Type of room to book' },
          check_in_date: { type: 'string', description: 'Check-in date in YYYY-MM-DD format' },
          check_out_date: { type: 'string', description: 'Check-out date in YYYY-MM-DD format' },
          num_guests: { type: 'number', description: 'Number of guests' }
        },
        required: ['full_name', 'email', 'phone', 'id_proof_type', 'id_proof_number', 'room_type', 'check_in_date', 'check_out_date', 'num_guests']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_reservation',
      description: 'Get reservation details by guest email',
      parameters: {
        type: 'object',
        properties: {
          email: { type: 'string', description: 'Guest email address' }
        },
        required: ['email']
      }
    }
  }
];

// Tool execution - this is where AI decisions become real actions
async function executeTool(toolName, toolArgs) {
  console.log(`Executing tool: ${toolName}`, toolArgs);

  if (toolName === 'check_room_availability') {
    const result = await pool.query(
      "SELECT * FROM rooms WHERE LOWER(room_type) = LOWER($1) AND status = 'available'",
      [toolArgs.room_type]
    );
    if (result.rows.length === 0) {
      return { available: false, message: `No ${toolArgs.room_type} rooms available` };
    }
    return { available: true, rooms: result.rows, count: result.rows.length };
  }

  if (toolName === 'create_reservation') {
    // Find available room of requested type
    const roomResult = await pool.query(
      "SELECT * FROM rooms WHERE LOWER(room_type) = LOWER($1) AND status = 'available' LIMIT 1",
      [toolArgs.room_type]
    );

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
        'INSERT INTO guests (full_name, email, phone, id_proof_type, id_proof_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [toolArgs.full_name, toolArgs.email, toolArgs.phone, toolArgs.id_proof_type, toolArgs.id_proof_number]
      );
      guest = newGuest.rows[0];
    }

    // Create reservation
    const reservation = await pool.query(
      'INSERT INTO reservations (guest_id, room_id, check_in_date, check_out_date, num_guests, total_amount, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [guest.id, room.id, toolArgs.check_in_date, toolArgs.check_out_date, toolArgs.num_guests, totalAmount, 'confirmed']
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
async function runAgent(conversationHistory) {
  const systemPrompt = `You are a helpful booking assistant for The Grand Hotel, Mumbai.

You have access to these tools:
- check_room_availability: Check if rooms are available
- create_reservation: Book a room for a guest
- get_reservation: Look up existing reservation

When a guest wants to book a room:
1. Check availability first
2. Collect all required information naturally through conversation:
   - Full name
   - Email
   - Phone number
   - ID proof type (Aadhar/Passport/Driving License)
   - ID proof number
   - Check-in date
   - Check-out date
   - Number of guests
3. Confirm all details before creating reservation
4. Create the reservation and confirm with booking details

For dates, today is ${new Date().toISOString().split('T')[0]}.
Always be polite, professional and helpful.
If guest asks about their booking, use get_reservation tool.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory
  ];

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: messages,
    tools: tools,
    tool_choice: 'auto',
    max_tokens: 1024,
  });

  const message = response.choices[0].message;

  // If AI wants to use a tool
  if (message.tool_calls && message.tool_calls.length > 0) {
    const toolCall = message.tool_calls[0];
    const toolName = toolCall.function.name;
    const toolArgs = JSON.parse(toolCall.function.arguments);

    // Execute the tool
    const toolResult = await executeTool(toolName, toolArgs);

    // Send tool result back to AI
    const finalResponse = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        ...messages,
        message,
        {
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult)
        }
      ],
      max_tokens: 1024,
    });

    return {
      reply: finalResponse.choices[0].message.content,
      tool_used: toolName,
      tool_result: toolResult
    };
  }

  return { reply: message.content };
}

module.exports = { runAgent };