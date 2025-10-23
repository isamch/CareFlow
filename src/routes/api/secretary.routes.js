import express from 'express'
import * as profileController from '../../controllers/secretary/profileController.js'
import * as patientController from '../../controllers/secretary/patientController.js'
import * as apptController from '../../controllers/secretary/appointmentController.js'
import { protect, authorize, checkRole } from '../../middleware/authMiddleware.js'
import validate from '../../middleware/validatorMiddleware.js'
import * as userValidation from '../../validations/userValidation.js'
import * as secValidation from '../../validations/secretaryValidation.js'
import * as appointmentValidation from '../../validations/appointmentValidation.js' // Shared

const router = express.Router()

// Protect all routes and ensure the user has the 'Secretary' role
router.use(protect, checkRole('Secretary'))

// --- Profile ---
router.get('/profile/me', profileController.getSecretaryProfile)
router.put('/profile/me', authorize('update:own_profile'), validate(userValidation.updateUserProfile), profileController.updateMyProfile)

// --- Patient Management ---
router.post('/patients', authorize('create:patient'), validate(secValidation.createPatient), patientController.createPatient)
router.get('/patients', authorize('read:patient'), validate(secValidation.searchPatients), patientController.searchPatients) // Search uses query param 'q'
router.get('/patients/:userId', authorize('read:patient'), validate(secValidation.getPatientById), patientController.getPatientById) // Get by User ID

// --- Appointment Management ---
router.post('/appointments', authorize('create:appointment'), validate(appointmentValidation.createAppointmentBySecretary), apptController.createAppointment) // Use specific validation
router.get('/appointments', authorize('read:appointment'), validate(appointmentValidation.getAppointments), apptController.getManagedAppointments) // Use shared validation for query
router.put('/appointments/:id', authorize('update:appointment'), validate(appointmentValidation.updateAppointmentBySecretary), apptController.updateAppointment) // Use specific validation

export default router