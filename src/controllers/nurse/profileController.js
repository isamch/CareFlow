import Nurse from './../../models/Nurse.js'
import User from '../../models/User.js'
import { successResponse } from './../../utils/apiResponse.js'
import * as ApiError from './../../utils/ApiError.js'
import asyncHandler from './../../utils/asyncHandler.js'





// @desc get nurse profile by ID
// @route GET /api/v1/nurse/profile/:id
// @access Public
export const getNurseProfile = asyncHandler(async (req, res, next) => {
  const { id } = req.params // Nurse Profile ID

  const nurse = await Nurse.findById(id).populate({
    path: 'assignedDoctor',
    select: 'specialization'
  }).populate({
    path: 'userId',
    select: 'fullName email status'
  })

  if (!nurse) return next(ApiError.notFound('Nurse not found'))

  return successResponse(res, 200, 'Nurse profile retrieved', nurse)
})



// @desc    Update my nurse profile + user info
// @route   PUT /api/v1/nurse/profile/me
// @access  Private (Nurse)
export const updateMyProfile = asyncHandler(async (req, res, next) => {
  const profileId = req.user.profileId

  // Fields allowed to update
  const { fullName, email } = req.body

  // Find the nurse profile
  const nurse = await Nurse.findById(profileId)
  if (!nurse) return next(ApiError.notFound('Nurse profile not found'))

  // Find and update the user account of the nurse
  const updatedUser = await User.findByIdAndUpdate(
    nurse.userId,
    { fullName, email },
    { new: true, runValidators: true }
  )

  // Populate for clean response
  const updatedNurse = await Nurse.findById(nurse._id)
    .populate({
      path: 'userId',
      select: 'fullName email status role'
    })
    .populate({
      path: 'assignedDoctor',
      populate: { path: 'userId', select: 'fullName email' }
    })

  return successResponse(res, 200, 'Nurse profile updated successfully', {
    nurse: updatedNurse,
    user: updatedUser
  })
})