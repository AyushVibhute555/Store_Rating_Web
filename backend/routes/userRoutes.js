const express = require('express');
const { getAllStores, submitRating } = require('../controllers/userController');
const { getStoreDashboard } = require('../controllers/storeController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// General routes for Normal Users (Role 2)
router.get('/stores', protect, authorize([2]), getAllStores);
router.post('/ratings', protect, authorize([2]), submitRating);

// Dashboard route for Store Owners (Role 3)
router.get('/dashboard', protect, authorize([3]), getStoreDashboard);

module.exports = router;