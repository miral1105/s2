const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const packageSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  trackingNumber: {
    type: String,
    required: true,
    unique: true,
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  weight: {
    type: Number,
    required: true,
  },
  contents: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: [
      'Ready to Send',
      'Pending Invoice Review',
      'Invoice Approved',
      'Invoice Rejected',
      'Ship Requested',
      'Shipped',
      'Ready for Pickup',
      'Delivered'
    ],
    default: 'Ready to Send',
  },
  client: {
    type: String,
    ref: 'User',
    required: true,
  },
  invoice: {
    type: String,
    ref: 'Invoice',
  }
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);
