const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
require('dotenv').config();

router.post('/', async (req, res) => {
  const { message } = req.body;
  const hotel_id = req.hotel?.hotel_id;
  console.log('Chat hotel_id:', hotel_id);

  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    const ragRes = await fetch('http://127.0.0.1:5001/rag-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, hotel_id })
    });

    const data = await ragRes.json();
    res.json({ reply: data.reply });
  } catch (error) {
    console.error('RAG error:', error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;