import express from 'express'
import * as userController from '../../controllers/admin/userController.js'
import * as roleController from '../../controllers/permission/roleController.js'
import * as logController from '../../controllers/admin/logController.js'
import * as notificationController from '../../controllers/admin/NotificationController.js'
import { protect, authorize } from '../../middleware/authMiddleware.js' // Use 'authorize' for permission checks
import validate from '../../middleware/validatorMiddleware.js'
import * as userValidation from '../../validations/userValidation.js'
import * as roleValidation from '../../validations/roleValidation.js'
import * as logValidation from '../../validations/logValidation.js'
import * as notificationValidation from '../../validations/notificationValidation.js'

const router = express.Router()

// Protect all admin routes and require a general admin permission
router.use(protect, authorize('access:admin_panel'))

// --- Role Management ---
router.post('/roles', authorize('manage:roles'), validate(roleValidation.createRole), roleController.createRole)
router.get('/roles', authorize('manage:roles'), roleController.getAllRoles)
router.put('/roles/:id', authorize('manage:roles'), validate(roleValidation.updateRole), roleController.updateRole)
router.delete('/roles/:id', authorize('manage:roles'), validate(roleValidation.getOrDeleteRole), roleController.deleteRole)

// --- User Management ---
router.post('/users', authorize('create:user'), validate(userValidation.createUser), userController.createUser)
router.get('/users', authorize('read:user'), validate(userValidation.getUsers), userController.getUsers)
router.get('/users/:id', authorize('read:user'), validate(userValidation.getUserById), userController.getUserById)
router.put('/users/:id', authorize('update:user'), validate(userValidation.updateUser), userController.updateUser)
router.put('/users/:id/profile', authorize('update:user'), validate(userValidation.updateUserProfile), userController.updateUserProfile)
router.delete('/users/:id', authorize('delete:user'), validate(userValidation.getUserById), userController.deleteUser) // Use validation for param

// --- Log Management ---
router.get('/logs', authorize('read:log'), validate(logValidation.getLogs), logController.getLogs)

// --- Notification Management ---
router.post('/notifications', authorize('create:notification'), validate(notificationValidation.createNotification), notificationController.createNotification)

export default router