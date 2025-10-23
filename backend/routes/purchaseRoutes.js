const express = require('express');
const router = express.Router();
const {
  createPurchase,
  getUserPurchases,
  checkPropertyPurchase
} = require('../controllers/purchaseController');

router.post('/', createPurchase);
router.get('/user', getUserPurchases);
router.get('/check/:propertyId', checkPropertyPurchase);

module.exports = router;