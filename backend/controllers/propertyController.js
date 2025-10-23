const Property = require('../models/Property');

// Get all properties with filtering
const getProperties = async (req, res) => {
  try {
    const {
      search,
      minPrice,
      maxPrice,
      location,
      type,
      bedrooms,
      bathrooms,
      sortBy = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    let filter = { isAvailable: true };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (type) {
      filter.type = type;
    }

    if (bedrooms) {
      filter.bedrooms = { $gte: Number(bedrooms) };
    }

    if (bathrooms) {
      filter.bathrooms = { $gte: Number(bathrooms) };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOptions = {};
    switch (sortBy) {
      case 'price-low':
        sortOptions.price = 1;
        break;
      case 'price-high':
        sortOptions.price = -1;
        break;
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      case 'oldest':
        sortOptions.createdAt = 1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const properties = await Property.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Property.countDocuments(filter);

    res.json({
      success: true,
      count: properties.length,
      total,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / limit)
      },
      data: properties
    });

  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching properties'
    });
  }
};

// Get single property
const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property
    });

  } catch (error) {
    console.error('Get property error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching property'
    });
  }
};

// Get featured properties
const getFeaturedProperties = async (req, res) => {
  try {
    const properties = await Property.find({ 
      isFeatured: true, 
      isAvailable: true 
    }).limit(6);

    res.json({
      success: true,
      count: properties.length,
      data: properties
    });

  } catch (error) {
    console.error('Get featured properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured properties'
    });
  }
};

// Create property from frontend
const createPropertyFromFrontend = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      location,
      type,
      bedrooms,
      bathrooms,
      area,
      amenities
    } = req.body;

    console.log('📨 Received form data:', req.body);
    console.log('📁 Received files:', req.files);

    // Validate required fields
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!description) missingFields.push('description');
    if (!price) missingFields.push('price');
    if (!location) missingFields.push('location');
    if (!bedrooms) missingFields.push('bedrooms');
    if (!bathrooms) missingFields.push('bathrooms');
    if (!area) missingFields.push('area');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Convert to numbers
    const priceNum = parseFloat(price);
    const bedroomsNum = parseInt(bedrooms);
    const bathroomsNum = parseInt(bathrooms);
    const areaNum = parseFloat(area);

    console.log('🔢 Converted numbers:', { priceNum, bedroomsNum, bathroomsNum, areaNum });

    // Check if conversions were successful
    if (isNaN(priceNum) || isNaN(bedroomsNum) || isNaN(bathroomsNum) || isNaN(areaNum)) {
      return res.status(400).json({
        success: false,
        message: 'Price, bedrooms, bathrooms, and area must be valid numbers'
      });
    }

    // Check for positive values
    if (priceNum <= 0 || bedroomsNum < 0 || bathroomsNum < 0 || areaNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price and area must be greater than 0, bedrooms and bathrooms cannot be negative'
      });
    }

    // Handle image upload - SAVE UPLOADED FILES
    let images = [];
    
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/${file.filename}`);
      console.log('🖼️ Saved image paths:', images);
    } else {
      images = ['images/home1.jpg'];
      console.log('🖼️ Using default image');
    }

    // Create property object
    const propertyData = {
      title: title.trim(),
      description: description.trim(),
      price: priceNum,
      location: location.trim(),
      type: type || 'apartment',
      bedrooms: bedroomsNum,
      bathrooms: bathroomsNum,
      area: areaNum,
      amenities: amenities ? amenities.split(',').map(a => a.trim()).filter(a => a) : [],
      images: images,
      isAvailable: true,
      isFeatured: false
    };

    console.log('🏠 Creating property with data:', propertyData);

    const property = await Property.create(propertyData);

    res.status(201).json({
      success: true,
      message: 'Property published successfully!',
      data: property
    });

  } catch (error) {
    console.error('❌ Create property error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while publishing property'
    });
  }
};

module.exports = {
  getProperties,
  getProperty,
  getFeaturedProperties,
  createPropertyFromFrontend
};