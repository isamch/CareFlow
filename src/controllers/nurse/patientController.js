import PatientRecord from '../../models/PatientRecord.js'
import Patient from '../../models/Patient.js'
import { successResponse } from '../../utils/apiResponse.js'
import * as ApiError from '../../utils/ApiError.js'
import asyncHandler from '../../utils/asyncHandler.js'




// @desc    Get Patient Record
// @route   GET /nurse/patients/:patientId/record
// @access  Nurse
export const getPatientRecord = asyncHandler(async (req, res, next) => {
  const { patientId } = req.params // This is Patient Profile ID

  const patient = await Patient.findById(patientId).populate('patientRecord')

  if (!patient || !patient.patientRecord) {
    return next(ApiError.notFound('Patient record not found'))
  }

  return successResponse(res, 200, 'Patient record retrieved', patient.patientRecord)
})