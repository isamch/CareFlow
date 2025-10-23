import Secretary from './../../models/Secretary.js'
import { successResponse } from './../../utils/apiResponse.js'
import * as ApiError from './../../utils/ApiError.js'
import asyncHandler from './../../utils/asyncHandler.js'


// @desc get secretary profile by ID
// @route GET /api/v1/secretary/profile/:id
// @access Private (Secretary)
export const getSecretaryProfile = asyncHandler(async (req, res, next) => {
  const { id } = req.params // Secretary Profile ID

  const secretary = await Secretary.findById(id).populate({
    path: 'managingDoctors',
    select: 'specialization'
  }).populate({
    path: 'userId',
    select: 'fullName email status'
  })

  if (!secretary) return next(ApiError.notFound('Secretary not found'))

  return successResponse(res, 200, 'Secretary profile retrieved', secretary)
})




// @desc update my profile
// @route PUT /api/v1/secretary/profile/me
// @access Private (Secretary)
export const updateMyProfile = asyncHandler(async (req, res, next) => {
  const profileId = req.user.profileId
  const { managingDoctors } = req.body
  
  const profile = await Secretary.findByIdAndUpdate(
    profileId, 
    { managingDoctors },
    { new: true, runValidators: true }
  )
  
  if (!profile) return next(ApiError.notFound('Secretary profile not found'))
  return successResponse(res, 200, 'Profile updated', profile)
})