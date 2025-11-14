import express from 'express';
import { body } from 'express-validator';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import axios from 'axios';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim()
], async (req, res) => {
  try {
    const { email, password, name, phone, role, businessName, businessNumber } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Validate business fields if role is business
    if (role === 'business') {
      if (!businessName || !businessNumber) {
        return res.status(400).json({
          success: false,
          message: 'Business name and number are required for business accounts'
        });
      }
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      phone,
      role: role || 'user',
      socialProvider: 'local',
      businessName: role === 'business' ? businessName : undefined,
      businessNumber: role === 'business' ? businessNumber : undefined,
      businessApproved: role === 'business' ? false : undefined
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: role === 'business' 
        ? 'Business account created. Waiting for admin approval.' 
        : 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        points: user.points,
        businessApproved: user.businessApproved,
        businessName: user.businessName
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Account is blocked'
      });
    }

    // Check if business account is approved
    if (user.role === 'business' && !user.businessApproved) {
      return res.status(403).json({
        success: false,
        message: 'Business account is pending approval'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        points: user.points,
        businessApproved: user.businessApproved,
        businessName: user.businessName
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// @route   GET /api/auth/kakao
// @desc    Kakao OAuth login
// @access  Public
router.get('/kakao', (req, res) => {
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`;
  res.redirect(kakaoAuthUrl);
});

// @route   GET /api/auth/kakao/callback
// @desc    Kakao OAuth callback
// @access  Public
router.get('/kakao/callback', async (req, res) => {
  try {
    const { code } = req.query;

    // Get access token
    const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_CLIENT_ID,
        client_secret: process.env.KAKAO_CLIENT_SECRET,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        code
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token } = tokenResponse.data;

    // Get user info
    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    const kakaoUser = userResponse.data;
    const kakaoId = kakaoUser.id;
    const email = kakaoUser.kakao_account?.email || `kakao_${kakaoId}@kakao.com`;
    const name = kakaoUser.kakao_account?.profile?.nickname || 'Kakao User';
    const phone = kakaoUser.kakao_account?.phone_number || null;

    // Find or create user
    let user = await User.findOne({ socialId: String(kakaoId), socialProvider: 'kakao' });

    if (!user) {
      user = new User({
        email,
        name,
        phone,
        socialProvider: 'kakao',
        socialId: String(kakaoId),
        role: 'user'
      });
      await user.save();
    } else {
      // Update existing user info
      user.name = name;
      user.email = email;
      if (phone) user.phone = phone;
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONT_ORIGIN}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Kakao auth error:', error);
    res.redirect(`${process.env.FRONT_ORIGIN}/login?error=kakao_auth_failed`);
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

export default router;
