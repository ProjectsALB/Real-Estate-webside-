const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getProperties,
  getProperty,
  getFeaturedProperties,
  createPropertyFromFrontend
} = require('../controllers/propertyController');

// Public routes
router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/:id', getProperty);

// Create property with image upload
router.post('/create', upload.array('images', 5), (req, res, next) => {
  // Parse form data manually
  const { title, description, price, location, type, bedrooms, bathrooms, area, amenities } = req.body;
  
  req.body = {
    title: title || undefined,
    description: description || undefined,
    price: price || undefined,
    location: location || undefined,
    type: type || undefined,
    bedrooms: bedrooms || undefined,
    bathrooms: bathrooms || undefined,
    area: area || undefined,
    amenities: amenities || undefined
  };
  
  next();
}, createPropertyFromFrontend);

module.exports = router;