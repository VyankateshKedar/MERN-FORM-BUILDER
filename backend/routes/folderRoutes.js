// backend/routes/folderRoutes.js

const express = require('express');
const router = express.Router();
const Folder = require('../models/Folder');
const User = require('../models/User'); // We'll need this to find user by email
const authMiddleware = require('../middlewares/authMiddleware');

// POST - Create a new folder
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Folder name is required.' });
    }

    // Check if a folder with the same name already exists for this user
    const existingFolder = await Folder.findOne({ name, user: req.user.id });
    if (existingFolder) {
      return res.status(400).json({ message: 'Folder name already exists.' });
    }

    // Create new folder
    const newFolder = new Folder({
      name,
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

    // Find the folder by ID and user
    const folder = await Folder.findOne({ _id: folderId, user: req.user.id });
    if (!folder) {
      return res
        .status(404)
        .json({ message: 'Folder not found or not owned by this user.' });
    }

    await folder.deleteOne();
    return res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Delete Folder Error:', error);
    return res.status(500).json({
      message: 'Server error deleting folder.',
      error: error.message,
    });
  }
});

/**
 * POST - Invite/Share folder with another user.
 * Body expects: { email, permission }, e.g. { "email": "test@example.com", "permission": "edit" }
 */
router.post('/:folderId/share', authMiddleware, async (req, res) => {
  try {
    const { folderId } = req.params;
    const { email, permission } = req.body; // "view" or "edit"

    // 1) Check if the folder belongs to current user
    const folder = await Folder.findOne({ _id: folderId, user: req.user.id });
    if (!folder) {
      return res
        .status(404)
        .json({ message: 'Folder not found or not owned by this user.' });
    }

    // 2) Find the user by email
    const invitedUser = await User.findOne({ email });
    if (!invitedUser) {
      return res.status(400).json({
        message: 'User with this email does not exist or is not registered.',
      });
    }

    // 3) Check if the user is already in sharedWith
    const alreadyShared = folder.sharedWith.some(
      (item) => item.user.toString() === invitedUser._id.toString()
    );
    if (alreadyShared) {
      return res.status(400).json({
        message: 'Folder is already shared with this user.',
      });
    }

    // 4) Add to folder.sharedWith
    folder.sharedWith.push({
      user: invitedUser._id,
      permission: permission === 'edit' ? 'edit' : 'view', // default to 'view'
    });

    await folder.save();

    // Optionally generate a share link or return updated folder
    // For demonstration, let's just return a success message
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
