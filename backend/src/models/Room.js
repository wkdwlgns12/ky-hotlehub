import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  discountRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  images: [{
    url: String,
    alt: String
  }],
  amenities: [String],
  inventory: {
    type: Number,
    required: true,
    default: 0
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

export default mongoose.model('Room', roomSchema);
