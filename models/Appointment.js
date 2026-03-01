const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  apptDate: {
    type: Date,
    required: [true, 'Please add an appointment date'],
    validate: {
      validator: function (value) {
        return value > Date.now();
      },
      message: 'Appointment date must be in the future'
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

// ป้องกัน user จองซ้ำวันเดียวกันที่โรงพยาบาลเดียวกัน
AppointmentSchema.index(
  { user: 1, dentist: 1, apptDate: 1 },
  { unique: true }
);

module.exports = mongoose.model('Appointment', AppointmentSchema);