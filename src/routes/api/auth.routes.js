import express from 'express'
import * as authController from '../../controllers/auth/authController.js'
import validate from '../../middleware/validatorMiddleware.js'
import * as authValidation from '../../validations/authValidation.js'

const router = express.Router()

router.post('/register', validate(authValidation.register), authController.register)
router.post('/login', validate(authValidation.login), authController.login)
router.get('/verify-email/:token', validate(authValidation.verifyEmail), authController.verifyEmail)
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword)
router.post('/reset-password/:token', validate(authValidation.resetPassword), authController.resetPassword)
router.post('/refresh', validate(authValidation.refresh), authController.refresh)
router.post('/logout', authController.logout)

export default router