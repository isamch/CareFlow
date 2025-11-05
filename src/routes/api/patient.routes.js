import express from 'express'
import * as apptController from '../../controllers/patient/appointmentController.js'
import * as recordController from '../../controllers/shared/patientRecord.js' // Shared
import * as notificationController from '../../controllers/shared/NotificationController.js' // Shared
import { protect, authorize, checkRole } from '../../middleware/authMiddleware.js'
import validate from '../../middleware/validatorMiddleware.js'
import * as appointmentValidation from '../../validations/appointmentValidation.js'
import * as notificationValidation from '../../validations/notificationValidation.js' // Shared validation

const router = express.Router()

// Protect all routes and ensure the user has the 'Patient' role
router.use(protect, checkRole('Patient'))

// --- Appointments ---
router.post('/appointments', authorize('create:appointment'), validate(appointmentValidation.createMyAppointment), apptController.createMyAppointment)

router.get('/appointments', authorize('read:appointment'), apptController.getMyAppointments)
router.get('/appointments/available', authorize('read:appointment'), validate(appointmentValidation.getAvailableSlots), apptController.getAvailableSlots)

// Use PATCH for cancelling
router.patch('/appointments/:id/cancel', authorize('update:appointment'), validate(appointmentValidation.appointmentIdParam), apptController.cancelMyAppointment)

// --- Record ---
// No ID needed in param, gets own record via JWT profileId
router.get('/record/me', authorize('read:own_record'), recordController.getPatientRecord)

// --- Notifications ---
// No ID needed in param, gets own notifications via JWT userId
router.get('/notifications/me', authorize('read:own_notifications'), validate(notificationValidation.getNotifications), notificationController.getMyNotifications)

export default router