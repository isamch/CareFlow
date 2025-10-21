import Patient from './../../models/Patient.js'
import { successResponse } from './../../utils/apiResponse.js'
import * as ApiError from './../../utils/ApiError.js'
import asyncHandler from './../../utils/asyncHandler.js'



export const getMyRecord = asyncHandler(async (req, res, next) => {
  // Get Patient Profile ID from the authenticated user's token
  const patientId = req.user.profileId 
  
  const patient = await Patient.findById(patientId).populate({
    path: 'patientRecord',
    populate: { path: 'visits.doctorId', select: 'specialization' }
  })

  if (!patient || !patient.patientRecord) {
    return next(ApiError.notFound('Patient record not found'))
  }

  return successResponse(res, 200, 'Patient record retrieved', patient.patientRecord)
})