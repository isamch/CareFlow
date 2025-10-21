import Nurse from './../../models/Nurse.js'
import { successResponse } from './../../utils/apiResponse.js'
import * as ApiError from './../../utils/ApiError.js'
import asyncHandler from './../../utils/asyncHandler.js'

export const getNurseProfile = asyncHandler(async (req, res, next) => {
  const { id } = req.params // Nurse Profile ID

  const nurse = await Nurse.findById(id).populate({
    path: 'assignedDoctor',
    select: 'specialization'
  }).populate({
    path: 'userId',
    select: 'name email phone'
  })

  if (!nurse) return next(ApiError.notFound('Nurse not found'))

  return successResponse(res, 200, 'Nurse profile retrieved', nurse)
})
