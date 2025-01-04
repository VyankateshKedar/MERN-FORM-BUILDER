// backend/models/Response.js
const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema(
  {
    // Reference to the associated form
    form: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: [true, 'Form ID is required'],
    },

    // Response data (e.g., answers or submissions)
    data: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Response', responseSchema);
