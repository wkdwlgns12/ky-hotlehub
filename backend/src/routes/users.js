import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('coupons');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
});

// @route   PUT /api/users/me
// @desc    Update user profile
// @access  Private
router.put('/me', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    user.updatedAt = Date.now();

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// @route   PUT /api/users/me/password
// @desc    Change password
// @access  Private
router.put('/me/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const user = await User.findById(req.user._id);

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    user.password = newPassword;
    user.updatedAt = Date.now();
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

// @route   GET /api/users/me/points
// @desc    Get user points history
// @access  Private
router.get('/me/points', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('points pointsHistory')
      .populate('pointsHistory.relatedReservation', 'hotelId checkIn checkOut');

    // Sort history by date descending (newest first)
    const sortedHistory = (user.pointsHistory || [])
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        balance: user.points || 0,
        history: sortedHistory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch points',
      error: error.message
    });
  }
});

// @route   POST /api/users/me/points
// @desc    Add points (for testing/admin)
// @access  Private
router.post('/me/points', auth, async (req, res) => {
  try {
    const { amount, description, type = 'earned' } = req.body;

    if (!amount || !description) {
      return res.status(400).json({
        success: false,
        message: 'Amount and description are required'
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update points balance
    if (type === 'earned') {
      user.points += amount;
    } else if (type === 'used') {
      if (user.points < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient points'
        });
      }
      user.points -= amount;
    }

    // Add to history
    user.pointsHistory.push({
      type,
      amount,
      description,
      date: new Date()
    });

    await user.save();

    res.json({
      success: true,
      message: 'Points updated successfully',
      data: {
        balance: user.points,
        history: user.pointsHistory.sort((a, b) => new Date(b.date) - new Date(a.date))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update points',
      error: error.message
    });
  }
});

// @route   DELETE /api/users/me
// @desc    Delete user account
// @access  Private
router.delete('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user
    await User.findByIdAndDelete(req.user._id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
});

export default router;
