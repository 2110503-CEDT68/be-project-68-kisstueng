const mongoose = require('mongoose');

const DentistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a dentist name'],
    trim: true,
    maxlength: [50, 'Name can not be more than 50 characters']
  },
  specialty: {
    type: String,
    required: [true, 'Please add a specialty'],
    enum: [
      'General Dentistry',
      'Orthodontics',
      'Endodontics',
      'Pediatric Dentistry',
      'Oral Surgery',
      'Cosmetic Dentistry'
    ]
  },
  experience: {
    type: Number,
    required: [true, 'Please add years of experience'],
    min: [0, 'Experience must be at least 0 years'],
    max: [30, 'Experience can not be more than 30 years']
  },
  tel: {
    type: String,
    required: [true, 'Please add a contact number']
  },
  clinicName: {
    type: String,
    required: [true, 'Please add a clinic name']
  }
},{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate: Dentist → Appointments
DentistSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'dentist',
  justOne: false
});

module.exports = mongoose.model('Dentist', DentistSchema);