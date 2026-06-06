const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Groq = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const SYSTEM_PROMPT = `You are a helpful assistant for The Grand Hotel,
a 4-star hotel in Mumbai, India.

HOTEL POLICIES:
- Check-in time: 2:00 PM
- Check-out time: 11:00 AM
- Early check-in available for ₹500 (subject to availability)
- Late check-out available for ₹500 (until 2PM only)
- Pets allowed with ₹500 refundable deposit
- No smoking in rooms (smoking area on ground floor)
- Free WiFi throughout the property (password: grandhotel2024)

ROOMS:
- Standard Room: ₹3,500/night (1 double bed, city view, max 2 guests)
- Deluxe Room: ₹5,500/night (1 king bed, city view, max 2 guests)
- Family Room: ₹7,000/night (2 double beds, city view, max 4 guests)
- Suite: ₹9,000/night (1 king bed, separate living area, sea view, max 2 guests)
- All rooms include: AC, TV, minibar, safe, hair dryer

FOOD & DINING:
- Free breakfast included for all guests (7AM - 10AM)
- The Spice Garden Restaurant: open 7AM - 11PM
- Rooftop Bar: open 6PM - 12AM
- Room service available 24/7
- Mini bar restocked daily

FACILITIES:
- Rooftop pool: open 6AM - 10PM
- Fitness center: open 5AM - 11PM
- Spa: open 9AM - 9PM (appointment required)
- Business center: open 24/7
- Parking: free for hotel guests
- Airport pickup: ₹800 (book 24hr in advance)

CANCELLATION POLICY:
- Free cancellation up to 48 hours before check-in
- 50% charge if cancelled within 48 hours
- 100% charge if cancelled within 24 hours or no-show

NEARBY ATTRACTIONS:
- Gateway of India: 10 minutes by taxi
- Marine Drive: 5 minutes by taxi
- Chhatrapati Shivaji Museum: 15 minutes by taxi
- Colaba Market: 10 minutes walking

CONTACT:
- Front desk: +91-22-1234-5678
- Email: info@grandhotel.com
- Address: 42, Colaba Causeway, Mumbai 400001

Always be polite, warm, and concise.
If you don't know something, say: "Let me check that for you.
Please contact our front desk at +91-22-1234-5678."
Answer only hotel-related questions.
If asked something unrelated to the hotel, politely redirect.`;

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message }
      ],
      max_tokens: 1024,
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error('Groq error:', error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
// postgressssssss

const pool = require('./db');

// Get available rooms
app.get('/rooms/available', async (req, res) => {
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

// Get rooms by type
app.get('/rooms/:type', async (req, res) => {
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

// Ai to database
// AI powered room search
app.post('/rooms/search', async (req, res) => {
  const { message } = req.body;

  try {
    // Get all available rooms from database
    const result = await pool.query(
      "SELECT * FROM rooms WHERE status = 'available' ORDER BY room_type"
    );
    const rooms = result.rows;

    // Send to Groq with real database results
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are a helpful hotel assistant for The Grand Hotel.
You have access to real-time room availability data.
Answer the guest's question based on the room data provided.
Always mention room numbers, prices and availability.
Be friendly and helpful.

AVAILABLE ROOMS DATA:
${JSON.stringify(rooms, null, 2)}`
        },
        {
          role: 'user',
          content: message
        }
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

// agentic Ai 
const { runAgent } = require('./agent');

// Store conversation history (in memory for now)
const conversations = {};

app.post('/agent/chat', async (req, res) => {
  const { message, session_id } = req.body;

  if (!message || !session_id) {
    return res.status(400).json({ error: 'Message and session_id required' });
  }

  // Get or create conversation history
  if (!conversations[session_id]) {
    conversations[session_id] = [];
  }

  // Add user message to history
  conversations[session_id].push({ role: 'user', content: message });

  try {
    const result = await runAgent(conversations[session_id]);

    // Add AI response to history
    conversations[session_id].push({ role: 'assistant', content: result.reply });

    res.json(result);
  } catch (error) {
    console.error('Agent error:', error.message);
    res.status(500).json({ error: 'Agent error' });
  }
});
app.listen(5000, () => console.log('Server running on http://localhost:5000'));