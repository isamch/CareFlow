import PatientRecord from './../../models/PatientRecord.js'
import Patient from './../../models/Patient.js'
import { successResponse } from './../../utils/apiResponse.js'
import * as ApiError from './../../utils/ApiError.js'
import asyncHandler from './../../utils/asyncHandler.js'



export const getPatientRecord = asyncHandler(async (req, res, next) => {
  const { id } = req.params // Patient Profile ID

  const patient = await Patient.findById(id).populate({
    path: 'patientRecord',
    populate: [
      {
        path: 'visits.doctorId', select: 'specialization',
        populate: { path: 'userId', select: 'fullName email' }
      },
      {
        path: 'visits.nurseId',
        populate: { path: 'userId', select: 'fullName email' }
      },
    ]
  })

  if (!patient || !patient.patientRecord) {
    return next(ApiError.notFound('Patient record not found'))
  }

  return successResponse(res, 200, 'Patient record retrieved', patient.patientRecord)
})