const express = require('express');
const router = express.Router();
const { runAgent } = require('../agent');

const conversations = {};

router.post('/chat', async (req, res) => {
  const { message, session_id } = req.body;

  if (!message || !session_id) {
    return res.status(400).json({ error: 'Message and session_id required' });
  }

  if (!conversations[session_id]) {
    conversations[session_id] = [];
  }

  conversations[session_id].push({ role: 'user', content: message });

  try {
    const result = await runAgent(conversations[session_id]);
    conversations[session_id].push({ role: 'assistant', content: result.reply });
    res.json(result);
  } catch (error) {
    console.error('Agent error:', error.message);
    res.status(500).json({ error: 'Agent error' });
  }
});

module.exports = router;