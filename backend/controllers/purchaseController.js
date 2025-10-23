const Purchase = require('../models/Purchase');
const Property = require('../models/Property');

// Create purchase
const createPurchase = async (req, res) => {
  try {
    const { propertyId, firstName, lastName, email, cardNumber } = req.body;

    // Find property
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if property is available
    if (!property.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Property is not available'
      });
    }

    // Create purchase
    const purchase = await Purchase.create({
      propertyId,
      firstName,
      lastName,
      email,
      cardNumber: cardNumber.slice(-4),
      amount: property.price,
      propertyTitle: property.title,
      propertyLocation: property.location
    });

    // Mark property as sold
    await Property.findByIdAndUpdate(propertyId, { 
      isAvailable: false 
    });

    res.status(201).json({
      success: true,
      message: 'Purchase completed successfully!',
      data: {
        purchase,
        property: {
          title: property.title,
          price: property.price,
          location: property.location
        }
      }
    });

  } catch (error) {
    console.error('Create purchase error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while processing purchase'
    });
  }
};

// Get user purchases
const getUserPurchases = async (req, res) => {
  try {
    const { email } = req.query;

    const purchases = await Purchase.find({ email })
      .populate('propertyId', 'title images location price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: purchases
    });

  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching purchases'
    });
  }
};

// Check if property is purchased
const checkPropertyPurchase = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const purchase = await Purchase.findOne({ 
      propertyId, 
      status: 'completed',
      expiresAt: { $gt: new Date() }
    });

    res.json({
      success: true,
      data: {
        isPurchased: !!purchase,
        expiresAt: purchase?.expiresAt
      }
    });

  } catch (error) {
    console.error('Check purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking purchase'
    });
  }
};

module.exports = {
  createPurchase,
  getUserPurchases,
  checkPropertyPurchase
};