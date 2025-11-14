import express from 'express';
import Inquiry from '../models/Inquiry.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/support/inquiries
// @desc    Create a new inquiry
// @access  Public
router.post('/inquiries', async (req, res) => {
  try {
    const { name, email, category, subject, message } = req.body;

    const inquiry = new Inquiry({
      userId: req.user?.id,
      name,
      email,
      category,
      subject,
      message
    });

    await inquiry.save();

    res.status(201).json({
      success: true,
      message: '문의가 접수되었습니다.',
      data: inquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '문의 접수에 실패했습니다.',
      error: error.message
    });
  }
});

// @route   GET /api/support/inquiries
// @desc    Get all inquiries (Admin only)
// @access  Private/Admin
router.get('/inquiries', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '관리자만 접근할 수 있습니다.'
      });
    }

    const { status, category, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const inquiries = await Inquiry.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Inquiry.countDocuments(query);

    res.json({
      success: true,
      data: inquiries,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '문의 목록 조회에 실패했습니다.',
      error: error.message
    });
  }
});

// @route   GET /api/support/inquiries/:id
// @desc    Get inquiry detail
// @access  Private/Admin
router.get('/inquiries/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '관리자만 접근할 수 있습니다.'
      });
    }

    const inquiry = await Inquiry.findById(req.params.id)
      .populate('userId', 'name email phone');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: '문의를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '문의 조회에 실패했습니다.',
      error: error.message
    });
  }
});

// @route   PUT /api/support/inquiries/:id/reply
// @desc    Reply to inquiry
// @access  Private/Admin
router.put('/inquiries/:id/reply', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '관리자만 접근할 수 있습니다.'
      });
    }

    const { reply } = req.body;

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      {
        adminReply: reply,
        repliedAt: new Date(),
        status: 'resolved'
      },
      { new: true }
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: '문의를 찾을 수 없습니다.'
      });
    }

    // TODO: Send email notification to user

    res.json({
      success: true,
      message: '답변이 등록되었습니다.',
      data: inquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '답변 등록에 실패했습니다.',
      error: error.message
    });
  }
});

// @route   PUT /api/support/inquiries/:id/status
// @desc    Update inquiry status
// @access  Private/Admin
router.put('/inquiries/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '관리자만 접근할 수 있습니다.'
      });
    }

    const { status } = req.body;

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: '문의를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '상태가 업데이트되었습니다.',
      data: inquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상태 업데이트에 실패했습니다.',
      error: error.message
    });
  }
});

export default router;
