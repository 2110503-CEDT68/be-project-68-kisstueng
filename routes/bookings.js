const express = require('express');

const {
  getBookings,
  getBooking,
  addBooking,
  updateBooking,
  deleteBooking
} = require('../controllers/bookings');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

/**
* @swagger
* components:
*   schemas:
*     Booking:
*       type: object
*       required:
*         - apptDate
*         - dentist
*       properties:
*         id:
*           type: string
*           description: Auto-generated booking ID
*           example: 65f3b45a1234abcd5678ef12
*         apptDate:
*           type: string
*           format: date
*           description: Booking date
*           example: 2026-03-10
*         user:
*           type: string
*           description: User ID who made the booking
*           example: 65f2a12c1234abcd5678ef90
*         dentist:
*           type: string
*           description: Dentist ID
*           example: 65f2b98a1234abcd5678ef91
*         createdAt:
*           type: string
*           format: date-time
*/

/**
* @swagger
* tags:
*   name: Bookings
*   description: Booking Management API
*/

/**
* @swagger
* /bookings:
*   get:
*     summary: Get all bookings (User sees own, Admin sees all)
*     tags: [Bookings]
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: List of bookings
*       401:
*         description: Unauthorized
*/

/**
* @swagger
* /bookings:
*   post:
*     summary: Create new booking (User can book only one session)
*     tags: [Bookings]
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*     responses:
*       201:
*         description: Booking created
*       400:
*         description: User already has a booking
*       401:
*         description: Unauthorized
*/

/**
* @swagger
* /bookings/{id}:
*   get:
*     summary: Get single booking by ID
*     tags: [Bookings]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Booking found
*       404:
*         description: Booking not found
*/

/**
* @swagger
* /bookings/{id}:
*   put:
*     summary: Update booking (User can update own, Admin can update any)
*     tags: [Bookings]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Booking updated
*       401:
*         description: Unauthorized
*/

/**
* @swagger
* /bookings/{id}:
*   delete:
*     summary: Delete booking (User can delete own, Admin can delete any)
*     tags: [Bookings]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Booking deleted
*       401:
*         description: Unauthorized
*/

// ================= ROUTES =================

// GET all + POST booking
router
  .route('/')
  .get(protect, getBookings)
  .post(protect, authorize('admin', 'user'), addBooking);

// GET single / UPDATE / DELETE booking
router
  .route('/:id')
  .get(protect, getBooking)
  .put(protect, authorize('admin', 'user'), updateBooking)
  .delete(protect, authorize('admin', 'user'), deleteBooking);

module.exports = router;