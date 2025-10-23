import express from 'express'
import authRoutes from './api/authRoutes.js'
import homeRoutes from './api/homeRoutes.js'
import adminRoutes from './api/adminRoutes.js'
import doctorRoutes from './api/doctorRoutes.js'
import patientRoutes from './api/patientRoutes.js'


const router = express.Router()

router.use('/auth', authRoutes) // /api/v1/auth
router.use('/home', homeRoutes) // /api/v1/home
router.use('/admin', adminRoutes) // /api/v1/admin
router.use('/doctor', doctorRoutes) // /api/v1/doctor
router.use('/patient', patientRoutes) // /api/v1/patient

export default router