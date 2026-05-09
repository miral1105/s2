const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const invoiceSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  reviewStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  adminNotes: {
    type: String,
  },
  package: {
    type: String,
    ref: 'Package',
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
