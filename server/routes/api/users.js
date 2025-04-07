const express = require('express');
const { getUsers, getUserById } = require('../../controllers/userController');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', protect, authorize('user', 'service_provider', 'admin'), getUsers);
router.get('/:id', protect, authorize('user', 'admin'), getUserById);

module.exports = router;