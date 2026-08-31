const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: Number, required: true },
    customerName: { type: String, trim: true, default: 'Guest' },
    status: {
      type: String,
      enum: ['waiting', 'serving', 'completed'],
      default: 'waiting',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', ticketSchema);
