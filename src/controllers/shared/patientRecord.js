import PatientRecord from '../../models/PatientRecord.js'
import Patient from '../../models/Patient.js'
import { successResponse } from '../../utils/apiResponse.js'
import * as ApiError from '../../utils/ApiError.js'
import asyncHandler from '../../utils/asyncHandler.js'


// @desc    Doctor gets a patient's record
export const getPatientRecord = asyncHandler(async (req, res, next) => {
  const { patientId } = req.params // This is Patient Profile ID
  const patient = await Patient.findById(patientId).populate('patientRecord')
  if (!patient || !patient.patientRecord) {
    return next(ApiError.notFound('Patient record not found'))
  }
  return successResponse(res, 200, 'Patient record retrieved', patient.patientRecord)
})



// @desc    Doctor adds a visit
export const addVisit = asyncHandler(async (req, res, next) => {
  const { patientId } = req.params
  const visitData = req.body
  const doctorId = req.user.profileId // Doctor's Profile ID

  const patient = await Patient.findById(patientId)
  if (!patient) return next(ApiError.notFound('Patient not found'))

  const record = await PatientRecord.findById(patient.patientRecord)
  if (!record) return next(ApiError.notFound('Patient record not found'))

  visitData.doctorId = doctorId // Add the Doctor's ID to the visit
  record.visits.push(visitData)
  await record.save()

  // Return the newly added visit 
  // pop the last visit from the visits array
  return successResponse(res, 201, 'Visit added successfully', record.visits.pop())
})