const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  apptDate: {
    type: Date,
    required: [true, 'Please add a booking date'],
    validate: {
      validator: function (value) {
        return value > Date.now();
      },
      message: 'Booking date must be in the future'
    }
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  dentist: {
    type: mongoose.Schema.ObjectId,
    ref: 'Dentist',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ป้องกัน user จองซ้ำวันเดียวกันกับ dentist คนเดิม
BookingSchema.index(
  { user: 1, dentist: 1, apptDate: 1 },
  { unique: true }
);

module.exports = mongoose.model('Booking', BookingSchema);