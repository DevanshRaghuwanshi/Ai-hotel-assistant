const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a helpful assistant for The Grand Hotel,
a 4-star hotel in Mumbai, India.

Hotel Policies:
- Check-in time: 2:00 PM
- Check-out time: 11:00 AM
- Pets allowed with ₹500 refundable deposit
- Free breakfast included for all guests (7AM - 10AM)
- Rooftop pool open 6AM - 10PM
- Free WiFi throughout the property
- Cancellation is free up to 48 hours before check-in
- Airport pickup available for ₹800 (book 24hr in advance)

Always be polite, warm, and concise.`;

router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message }
      ],
      max_tokens: 1024,
    });
    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;