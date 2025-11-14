import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Reservation from '../models/Reservation.js';
import Review from '../models/Review.js';
import Coupon from '../models/Coupon.js';

const router = express.Router();

// All routes require admin role
router.use(auth, requireRole('admin'));

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/stats', async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalBusinesses = await User.countDocuments({ role: 'business' });
    const totalMembers = totalUsers + totalBusinesses;
    const totalHotels = await Hotel.countDocuments();
    const totalReservations = await Reservation.countDocuments();
    const totalReviews = await Review.countDocuments();

    // Get revenue (completed payments)
    const completedReservations = await Reservation.find({
      'payment.status': 'completed'
    });
    const totalRevenue = completedReservations.reduce((sum, r) => sum + r.totalPrice, 0);

    // Pending approvals
    const pendingBusinesses = await User.countDocuments({
      role: 'business',
      businessApproved: false
    });
    const pendingHotels = await Hotel.countDocuments({ status: 'pending' });
    const pendingReports = await Review.countDocuments({
      reported: true,
      reportStatus: 'pending'
    });

    // Recent activity
    const recentReservations = await Reservation.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('hotel', 'name');

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalBusinesses,
          totalMembers,
          totalHotels,
          totalReservations,
          totalReviews,
          totalRevenue
        },
        pending: {
          pendingBusinesses,
          pendingHotels,
          pendingReports
        },
        recentActivity: recentReservations
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const { role, isBlocked, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (role) {
      query.role = role;
    }

    if (isBlocked !== undefined) {
      query.isBlocked = isBlocked === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
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
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/approve
// @desc    Approve business user
// @access  Private (Admin)
router.put('/users/:id/approve', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'business') {
      return res.status(400).json({
        success: false,
        message: 'User is not a business account'
      });
    }

    user.businessApproved = true;
    user.updatedAt = Date.now();
    await user.save();

    res.json({
      success: true,
      message: 'Business user approved successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve user',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/block
// @desc    Block/Unblock user
// @access  Private (Admin)
router.put('/users/:id/block', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot block admin users'
      });
    }

    user.isBlocked = !user.isBlocked;
    user.updatedAt = Date.now();
    await user.save();

    res.json({
      success: true,
      message: user.isBlocked ? 'User blocked successfully' : 'User unblocked successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
});

// @route   GET /api/admin/hotels
// @desc    Get all hotels (including pending)
// @access  Private (Admin)
router.get('/hotels', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const hotels = await Hotel.find(query)
      .populate('owner', 'name businessName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Hotel.countDocuments(query);

    res.json({
      success: true,
      data: hotels,
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
      message: 'Failed to fetch hotels',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/hotels/:id/status
// @desc    Update hotel status (approve/reject)
// @access  Private (Admin)
router.put('/hotels/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    hotel.status = status;
    hotel.updatedAt = Date.now();
    await hotel.save();

    res.json({
      success: true,
      message: `Hotel ${status} successfully`,
      data: hotel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update hotel status',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/reviews/:id/report
// @desc    Handle reported review
// @access  Private (Admin)
router.put('/reviews/:id/report', async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (!review.reported) {
      return res.status(400).json({
        success: false,
        message: 'Review is not reported'
      });
    }

    review.reportStatus = action;
    review.updatedAt = Date.now();

    // If approved (report is valid), hide the review
    if (action === 'approved') {
      await review.deleteOne();
      
      // Recalculate hotel rating
      const hotel = await Hotel.findById(review.hotel);
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

      return res.json({
        success: true,
        message: 'Report approved and review deleted'
      });
    } else {
      // If rejected (report is invalid), keep the review
      review.reported = false;
      review.reportReason = null;
      review.reportedBy = null;
      await review.save();

      return res.json({
        success: true,
        message: 'Report rejected, review restored',
        data: review
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to handle report',
      error: error.message
    });
  }
});

// @route   GET /api/admin/coupons
// @desc    Get all coupons
// @access  Private (Admin)
router.get('/coupons', async (req, res) => {
  try {
    const { isActive, page = 1, limit = 20 } = req.query;

    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;

    const coupons = await Coupon.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Coupon.countDocuments(query);

    res.json({
      success: true,
      data: coupons,
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
      message: 'Failed to fetch coupons',
      error: error.message
    });
  }
});

// @route   POST /api/admin/coupons
// @desc    Create new coupon
// @access  Private (Admin)
router.post('/coupons', async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      validFrom,
      validUntil,
      usageLimit
    } = req.body;

    // Check if code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      name,
      description,
      discountType,
      discountValue,
      minPurchase: minPurchase || 0,
      maxDiscount,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      usageLimit: usageLimit || 1,
      createdBy: req.user._id
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create coupon',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/coupons/:id
// @desc    Update coupon
// @access  Private (Admin)
router.put('/coupons/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    const {
      name,
      description,
      isActive,
      validFrom,
      validUntil,
      usageLimit
    } = req.body;

    if (name) coupon.name = name;
    if (description) coupon.description = description;
    if (isActive !== undefined) coupon.isActive = isActive;
    if (validFrom) coupon.validFrom = new Date(validFrom);
    if (validUntil) coupon.validUntil = new Date(validUntil);
    if (usageLimit) coupon.usageLimit = usageLimit;

    await coupon.save();

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update coupon',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/coupons/:id
// @desc    Delete coupon
// @access  Private (Admin)
router.delete('/coupons/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    await coupon.deleteOne();

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete coupon',
      error: error.message
    });
  }
});

export default router;
