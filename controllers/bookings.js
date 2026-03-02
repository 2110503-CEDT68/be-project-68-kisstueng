const Booking = require('../models/Booking');
const Dentist = require('../models/Dentist');


// @desc    Get all bookings
// @route   GET /api/v1/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
  let query;

  if (req.user.role !== 'admin') {
    query = Booking.find({ user: req.user.id }).populate({
      path: 'dentist',
      select: 'name yearsOfExperience expertise'
    });
  } else {
    query = Booking.find().populate({
      path: 'dentist',
      select: 'name yearsOfExperience expertise'
    });
  }

  try {
    const bookings = await query;

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Cannot find bookings"
    });
  }
};


// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: 'dentist',
      select: 'name yearsOfExperience expertise'
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`
      });
    }

    if (
      booking.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized`
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cannot find booking"
    });
  }
};


// @desc    Add booking
// @route   POST /api/v1/dentists/:dentistId/bookings
// @access  Private
exports.addBooking = async (req, res, next) => {
  try {

    req.body.user = req.user.id;
    req.body.dentist = req.params.dentistId;

    // จำกัด 1 session ตามโจทย์
    const existedBooking = await Booking.findOne({ user: req.user.id });

    if (existedBooking) {
      return res.status(400).json({
        success: false,
        message: "User has already booked a session"
      });
    }

    const dentist = await Dentist.findById(req.params.dentistId);

    if (!dentist) {
      return res.status(404).json({
        success: false,
        message: `No dentist with the id of ${req.params.dentistId}`
      });
    }

    const booking = await Booking.create(req.body);

    res.status(201).json({
      success: true,
      data: booking
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cannot create booking"
    });
  }
};


// @desc    Update booking
// @route   PUT /api/v1/bookings/:id
// @access  Private
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`
      });
    }

    if (
      booking.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false
      });
    }

    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cannot update booking"
    });
  }
};


// @desc    Delete booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false
      });
    }

    if (
      booking.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false
      });
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cannot delete booking"
    });
  }
};