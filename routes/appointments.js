const express = require('express');

const {
  getAppointments,
  getAppointment,
  addAppointment,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointments');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });


// GET all appointments
// POST new appointment
router
  .route('/')
  .get(protect, getAppointments)
  .post(protect, authorize('admin', 'user'), addAppointment);


// GET single appointment
// UPDATE appointment
// DELETE appointment
router
  .route('/:id')
  .get(protect, getAppointment)
  .put(protect, authorize('admin', 'user'), updateAppointment)
  .delete(protect, authorize('admin', 'user'), deleteAppointment);


module.exports = router;