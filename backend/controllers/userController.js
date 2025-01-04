// backend/controllers/userController.js

const bcrypt = require('bcryptjs'); // Ensure bcryptjs is installed and used
const User = require('../models/User'); // Mongoose User model

// 1) GET user profile
exports.getUserProfile = async (req, res) => {
  try {
    // Ensure req.user.id exists (typically set by middleware)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized access.' });
    }

    // Fetch user from database excluding the password field
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Return the user data
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

    // Validate required fields
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized access.' });
    }

    const { name, email, oldPassword, newPassword } = req.body;

    // Fetch the user from the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update name and/or email if provided
    if (name) user.name = name;
    if (email) user.email = email;

    // Handle password change
    if (oldPassword && newPassword) {
      // Check if the old password matches the current password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect.' });
      }

      // Hash and set the new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Save the updated user
    await user.save();

    // Exclude the password field from the response
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
