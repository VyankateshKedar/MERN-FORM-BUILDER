// backend/models/Response.js
const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema(
  {
    form: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
    data: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Response', responseSchema);
