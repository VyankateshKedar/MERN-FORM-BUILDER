// backend/routes/folderRoutes.js
const express = require('express');
const router = express.Router();
const Folder = require('../models/Folder');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');

// POST - Create a new folder
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Folder name is required.' });
    }

    // Check if a folder with the same name already exists for the user
    const existingFolder = await Folder.findOne({ name: name.trim(), user: req.user.id });
    if (existingFolder) {
      return res.status(400).json({ message: 'Folder name already exists.' });
    }

    // Create the new folder
    const newFolder = new Folder({
      name: name.trim(),
      user: req.user.id,
    });

    await newFolder.save();
    return res.status(201).json(newFolder);
  } catch (error) {
    console.error('Create Folder Error:', error);
    return res.status(500).json({
      message: 'Server error creating folder.',
      error: error.message,
    });
  }
});

// GET - Retrieve all folders for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const folders = await Folder.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(folders);
  } catch (error) {
    console.error('Fetch Folder Error:', error);
    return res.status(500).json({
      message: 'Failed to fetch folders.',
      error: error.message,
    });
  }
});

// DELETE - Delete a folder by ID
router.delete('/:folderId', authMiddleware, async (req, res) => {
  try {
    const { folderId } = req.params;

    // Find the folder by ID and ensure it belongs to the user
    const folder = await Folder.findOne({ _id: folderId, user: req.user.id });
    if (!folder) {
      return res.status(404).json({
        message: 'Folder not found or not owned by this user.',
      });
    }

    await folder.deleteOne();
    return res.status(200).json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Delete Folder Error:', error);
    return res.status(500).json({
      message: 'Server error deleting folder.',
      error: error.message,
    });
  }
});

// POST - Share a folder with another user
router.post('/:folderId/share', authMiddleware, async (req, res) => {
  try {
    const { folderId } = req.params;
    const { email, permission } = req.body;

    if (!email || !permission) {
      return res.status(400).json({
        message: 'Email and permission are required.',
      });
    }

    // 1) Ensure the folder belongs to the current user
    const folder = await Folder.findOne({ _id: folderId, user: req.user.id });
    if (!folder) {
      return res.status(404).json({
        message: 'Folder not found or not owned by this user.',
      });
    }

    // 2) Find the user by email
    const invitedUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (!invitedUser) {
      return res.status(400).json({
        message: 'User with this email does not exist or is not registered.',
      });
    }

    // 3) Check if the user is already in the sharedWith array
    const alreadyShared = folder.sharedWith.some(
      (item) => item.user.toString() === invitedUser._id.toString()
    );
    if (alreadyShared) {
      return res.status(400).json({
        message: 'Folder is already shared with this user.',
      });
    }

    // 4) Add the user to sharedWith
    folder.sharedWith.push({
      user: invitedUser._id,
      permission: ['edit', 'view'].includes(permission) ? permission : 'view',
    });

    await folder.save();

    return res.status(200).json({
      message: `Folder shared with ${email} successfully.`,
      folder,
    });
  } catch (error) {
    console.error('Share Folder Error:', error);
    return res.status(500).json({
      message: 'Server error sharing folder.',
      error: error.message,
    });
  }
});

module.exports = router;
