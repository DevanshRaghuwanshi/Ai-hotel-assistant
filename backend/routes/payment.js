const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const pool = require('../db');
require('dotenv').config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLANS = {
  starter: { amount: 0, name: 'Starter' },
  professional: { amount: 200000, name: 'Professional' }, // ₹2000 in paise
  enterprise: { amount: 500000, name: 'Enterprise' },     // ₹5000 in paise
};

// Create order
router.post('/create-order', async (req, res) => {
  const { plan } = req.body;
  const hotel_id = req.hotel?.hotel_id;

  if (!PLANS[plan]) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  // Free plan — no payment needed
  if (PLANS[plan].amount === 0) {
    await pool.query(
      'UPDATE hotels SET plan = $1 WHERE id = $2',
      [plan, hotel_id]
    );
    return res.json({ free: true, plan });
  }

  try {
    const order = await razorpay.orders.create({
      amount: PLANS[plan].amount,
      currency: 'INR',
      receipt: `order_hotel_${hotel_id}_${Date.now()}`,
      notes: { hotel_id, plan }
    });

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      plan
    });
  } catch (error) {
    console.error('Razorpay error:', error.message);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment
router.post('/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
  const hotel_id = req.hotel?.hotel_id;

  try {
    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Update hotel plan
    await pool.query(
      'UPDATE hotels SET plan = $1 WHERE id = $2',
      [plan, hotel_id]
    );

    res.json({ success: true, plan });
  } catch (error) {
    console.error('Verify error:', error.message);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Get current plan
router.get('/plan', async (req, res) => {
  const hotel_id = req.hotel?.hotel_id;
  try {
    const result = await pool.query(
      'SELECT plan FROM hotels WHERE id = $1',
      [hotel_id]
    );
    res.json({ plan: result.rows[0]?.plan || 'starter' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get plan' });
  }
});

module.exports = router;