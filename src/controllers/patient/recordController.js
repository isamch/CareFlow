import Patient from './../../models/Patient.js'
import { successResponse } from './../../utils/apiResponse.js'
import * as ApiError from './../../utils/ApiError.js'
import asyncHandler from './../../utils/asyncHandler.js'



// @desc Get My Patient Record
// @route GET /api/patient/record/me
// @access Private (Patient)
export const getMyRecord = asyncHandler(async (req, res, next) => {
  const patientId = req.user.profileId
  const patient = await Patient.findById(patientId).populate({
    path: 'patientRecord',
    populate: {
      path: 'visits.doctorId',
      populate: {
        path: 'userId',
        select: 'fullName'
      }
    }
  })
  if (!patient || !patient.patientRecord) {
    return next(ApiError.notFound('Patient record not found'))
  }
  return successResponse(res, 200, 'Patient record retrieved', patient.patientRecord)
})