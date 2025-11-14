import express from 'express';
import axios from 'axios';
import { auth } from '../middleware/auth.js';
import Reservation from '../models/Reservation.js';
import User from '../models/User.js';

const router = express.Router();

// @route   POST /api/payments/confirm
// @desc    Confirm Toss Payments payment
// @access  Private
router.post('/confirm', auth, async (req, res) => {
  try {
    const { paymentKey, orderId, amount } = req.body;

    if (!paymentKey || !orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment information'
      });
    }

    // Find reservation by orderId
    const reservation = await Reservation.findById(orderId);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Verify user owns this reservation
    if (!reservation.user.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Verify amount matches
    if (Number(amount) !== reservation.totalPrice) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount mismatch'
      });
    }

    // Confirm payment with Toss Payments API
    const tossSecretKey = process.env.TOSS_SECRET_KEY;
    const encodedKey = Buffer.from(tossSecretKey + ':').toString('base64');

    try {
      const response = await axios.post(
        'https://api.tosspayments.com/v1/payments/confirm',
        {
          paymentKey,
          orderId,
          amount
        },
        {
          headers: {
            Authorization: `Basic ${encodedKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const paymentData = response.data;

      // Update reservation with payment info
      reservation.payment = {
        method: paymentData.method,
        status: 'completed',
        transactionId: paymentData.paymentKey,
        paidAt: new Date()
      };
      reservation.status = 'confirmed';
      reservation.updatedAt = Date.now();

      await reservation.save();

      // Award points to user (e.g., 1% of payment)
      const pointsEarned = Math.floor(amount * 0.01);
      const user = await User.findById(req.user._id);
      user.points = (user.points || 0) + pointsEarned;
      await user.save();

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        data: {
          reservation,
          pointsEarned,
          payment: paymentData
        }
      });
    } catch (tossError) {
      console.error('Toss API Error:', tossError.response?.data);

      // Update reservation payment status to failed
      reservation.payment.status = 'failed';
      await reservation.save();

      return res.status(400).json({
        success: false,
        message: 'Payment confirmation failed',
        error: tossError.response?.data?.message || 'Unknown error'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error.message
    });
  }
});

// @route   POST /api/payments/cancel
// @desc    Cancel/Refund payment
// @access  Private
router.post('/cancel', auth, async (req, res) => {
  try {
    const { reservationId, cancelReason } = req.body;

    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Verify user owns this reservation or is admin
    if (!reservation.user.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if payment can be cancelled
    if (reservation.payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed, cannot refund'
      });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Reservation already cancelled'
      });
    }

    // Cancel payment with Toss Payments API
    const tossSecretKey = process.env.TOSS_SECRET_KEY;
    const encodedKey = Buffer.from(tossSecretKey + ':').toString('base64');

    try {
      const response = await axios.post(
        `https://api.tosspayments.com/v1/payments/${reservation.payment.transactionId}/cancel`,
        {
          cancelReason: cancelReason || 'User requested cancellation'
        },
        {
          headers: {
            Authorization: `Basic ${encodedKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update reservation
      reservation.payment.status = 'refunded';
      reservation.status = 'cancelled';
      reservation.updatedAt = Date.now();
      await reservation.save();

      res.json({
        success: true,
        message: 'Payment cancelled and refunded successfully',
        data: response.data
      });
    } catch (tossError) {
      console.error('Toss Cancel Error:', tossError.response?.data);

      return res.status(400).json({
        success: false,
        message: 'Payment cancellation failed',
        error: tossError.response?.data?.message || 'Unknown error'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Payment cancellation failed',
      error: error.message
    });
  }
});

// @route   GET /api/payments/:paymentKey
// @desc    Get payment details
// @access  Private
router.get('/:paymentKey', auth, async (req, res) => {
  try {
    const { paymentKey } = req.params;

    // Find reservation with this payment key
    const reservation = await Reservation.findOne({
      'payment.transactionId': paymentKey
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Verify user owns this reservation or is admin
    if (!reservation.user.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Get payment details from Toss
    const tossSecretKey = process.env.TOSS_SECRET_KEY;
    const encodedKey = Buffer.from(tossSecretKey + ':').toString('base64');

    try {
      const response = await axios.get(
        `https://api.tosspayments.com/v1/payments/${paymentKey}`,
        {
          headers: {
            Authorization: `Basic ${encodedKey}`
          }
        }
      );

      res.json({
        success: true,
        data: response.data
      });
    } catch (tossError) {
      console.error('Toss API Error:', tossError.response?.data);

      return res.status(400).json({
        success: false,
        message: 'Failed to fetch payment details',
        error: tossError.response?.data?.message || 'Unknown error'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: error.message
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Toss Payments webhook handler
// @access  Public (Toss server)
router.post('/webhook', async (req, res) => {
  try {
    const { eventType, data } = req.body;

    console.log('Toss Webhook:', eventType, data);

    // Handle different event types
    switch (eventType) {
      case 'PAYMENT_STATUS_CHANGED':
        // Handle payment status change
        const reservation = await Reservation.findOne({
          'payment.transactionId': data.paymentKey
        });

        if (reservation) {
          reservation.payment.status = data.status.toLowerCase();
          await reservation.save();
        }
        break;

      default:
        console.log('Unhandled webhook event:', eventType);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
