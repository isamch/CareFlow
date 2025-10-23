import express from 'express'
import * as homeController from '../../controllers/home/homeController.js'
import validate from '../../middleware/validatorMiddleware.js'
import * as doctorValidation from '../../validations/doctorValidation.js' // Reuse for availability params

const router = express.Router()

// No protection needed for public routes
router.get('/doctors', homeController.getAllDoctors)
router.get('/doctors/:doctorId/availability', validate(doctorValidation.getDoctorAvailability), homeController.getDoctorAvailability)

export default router