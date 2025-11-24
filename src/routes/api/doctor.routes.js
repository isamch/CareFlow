import express from 'express'
import * as profileController from '../../controllers/doctor/profileController.js'
import * as apptController from '../../controllers/doctor/appointmentController.js'
import * as patientController from '../../controllers/doctor/patientController.js'
import { protect, authorize, checkRole } from '../../middleware/authMiddleware.js'
import validate from '../../middleware/validatorMiddleware.js'
import * as doctorValidation from '../../validations/doctorValidation.js'
import * as patientRecordValidation from '../../validations/patientRecordValidation.js'
import * as appointmentValidation from '../../validations/appointmentValidation.js' // For status update
// import doctorPrescriptionRoutes from './doctor.prescription.routes.js';

const router = express.Router()

// Protect all routes and ensure the user has the 'Doctor' role
router.use(protect, checkRole('Doctor'))

// --- Profile ---
router.get('/profile/me', profileController.getMyProfile)
router.put('/profile/me', authorize('update:own_profile'), validate(doctorValidation.updateMyProfile), profileController.updateMyProfile)

// --- Appointments ---
router.get('/appointments/me', authorize('read:own_appointments'), apptController.getMyAppointments)
// Use PATCH for partial updates like status
router.patch('/appointments/:id/status', authorize('update:appointment'), validate(appointmentValidation.updateAppointmentStatusByDoctor), apptController.updateAppointmentStatus)

// --- Patient Records & Visits ---
// Get Patient Record (using Patient Profile ID)
router.get('/patients/:patientId/record',
  authorize('read:patient_record'),
  validate(patientRecordValidation.patientIdParam),
  patientController.getPatientRecord)

// Add Visit (using Patient Profile ID)
router.post('/patients/:patientId/visits',
  authorize('create:visit'),
  validate(patientRecordValidation.addVisitPayload),
  patientController.addVisit)

// router.use(doctorPrescriptionRoutes);

export default router