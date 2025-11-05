import express from 'express'
import authRoutes from './api/auth.routes.js'
import homeRoutes from './api/home.routes.js'
import adminRoutes from './api/admin.routes.js'
import doctorRoutes from './api/doctor.routes.js'
import nurseRoutes from './api/nurse.routes.js'
import patientRoutes from './api/patient.routes.js'
import secretaryRoutes from './api/secretary.routes.js'
import userRoutes from './api/user.routes.js'
import doctorPharmacyRoutes from './api/doctor.pharmacy.routes.js';

const router = express.Router()

// // Public Routes
router.use('/auth', authRoutes)
router.use('/home', homeRoutes)

// // Protected Routes
router.use('/admin', adminRoutes)
router.use('/doctor', doctorRoutes)
// router.use('/doctor', doctorPharmacyRoutes) // Pharmacy integration routes
router.use('/nurse', nurseRoutes)
router.use('/patient', patientRoutes)
router.use('/secretary', secretaryRoutes)
router.use('/user', userRoutes)

export default router