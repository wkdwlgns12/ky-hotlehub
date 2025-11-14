import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.socialId; // Password required if not social login
    }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'business', 'admin'],
    default: 'user'
  },
  // Social Login
  socialProvider: {
    type: String,
    enum: ['kakao', 'local', null],
    default: 'local'
  },
  socialId: {
    type: String,
    sparse: true
  },
  // Business user specific
  businessName: String,
  businessNumber: String,
  businessApproved: {
    type: Boolean,
    default: false
  },
  // User rewards
  points: {
    type: Number,
    default: 0
  },
  pointsHistory: [{
    type: {
      type: String,
      enum: ['earned', 'used', 'expired'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    relatedReservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation'
    }
  }],
  coupons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
  }],
  // Status
  isBlocked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
