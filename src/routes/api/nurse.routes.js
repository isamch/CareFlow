import express from 'express'
import * as profileController from '../../controllers/nurse/profileController.js'
import * as apptController from '../../controllers/nurse/appointmentController.js'
import * as patientController from '../../controllers/shared/patientRecord.js' // Shared
import { protect, authorize, checkRole } from '../../middleware/authMiddleware.js'
import validate from '../../middleware/validatorMiddleware.js'
import * as nurseValidation from '../../validations/nurseValidation.js'
import * as patientRecordValidation from '../../validations/patientRecordValidation.js'

const router = express.Router()

// Protect all routes and ensure the user has the 'Nurse' role
router.use(protect, checkRole('Nurse'))

// --- Profile ---
router.get('/profile/me', profileController.getNurseProfile)
router.put('/profile/me', authorize('update:own_profile'), validate(nurseValidation.updateMyProfile), profileController.updateMyProfile)

// --- Appointments ---
router.get('/appointments/me', authorize('read:own_appointments'), apptController.getMyAppointments)

// --- Patient Records & Visits ---
// Get Patient Record (using Patient Profile ID)
router.get('/patients/:patientId/record', authorize('read:patient_record'), validate(patientRecordValidation.patientIdParam), patientController.getPatientRecord)
// Add Visit (using Patient Profile ID)
router.post('/patients/:patientId/visits', authorize('create:visit'), validate(patientRecordValidation.patientIdParam), validate(patientRecordValidation.addVisitPayload), patientController.addVisit)

export default router