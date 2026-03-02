const Booking = require('../models/Booking');
const Dentist = require('../models/Dentist');

// @desc    Get bookings
// @route   GET /api/v1/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
  try {

    let query;

    // 🔥 ถ้าไม่ใช่ admin → เห็นเฉพาะของตัวเอง
    if (req.user.role !== 'admin') {
      query = Booking.find({ user: req.user.id });
    } else {
      // 🔥 ถ้าเป็น admin → เห็นทั้งหมด
      query = Booking.find();
    }

    // 🔥 populate ชื่อ user และ dentist
    query = query
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'dentist',
        select: 'name clinicName'
      })
      .sort('-createdAt');

    const bookings = await query;

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Cannot get bookings'
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
// @route   POST /api/v1/bookings
// @access  Private
exports.addBooking = async (req, res, next) => {
  try {

    // 🔥 เอา user ที่ login อยู่
    const userId = req.user.id;
    const { dentist, apptDate } = req.body;

    // 🔥 ต้องส่ง dentist มาด้วย
    if (!dentist) {
      return res.status(400).json({
        success: false,
        message: "Please provide dentist id"
      });
    }

    // 🔥 เช็คว่า dentist มีอยู่จริงไหม
    const existedDentist = await Dentist.findById(dentist);

    if (!existedDentist) {
      return res.status(404).json({
        success: false,
        message: `No dentist with the id of ${dentist}`
      });
    }

    // 🔥 เช็คว่าผู้ใช้จองไปแล้วหรือยัง
    const existedBooking = await Booking.findOne({ user: userId });

    if (existedBooking) {
      return res.status(400).json({
        success: false,
        message: "User has already booked a session"
      });
    }

    // 🔥 สร้าง booking
    const booking = await Booking.create({
      user: userId,
      dentist: dentist,
      apptDate: apptDate
    });

    res.status(201).json({
      success: true,
      data: booking
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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