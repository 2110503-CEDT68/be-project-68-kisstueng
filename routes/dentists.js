const express = require('express');

const {
    getDentists,
    getDentist,
    createDentist,
    updateDentist,
    deleteDentist
} = require('../controllers/dentists');

const { protect, authorize } = require('../middleware/auth');

const appointmentRouter = require('./appointments');

/**
* @swagger
* components:
*   schemas:
*     Dentist:
*       type: object
*       required:
*         - name
*         - specialty
*       properties:
*         id:
*           type: string
*           description: Auto-generated dentist ID
*           example: 65f2a12c1234abcd5678ef90
*         name:
*           type: string
*           description: Dentist name
*           example: Dr. Somchai
*         specialty:
*           type: string
*           description: Dentist specialty
*           example: Orthodontics
*         experience:
*           type: number
*           description: Years of experience
*           example: 10
*         tel:
*           type: string
*           description: Contact number
*           example: 02-1234567
*       example:
*         name: Dr. Anan
*         specialty: Tooth Extraction
*         experience: 8
*         tel: 02-8888888
*/

/**
* @swagger
* tags:
*   name: Dentists
*   description: Dentist Management API
*/

/**
* @swagger
* /dentists:
*   get:
*     summary: Get all dentists
*     tags: [Dentists]
*     responses:
*       200:
*         description: List of dentists
*/

/**
* @swagger
* /dentists/{id}:
*   get:
*     summary: Get single dentist by ID
*     tags: [Dentists]
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Dentist found
*       404:
*         description: Dentist not found
*/

/**
* @swagger
* /dentists:
*   post:
*     summary: Create new dentist (Admin only)
*     tags: [Dentists]
*     requestBody:
*       required: true
*     responses:
*       201:
*         description: Dentist created
*       401:
*         description: Unauthorized
*/

/**
* @swagger
* /dentists/{id}:
*   put:
*     summary: Update dentist (Admin only)
*     tags: [Dentists]
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Dentist updated
*/

/**
* @swagger
* /dentists/{id}:
*   delete:
*     summary: Delete dentist (Admin only)
*     tags: [Dentists]
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Dentist deleted
*/

const router = express.Router();

// Nested route
// /api/v1/dentists/:dentistId/appointments
router.use('/:dentistId/appointments', appointmentRouter);

// /api/v1/dentists
router
    .route('/')
    .get(getDentists)
    .post(protect, authorize('admin'), createDentist);

// /api/v1/dentists/:id
router
    .route('/:id')
    .get(getDentist)
    .put(protect, authorize('admin'), updateDentist)
    .delete(protect, authorize('admin'), deleteDentist);

module.exports = router;