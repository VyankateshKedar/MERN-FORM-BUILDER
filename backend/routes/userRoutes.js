// backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); 
const { getUserProfile, updateUserProfile } = require('../controllers/userController');

// GET - fetch the current logged-in user's profile
router.get('/profile', authMiddleware, getUserProfile);

// PUT - update the current logged-in user's profile
router.put('/profile', authMiddleware, updateUserProfile);

module.exports = router;
