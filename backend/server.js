const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const authenticateHotel = require('./middleware/auth');
const planGate = require('./middleware/planGate');

app.use('/payment', authenticateHotel, require('./routes/payment'));
app.use('/documents', authenticateHotel, require('./routes/documents'));
app.use('/rooms', authenticateHotel, require('./routes/rooms'));
app.use('/reservations', authenticateHotel, require('./routes/reservations'));
app.use('/auth', require('./routes/auth'));
app.use('/chat', authenticateHotel, planGate, require('./routes/chat'));
app.use('/agent', authenticateHotel, planGate, require('./routes/agent'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});