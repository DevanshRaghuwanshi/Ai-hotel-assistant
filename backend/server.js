const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/chat', require('./routes/chat'));
app.use('/rooms', require('./routes/rooms'));
app.use('/agent', require('./routes/agent'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});