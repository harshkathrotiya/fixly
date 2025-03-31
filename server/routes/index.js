const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./api/auth');
const providerRoutes = require('./api/providers');
const categoryRoutes = require('./api/categories');
const listingRoutes = require('./api/listings');

// Mount routes
router.use('/api/auth', authRoutes);
router.use('/api/providers', providerRoutes);
router.use('/api/categories', categoryRoutes);
router.use('/api/listings', listingRoutes);

module.exports = router;