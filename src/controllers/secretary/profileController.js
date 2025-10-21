import Secretary from './../../models/Secretary.js'
import { successResponse } from './../../utils/apiResponse.js'
import * as ApiError from './../../utils/ApiError.js'
import asyncHandler from './../../utils/asyncHandler.js'


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