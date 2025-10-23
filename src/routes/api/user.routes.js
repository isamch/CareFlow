import express from 'express'
import * as userController from '../../controllers/shared/userController.js'
import * as notificationController from '../../controllers/shared/NotificationController.js'
import { protect } from '../../middleware/authMiddleware.js'
import validate from '../../middleware/validatorMiddleware.js'
import * as notificationValidation from '../../validations/notificationValidation.js'

const router = express.Router()

// Protect all routes in this file (user must be logged in)
router.use(protect)

// Get own user account + profile details
router.get('/me', userController.getSelf)

// Get own notifications
router.get('/me/notifications', validate(notificationValidation.getNotifications), notificationController.getMyNotifications)

// (Add routes for changing password, updating own basic user info if needed)


export default router