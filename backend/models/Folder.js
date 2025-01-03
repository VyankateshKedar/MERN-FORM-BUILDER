// backend/models/Folder.js
const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Folder', folderSchema);
