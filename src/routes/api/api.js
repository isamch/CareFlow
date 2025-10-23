import express from 'express'
import authRoutes from './api/auth.routes.js'
import homeRoutes from './api/home.routes.js'
import adminRoutes from './api/admin.routes.js'
import doctorRoutes from './api/doctor.routes.js'
import nurseRoutes from './api/nurse.routes.js'
import patientRoutes from './api/patient.routes.js'
import secretaryRoutes from './api/secretary.routes.js'
import userRoutes from './api/user.routes.js' // Shared user routes like /me

const router = express.Router()

// Public Routes (No 'protect' middleware here)
router.use('/auth', authRoutes)
router.use('/home', homeRoutes)

// Protected Routes (Specific roles/permissions checked within each file)
router.use('/admin', adminRoutes)
router.use('/doctor', doctorRoutes)
router.use('/nurse', nurseRoutes)
router.use('/patient', patientRoutes)
router.use('/secretary', secretaryRoutes)
router.use('/user', userRoutes) // Shared authenticated user routes

export default router