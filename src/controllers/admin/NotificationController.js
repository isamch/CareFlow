import Notification from './../../models/Notification.js'
import { successResponse } from './../../utils/apiResponse.js'
import asyncHandler from './../../utils/asyncHandler.js'
import { getPagination } from './../../utils/pagination.js'




// @desc    Admin gets notifications for a user
// @route   GET /api/admin/notifications/:userId
// @access  Private (Admin)
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.params.userId

  // get pagination params
  const { page, perPage, skip } = getPagination(req.query)

  // get notifications with pagination  
  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(perPage)

  const total = await Notification.countDocuments({ user: userId })

  return successResponse(res, 200, 'Notifications retrieved', {
    notifications,
    total,
    page,
    limit: perPage
  })
})




// @desc    Admin creates a notification for a user
// @route   POST /api/admin/notifications
// @access  Private (Admin)
export const createNotification = asyncHandler(async (req, res) => {
  
  const { userId, title, message, type } = req.body
  
  const notification = await Notification.create({
    user: userId, // The main User ID
    title,
    message,
    type
  })

  return successResponse(res, 201, 'Notification created', notification)
})




