const express = require('express');
const authRoutes = require('./api/auth');
const userRoutes = require('./api/users');
const providerRoutes = require('./api/providers');
const categoryRoutes = require('./api/categories');
const listingRoutes = require('./api/listings');
const bookingRoutes = require('./api/bookings');
const paymentRoutes = require('./api/payments');
const reviewRoutes = require('./api/reviews');
const complaintRoutes = require('./api/complaints');
const reportRoutes = require('./api/reports');
const commissionRoutes = require('./api/commissions');
const adminRoutes = require('./api/admin');

const router = express.Router();

// API Routes
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/providers', providerRoutes);
router.use('/api/categories', categoryRoutes);
router.use('/api/listings', listingRoutes);
router.use('/api/bookings', bookingRoutes);
router.use('/api/payments', paymentRoutes);
router.use('/api/reviews', reviewRoutes);
router.use('/api/complaints', complaintRoutes);
router.use('/api/reports', reportRoutes);
router.use('/api/commissions', commissionRoutes);
router.use('/api/admin', adminRoutes);

module.exports = router;