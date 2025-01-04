// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); 
const { getUserProfile, updateUserProfile } = require('../controllers/userController');

/**
 * @route   GET /api/users/profile
 * @desc    Fetch the current logged-in user's profile
 * @access  Private
 */
router.get('/profile', authMiddleware, getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update the current logged-in user's profile
 * @access  Private
 */
router.put('/profile', authMiddleware, updateUserProfile);

module.exports = router;
