const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const authenticateHotel = require('./middleware/auth');

app.use('/chat', require('./routes/chat'));
app.use('/rooms', authenticateHotel, require('./routes/rooms'));
app.use('/agent', require('./routes/agent'));
app.use('/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});