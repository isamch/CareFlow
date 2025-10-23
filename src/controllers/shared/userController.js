import User from '../../models/User.js'
import { successResponse } from '../../utils/apiResponse.js'
import * as ApiError from '../../utils/ApiError.js'
import asyncHandler from '../../utils/asyncHandler.js'
import mongoose from 'mongoose'

export const getSelf = asyncHandler(async (req, res, next) => {
  const userId = req.user.id
  const user = await User.findById(userId)
  if (!user) return next(ApiError.notFound('User not found'))
  
  let profile = null
  if (user.role !== 'Admin') {
    profile = await mongoose.model(user.role).findOne({ userId: user._id })
  }
  
  return successResponse(res, 200, 'Profile retrieved', { user, profile })
})