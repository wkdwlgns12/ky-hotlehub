import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import Review from '../models/Review.js';
import Reservation from '../models/Reservation.js';
import Hotel from '../models/Hotel.js';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/reviews
// @desc    Get reviews (with filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { hotelId, userId, rating, page = 1, limit = 10 } = req.query;

    const query = {};

    if (hotelId) {
      query.hotel = hotelId;
    }

    if (userId) {
      query.user = userId;
    }

    if (rating) {
      query.rating = Number(rating);
    }

    // Don't show reported reviews to public
    query.reported = false;

    const skip = (page - 1) * limit;

    const reviews = await Review.find(query)
      .populate('user', 'name')
      .populate('hotel', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      data: reviews,
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
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
});

// @route   GET /api/reviews/:id
// @desc    Get review by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name')
      .populate('hotel', 'name location')
      .populate('reservation');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review',
      error: error.message
    });
  }
});

// @route   POST /api/reviews
// @desc    Create new review
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { hotel, reservationId, rating, comment, images } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Validate hotel
    if (!hotel) {
      return res.status(400).json({
        success: false,
        message: 'Hotel is required'
      });
    }

    let hotelId = hotel;
    let reservationData = null;

    // If reservationId is provided, validate it
    if (reservationId) {
      const reservation = await Reservation.findById(reservationId);

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
          message: 'Not authorized to review this reservation'
        });
      }

      // Check if reservation is completed
      if (reservation.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Can only review completed reservations'
        });
      }

      // Check if already reviewed
      const existingReview = await Review.findOne({ reservation: reservationId });
      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'Already reviewed this reservation'
        });
      }

      hotelId = reservation.hotel;
      reservationData = reservationId;
    } else {
      // Check if user already reviewed this hotel (without reservation)
      const existingReview = await Review.findOne({ 
        user: req.user._id, 
        hotel: hotelId,
        reservation: { $exists: false }
      });
      
      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this hotel'
        });
      }
    }

    // Create review
    const review = new Review({
      user: req.user._id,
      hotel: hotelId,
      reservation: reservationData,
      rating,
      comment,
      images: images || []
    });

    await review.save();

    // Update hotel rating
    const hotelDoc = await Hotel.findById(hotelId);
    const reviews = await Review.find({ hotel: hotelId, reported: false });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    hotelDoc.rating = Math.round(avgRating * 10) / 10; // Round to 1 decimal
    hotelDoc.reviewCount = reviews.length;
    await hotelDoc.save();

    // Award points to user for writing review
    const user = await User.findById(req.user._id);
    const reviewPoints = 500; // 500 points for writing a review
    user.points = (user.points || 0) + reviewPoints;
    await user.save();

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name')
      .populate('hotel', 'name');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: populatedReview,
      pointsEarned: reviewPoints
    });
  } catch (error) {
    console.error('Review creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private (Owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (!review.user.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    const { rating, comment, images } = req.body;

    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }
      review.rating = rating;
    }

    if (comment) review.comment = comment;
    if (images) review.images = images;
    review.updatedAt = Date.now();

    await review.save();

    // Recalculate hotel rating
    const hotel = await Hotel.findById(review.hotel);
    const reviews = await Review.find({ hotel: hotel._id, reported: false });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    hotel.rating = Math.round(avgRating * 10) / 10;
    await hotel.save();

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private (Owner or Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('hotel');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check authorization:
    // 1. Review owner can delete their own review
    // 2. Admin can delete any review
    // 3. Hotel owner can delete reviews on their hotel
    const isOwner = review.user.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';
    const isHotelOwner = req.user.role === 'business' && review.hotel.owner.equals(req.user._id);

    if (!isOwner && !isAdmin && !isHotelOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.deleteOne();

    // Recalculate hotel rating
    const hotel = await Hotel.findById(review.hotel._id || review.hotel);
    const reviews = await Review.find({ hotel: hotel._id, reported: false });
    
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      hotel.rating = Math.round(avgRating * 10) / 10;
      hotel.reviewCount = reviews.length;
    } else {
      hotel.rating = 0;
      hotel.reviewCount = 0;
    }
    
    await hotel.save();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
});

// @route   POST /api/reviews/:id/report
// @desc    Report a review (Any authenticated user)
// @access  Private
router.post('/:id/report', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('hotel');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Users cannot report their own reviews
    if (review.user.equals(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot report your own review'
      });
    }

    if (review.reported) {
      return res.status(400).json({
        success: false,
        message: 'Review already reported'
      });
    }

    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Report reason is required'
      });
    }

    review.reported = true;
    review.reportReason = reason;
    review.reportedBy = req.user._id;
    review.reportStatus = 'pending';
    review.updatedAt = Date.now();

    await review.save();

    res.json({
      success: true,
      message: 'Review reported successfully. Admin will review it shortly.',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to report review',
      error: error.message
    });
  }
});

// @route   GET /api/reviews/reported
// @desc    Get reported reviews (Admin only)
// @access  Private (Admin)
router.get('/admin/reported', auth, requireRole('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = { reported: true };

    if (status) {
      query.reportStatus = status;
    }

    const skip = (page - 1) * limit;

    const reviews = await Review.find(query)
      .populate('user', 'name email')
      .populate('hotel', 'name')
      .populate('reportedBy', 'name businessName')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      data: reviews,
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
      message: 'Failed to fetch reported reviews',
      error: error.message
    });
  }
});

export default router;
