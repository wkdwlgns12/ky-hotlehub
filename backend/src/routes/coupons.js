import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/coupons
// @desc    Get all active coupons (Public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    })
      .populate('createdBy', 'name businessName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Coupon.countDocuments({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    });

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

// @route   GET /api/coupons/my
// @desc    Get coupons created by current user (Admin/Business)
// @access  Private (Admin/Business)
router.get('/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'business') {
      return res.status(403).json({
        success: false,
        message: 'Only admin and business users can create coupons'
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const coupons = await Coupon.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Coupon.countDocuments({ createdBy: req.user._id });

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

// @route   GET /api/coupons/verify/:code
// @desc    Verify coupon code
// @access  Private
router.get('/verify/:code', auth, async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ 
      code: req.params.code.toUpperCase(),
      isActive: true
    }).populate('createdBy', 'name businessName');

    if (!coupon) {
      return res.status(404).json({
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

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit reached'
      });
    }

    res.json({
      success: true,
      message: 'Valid coupon',
      data: coupon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify coupon',
      error: error.message
    });
  }
});

// @route   POST /api/coupons
// @desc    Create new coupon (Admin/Business)
// @access  Private (Admin/Business)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin or business
    if (req.user.role !== 'admin' && req.user.role !== 'business') {
      return res.status(403).json({
        success: false,
        message: 'Only admin and business users can create coupons'
      });
    }

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

    // Validate required fields
    if (!code || !name || !discountType || !discountValue || !validFrom || !validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    // Validate discount value
    if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount must be between 1 and 100'
      });
    }

    if (discountType === 'fixed' && discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Fixed discount must be greater than 0'
      });
    }

    // Validate dates
    const fromDate = new Date(validFrom);
    const untilDate = new Date(validUntil);
    
    if (untilDate <= fromDate) {
      return res.status(400).json({
        success: false,
        message: 'Valid until date must be after valid from date'
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
      validFrom: fromDate,
      validUntil: untilDate,
      usageLimit: usageLimit || 100, // Default 100 uses
      createdBy: req.user._id
    });

    await coupon.save();

    const populatedCoupon = await Coupon.findById(coupon._id)
      .populate('createdBy', 'name businessName');

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: populatedCoupon
    });
  } catch (error) {
    console.error('Coupon creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create coupon',
      error: error.message
    });
  }
});

// @route   PUT /api/coupons/:id
// @desc    Update coupon (Owner/Admin)
// @access  Private (Owner/Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Check authorization - only creator or admin can update
    if (!coupon.createdBy.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this coupon'
      });
    }

    const {
      name,
      description,
      isActive,
      validFrom,
      validUntil,
      usageLimit,
      minPurchase,
      maxDiscount
    } = req.body;

    if (name) coupon.name = name;
    if (description !== undefined) coupon.description = description;
    if (isActive !== undefined) coupon.isActive = isActive;
    if (minPurchase !== undefined) coupon.minPurchase = minPurchase;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
    if (usageLimit) coupon.usageLimit = usageLimit;
    
    if (validFrom) {
      const fromDate = new Date(validFrom);
      if (validUntil) {
        const untilDate = new Date(validUntil);
        if (untilDate <= fromDate) {
          return res.status(400).json({
            success: false,
            message: 'Valid until date must be after valid from date'
          });
        }
        coupon.validUntil = untilDate;
      }
      coupon.validFrom = fromDate;
    } else if (validUntil) {
      const untilDate = new Date(validUntil);
      if (untilDate <= coupon.validFrom) {
        return res.status(400).json({
          success: false,
          message: 'Valid until date must be after valid from date'
        });
      }
      coupon.validUntil = untilDate;
    }

    await coupon.save();

    const populatedCoupon = await Coupon.findById(coupon._id)
      .populate('createdBy', 'name businessName');

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: populatedCoupon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update coupon',
      error: error.message
    });
  }
});

// @route   DELETE /api/coupons/:id
// @desc    Delete coupon (Owner/Admin)
// @access  Private (Owner/Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Check authorization - only creator or admin can delete
    if (!coupon.createdBy.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this coupon'
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
