import Notification from './../../models/Notification.js'
import { successResponse } from './../../utils/apiResponse.js'
import asyncHandler from './../../utils/asyncHandler.js'
import { getPagination } from './../../utils/pagination.js'




// @desc  Get notifications for the logged-in user with pagination
// @route GET /api/patient/notifications/me
// @access Private (Patient)
export const getMyNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id


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




