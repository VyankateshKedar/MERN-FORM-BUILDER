// backend/models/Form.js
const mongoose = require('mongoose');

const formSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    elements: { type: Array, default: [] }, // Store form elements
    sharedWith: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        permission: {
          type: String,
          enum: ['view', 'edit'],
          default: 'view',
        },
      },
    ],
    shareLink: { type: String, unique: true }, // Unique share link
    views: { type: Number, default: 0 },
    starts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Form', formSchema);
