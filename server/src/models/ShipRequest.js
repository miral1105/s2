const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const shipRequestSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  packages: [{
    type: String,
    ref: 'Package',
  }],
  client: {
    type: String,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Processed', 'Completed'],
    default: 'Pending',
  },
  shippingMethod: {
    type: String,
  },
  destination: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('ShipRequest', shipRequestSchema);
