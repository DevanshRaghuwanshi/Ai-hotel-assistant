const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
require('dotenv').config();

// Setup upload folder
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const hotel_id = req.hotel?.hotel_id;
    cb(null, `hotel_${hotel_id}_${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF and TXT files allowed'));
  }
});

router.post('/upload', upload.single('document'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const hotel_id = req.hotel?.hotel_id;
  const filePath = req.file.path;

  try {
    // Call RAG service to index the document
    const ragRes = await fetch('http://127.0.0.1:5001/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_path: filePath,
        hotel_id: hotel_id,
        file_name: req.file.originalname
      })
    });

    const ragData = await ragRes.json();

    if (!ragRes.ok) {
      return res.status(500).json({ error: 'Failed to index document' });
    }

    res.json({
      message: 'Document uploaded and indexed successfully',
      file: req.file.originalname,
      chunks: ragData.chunks
    });

  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;