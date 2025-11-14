import express from 'express';
import { auth } from '../middleware/auth.js';
import Reservation from '../models/Reservation.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/reservations
// @desc    Get user's reservations
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const reservations = await Reservation.find(query)
      .populate('hotel', 'name location images')
      .populate('room', 'name type price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Reservation.countDocuments(query);

    res.json({
      success: true,
      data: reservations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reservations',
      error: error.message
    });
  }
});

// @route   GET /api/reservations/:id
// @desc    Get reservation by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('hotel', 'name location images owner')
      .populate('room', 'name type price capacity amenities')
      .populate('user', 'name email phone')
      .populate('usedCoupon', 'code name discountType discountValue');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check if user owns this reservation or is hotel owner or admin
    const hotel = await Hotel.findById(reservation.hotel._id);
    const isOwner = reservation.user._id.equals(req.user._id);
    const isHotelOwner = hotel.owner.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isHotelOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this reservation'
      });
    }

    res.json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reservation',
      error: error.message
    });
  }
});

// @route   POST /api/reservations
// @desc    Create new reservation
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      hotelId,
      roomId,
      checkIn,
      checkOut,
      guests,
      usedPoints,
      couponCode
    } = req.body;

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past'
      });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    // Check room availability
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (room.inventory <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Room not available'
      });
    }

    if (guests > room.capacity) {
      return res.status(400).json({
        success: false,
        message: `Room capacity exceeded. Maximum ${room.capacity} guests`
      });
    }

    // Calculate nights
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    let totalPrice = room.price * nights;

    // Apply points
    const user = await User.findById(req.user._id);
    let pointsToUse = 0;
    if (usedPoints && usedPoints > 0) {
      if (usedPoints > user.points) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient points'
        });
      }
      pointsToUse = usedPoints;
      totalPrice -= pointsToUse;
    }

    // Apply coupon
    let couponId = null;
    if (couponCode) {
      const Coupon = (await import('../models/Coupon.js')).default;
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coupon code'
        });
      }

      const now = new Date();
      if (now < coupon.validFrom || now > coupon.validUntil) {
        return res.status(400).json({
          success: false,
          message: 'Coupon expired or not yet valid'
        });
      }

      if (totalPrice < coupon.minPurchase) {
        return res.status(400).json({
          success: false,
          message: `Minimum purchase amount: ${coupon.minPurchase}`
        });
      }

      if (coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({
          success: false,
          message: 'Coupon usage limit reached'
        });
      }

      // Apply discount
      if (coupon.discountType === 'percentage') {
        const discount = totalPrice * (coupon.discountValue / 100);
        const finalDiscount = coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
        totalPrice -= finalDiscount;
      } else {
        totalPrice -= coupon.discountValue;
      }

      couponId = coupon._id;
      coupon.usedCount += 1;
      await coupon.save();
    }

    // Ensure minimum price
    totalPrice = Math.max(totalPrice, 0);

    // Create reservation
    const reservation = new Reservation({
      user: req.user._id,
      hotel: hotelId,
      room: roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice,
      usedPoints: pointsToUse,
      usedCoupon: couponId,
      status: 'pending',
      payment: {
        status: 'pending'
      }
    });

    await reservation.save();

    // Update user points
    if (pointsToUse > 0) {
      user.points -= pointsToUse;
      await user.save();
    }

    // Decrease room inventory
    room.inventory -= 1;
    await room.save();

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('hotel', 'name location')
      .populate('room', 'name type price');

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: populatedReservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create reservation',
      error: error.message
    });
  }
});

// @route   PUT /api/reservations/:id/cancel
// @desc    Cancel reservation
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check ownership
    if (!reservation.user.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this reservation'
      });
    }

    // Check if already cancelled
    if (reservation.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Reservation already cancelled'
      });
    }

    // Check if already completed
    if (reservation.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed reservation'
      });
    }

    // Update status
    reservation.status = 'cancelled';
    reservation.updatedAt = Date.now();
    await reservation.save();

    // Restore room inventory
    const room = await Room.findById(reservation.room);
    if (room) {
      room.inventory += 1;
      await room.save();
    }

    // Refund points
    if (reservation.usedPoints > 0) {
      const user = await User.findById(reservation.user);
      user.points = (user.points || 0) + reservation.usedPoints;
      await user.save();
    }

    // Handle payment refund (if payment was completed)
    if (reservation.payment.status === 'completed') {
      reservation.payment.status = 'refunded';
      await reservation.save();
      // TODO: Implement Toss Payments refund API call
    }

    res.json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel reservation',
      error: error.message
    });
  }
});

// @route   GET /api/reservations/hotel/:hotelId
// @desc    Get reservations for a hotel (Business owner)
// @access  Private (Business/Admin)
router.get('/hotel/:hotelId', auth, async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && !hotel.owner.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view hotel reservations'
      });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const query = { hotel: req.params.hotelId };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const reservations = await Reservation.find(query)
      .populate('user', 'name email phone')
      .populate('room', 'name type')
      .populate('hotel', 'name')
      .sort({ checkIn: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Reservation.countDocuments(query);

    res.json({
      success: true,
      data: reservations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotel reservations',
      error: error.message
    });
  }
});

export default router;
