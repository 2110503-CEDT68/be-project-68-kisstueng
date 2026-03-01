const Appointment = require('../models/Appointment');
const Dentist = require('../models/Dentist');


// @desc    Get all appointments
// @route   GET /api/v1/appointments
// @access  Private
exports.getAppointments = async (req, res, next) => {
  let query;

  if (req.user.role !== 'admin') {
    query = Appointment.find({ user: req.user.id }).populate({
      path: 'dentist',
      select: 'name specialty tel'
    });
  } else {
    query = Appointment.find().populate({
      path: 'dentist',
      select: 'name specialty tel'
    });
  }

  try {
    const appointments = await query;

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Cannot find appointments"
    });
  }
};


// @desc    Get single appointment
// @route   GET /api/v1/appointments/:id
// @access  Private
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate({
      path: 'dentist',
      select: 'name specialty tel'
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id of ${req.params.id}`
      });
    }

    if (
      appointment.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized`
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Cannot find appointment"
    });
  }
};


// @desc    Add appointment
// @route   POST /api/v1/dentists/:dentistId/appointments
// @access  Private
exports.addAppointment = async (req, res, next) => {
  try {

    // เอา user จากคนที่ login
    req.body.user = req.user.id;

    // ตรวจสอบ dentist จาก body แทน params
    const dentist = await Dentist.findById(req.body.dentist);

    if (!dentist) {
      return res.status(404).json({
        success: false,
        message: `No dentist with the id of ${req.body.dentist}`
      });
    }

    const appointment = await Appointment.create(req.body);

    res.status(201).json({
      success: true,
      data: appointment
    });

  } catch (error) {

    console.log("ERROR >>>", error);

    res.status(500).json({
      success: false,
      message: "Cannot create appointment"
    });
  }
};


// @desc    Update appointment
// @route   PUT /api/v1/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id of ${req.params.id}`
      });
    }

    if (
      appointment.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false
      });
    }

    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: appointment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cannot update appointment"
    });
  }
};


// @desc    Delete appointment
// @route   DELETE /api/v1/appointments/:id
// @access  Private
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false
      });
    }

    if (
      appointment.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false
      });
    }

    await appointment.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cannot delete appointment"
    });
  }
};