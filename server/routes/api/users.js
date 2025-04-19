const express = require('express');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus
} = require('../../controllers/userController');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', protect, authorize('admin'), getUsers);

// Get single user
router.get('/:id', protect, authorize('user', 'admin'), getUserById);

// Admin only routes
router.post('/', protect, authorize('admin'), createUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.put('/:id/status', protect, authorize('admin'), toggleUserStatus);

module.exports = router;