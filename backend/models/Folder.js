// backend/models/Folder.js
const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema(
  {
    // Folder name
    name: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true,
    },

    // User who owns the folder
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },

    // Users the folder is shared with and their permissions
    sharedWith: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: [true, 'Shared user ID is required'],
        },
        permission: {
          type: String,
          enum: ['view', 'edit'],
          default: 'view',
        },
      },
    ],
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Folder', folderSchema);
