const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  images: [{
    type: String,
    required: true
  }],
  type: {
    type: String,
    enum: ['apartment', 'villa', 'house', 'townhouse'],
    default: 'apartment'
  },
  bedrooms: {
    type: Number,
    required: true,
    min: [0, 'Bedrooms cannot be negative']
  },
  bathrooms: {
    type: Number,
    required: true,
    min: [0, 'Bathrooms cannot be negative']
  },
  area: {
    type: Number,
    required: true,
    min: [0, 'Area cannot be negative']
  },
  amenities: [{
    type: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

propertySchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Property', propertySchema);