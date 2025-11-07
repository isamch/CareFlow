import Doctor from '../../models/Doctor.js'
import { successResponse } from '../../utils/apiResponse.js'
import * as ApiError from '../../utils/ApiError.js'
import asyncHandler from '../../utils/asyncHandler.js'

// @desc    Get my (doctor) profile
export const getMyProfile = asyncHandler(async (req, res, next) => {
  const profileId = req.user.profileId // From the token (JWT)

  const profile = await Doctor.findById(profileId)
    .populate('assignedNurse')
    .populate('userId', 'fullName email');

  if (!profile) return next(ApiError.notFound('Doctor profile not found'))

  return successResponse(res, 200, 'Profile retrieved', profile)
})



// @desc    Doctor updates their profile (e.g., working hours)
export const updateMyProfile = asyncHandler(async (req, res, next) => {
  const profileId = req.user.profileId
  const { specialization, workingHours } = req.body // Only allowed fields

  const profile = await Doctor.findByIdAndUpdate(
    profileId,
    { specialization, workingHours },
    { new: true, runValidators: true }
  )

  if (!profile) return next(ApiError.notFound('Doctor profile not found'))

  return successResponse(res, 200, 'Profile updated', profile)
})