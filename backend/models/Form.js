// backend/models/Form.js
const mongoose = require('mongoose');

const formSchema = new mongoose.Schema(
  {
    // Form name
    name: {
      type: String,
      required: [true, 'Form name is required'],
      trim: true,
    },

    // Reference to the folder containing the form
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      required: [true, 'Folder ID is required'],
    },

    // User who owns the form
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },

    // Array of form elements (e.g., fields, inputs, etc.)
    elements: {
      type: Array,
      default: [],
    },

    // Users the form is shared with and their permissions
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

    // Unique link for sharing the form
    shareLink: {
      type: String,
      unique: true,
      sparse: true, // Allows documents without a shareLink field
    },

    // Number of views the form has received
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative'],
    },

    // Number of submissions or starts
    starts: {
      type: Number,
      default: 0,
      min: [0, 'Starts cannot be negative'],
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Form', formSchema);
