import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';

const router = express.Router();

// @route   GET /api/hotels
// @desc    Get all hotels with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      city, 
      minPrice, 
      maxPrice, 
      amenities, 
      rating,
      search,
      ownerId,
      page = 1,
      limit = 10 
    } = req.query;

    const query = { status: 'approved' };

    // Owner filter (for business dashboard)
    if (ownerId) {
      query.owner = ownerId;
      delete query.status; // Show all statuses for owner
      console.log('Filtering by ownerId:', ownerId);
      console.log('Query:', query);
    }

    // City filter
    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    // Search filter (name or address)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } }
      ];
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Amenities filter
    if (amenities) {
      const amenitiesArray = amenities.split(',');
      query.amenities = { $all: amenitiesArray };
    }

    const skip = (page - 1) * limit;

    let hotels = await Hotel.find(query)
      .populate('owner', 'name businessName')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // Price filter (needs to check rooms)
    if (minPrice || maxPrice) {
      const hotelIds = hotels.map(h => h._id);
      const priceQuery = { hotel: { $in: hotelIds } };
      
      if (minPrice) priceQuery.price = { $gte: Number(minPrice) };
      if (maxPrice) priceQuery.price = { ...priceQuery.price, $lte: Number(maxPrice) };

      const roomsWithPrice = await Room.find(priceQuery).distinct('hotel');
      hotels = hotels.filter(h => roomsWithPrice.some(id => id.equals(h._id)));
    }

    // Add lowest price room info to each hotel
    const hotelsWithPrice = await Promise.all(hotels.map(async (hotel) => {
      const lowestPriceRoom = await Room.findOne({ hotel: hotel._id })
        .sort({ price: 1 })
        .select('price originalPrice discountRate isOnSale');
      
      return {
        ...hotel.toObject(),
        lowestPrice: lowestPriceRoom?.price,
        originalPrice: lowestPriceRoom?.originalPrice,
        discountRate: lowestPriceRoom?.discountRate,
        isOnSale: lowestPriceRoom?.isOnSale
      };
    }));

    const total = await Hotel.countDocuments(query);

    console.log('Found hotels count:', hotels.length);
    console.log('Total count:', total);

    res.json({
      success: true,
      data: hotelsWithPrice,
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

// @route   GET /api/hotels/:id
// @desc    Get hotel by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('owner', 'name businessName email phone')
      .populate('rooms');

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.json({
      success: true,
      data: hotel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotel',
      error: error.message
    });
  }
});

// @route   POST /api/hotels
// @desc    Create new hotel (Business only)
// @access  Private (Business)
router.post('/', auth, requireRole('business', 'admin'), async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      images,
      amenities,
      rooms: roomsData
    } = req.body;

    // Check if business user is approved
    if (req.user.role === 'business' && !req.user.businessApproved) {
      return res.status(403).json({
        success: false,
        message: 'Business account not approved yet'
      });
    }

    const hotel = new Hotel({
      name,
      description,
      location,
      images,
      amenities,
      owner: req.user._id,
      status: 'pending'
    });

    await hotel.save();

    // Create rooms if provided
    if (roomsData && Array.isArray(roomsData) && roomsData.length > 0) {
      const rooms = await Room.insertMany(
        roomsData.map(room => ({
          ...room,
          hotel: hotel._id,
          inventory: room.inventory || 10 // Default inventory
        }))
      );

      // Add room IDs to hotel
      hotel.rooms = rooms.map(r => r._id);
      await hotel.save();
    }

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: hotel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create hotel',
      error: error.message
    });
  }
});

// @route   PUT /api/hotels/:id
// @desc    Update hotel
// @access  Private (Owner or Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && !hotel.owner.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this hotel'
      });
    }

    const {
      name,
      description,
      location,
      images,
      amenities
    } = req.body;

    if (name) hotel.name = name;
    if (description) hotel.description = description;
    if (location) hotel.location = location;
    if (images) hotel.images = images;
    if (amenities) hotel.amenities = amenities;
    hotel.updatedAt = Date.now();

    await hotel.save();

    res.json({
      success: true,
      message: 'Hotel updated successfully',
      data: hotel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update hotel',
      error: error.message
    });
  }
});

// @route   DELETE /api/hotels/:id
// @desc    Delete hotel
// @access  Private (Owner or Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && !hotel.owner.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this hotel'
      });
    }

    await hotel.deleteOne();

    res.json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete hotel',
      error: error.message
    });
  }
});

// @route   GET /api/hotels/:id/rooms
// @desc    Get rooms for a hotel
// @access  Public
router.get('/:id/rooms', async (req, res) => {
  try {
    const rooms = await Room.find({ hotel: req.params.id });

    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms',
      error: error.message
    });
  }
});

// @route   POST /api/hotels/:id/rooms
// @desc    Add room to hotel (Business only)
// @access  Private (Business/Owner)
router.post('/:id/rooms', auth, requireRole('business', 'admin'), async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && !hotel.owner.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add rooms to this hotel'
      });
    }

    const {
      name,
      type,
      description,
      price,
      capacity,
      images,
      amenities,
      inventory
    } = req.body;

    const room = new Room({
      hotel: hotel._id,
      name,
      type,
      description,
      price,
      capacity,
      images,
      amenities,
      inventory
    });

    await room.save();

    hotel.rooms.push(room._id);
    await hotel.save();

    res.status(201).json({
      success: true,
      message: 'Room added successfully',
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add room',
      error: error.message
    });
  }
});

// @route   PUT /api/rooms/:id
// @desc    Update room
// @access  Private (Owner or Admin)
router.put('/rooms/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && !room.hotel.owner.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this room'
      });
    }

    const {
      name,
      type,
      description,
      price,
      capacity,
      images,
      amenities,
      inventory
    } = req.body;

    if (name !== undefined) room.name = name;
    if (type !== undefined) room.type = type;
    if (description !== undefined) room.description = description;
    if (price !== undefined) room.price = price;
    if (capacity !== undefined) room.capacity = capacity;
    if (images !== undefined) room.images = images;
    if (amenities !== undefined) room.amenities = amenities;
    if (inventory !== undefined) room.inventory = inventory;
    
    room.updatedAt = Date.now();

    await room.save();

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update room',
      error: error.message
    });
  }
});

// @route   DELETE /api/rooms/:id
// @desc    Delete room
// @access  Private (Owner or Admin)
router.delete('/rooms/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && !room.hotel.owner.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this room'
      });
    }

    // Remove room from hotel's rooms array
    await Hotel.findByIdAndUpdate(room.hotel._id, {
      $pull: { rooms: room._id }
    });

    await room.deleteOne();

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete room',
      error: error.message
    });
  }
});

export default router;
