const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  cardNumber: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  propertyTitle: String,
  propertyLocation: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'expired'],
    default: 'completed'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 3 * 60 * 1000)
  }
}, {
  timestamps: true
});

purchaseSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Purchase', purchaseSchema);