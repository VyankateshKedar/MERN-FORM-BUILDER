// backend/controllers/userController.js

const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Your User Mongoose model

// 1) GET user profile
exports.getUserProfile = async (req, res) => {
  try {
    // req.user.id is typically set by authMiddleware after verifying the JWT
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Return the user data (excluding password)
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// 2) PUT/UPDATE user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, oldPassword, newPassword } = req.body;

    // Fetch the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update name and/or email if provided
    if (name) user.name = name;
    if (email) user.email = email;

    // If user wants to change password, they must provide oldPassword + newPassword
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect.' });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    // Return updated user (excluding password)
    const { password, ...rest } = user.toObject();
    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: rest,
    });
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
