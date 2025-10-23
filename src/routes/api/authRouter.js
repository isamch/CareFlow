import express from 'express'
import * as authController from '../../controllers/auth/authController.js'
const router = express.Router()


router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/verify-email/:token', authController.verifyEmail)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password/:token', authController.resetPassword)


export default router