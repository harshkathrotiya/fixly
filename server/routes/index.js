const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./api/auth');

// Mount routes
router.use('/api/auth', authRoutes);

module.exports = router;