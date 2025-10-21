import Notification from './../../models/Notification.js'
import { successResponse } from './../../utils/apiResponse.js'
import asyncHandler from './../../utils/asyncHandler.js'

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