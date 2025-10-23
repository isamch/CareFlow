import express from 'express'
import * as homeController from '../../controllers/home/homeController.js'
const router = express.Router()

// public routes
router.get('/doctors', homeController.getAllDoctors)
router.get('/doctors/:doctorId/availability', homeController.getDoctorAvailability)

export default router