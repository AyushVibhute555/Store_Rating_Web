const express = require('express');
const { getAdminStats, addUser, addStore, getUsers, getStores } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// All admin routes require role 1 (System Administrator)
router.use(protect, authorize([1]));

router.get('/stats', getAdminStats);
router.post('/users', addUser);
router.post('/stores', addStore); // Adds store and creates store owner (role 3)
router.get('/users', getUsers);
router.get('/stores', getStores);

module.exports = router;