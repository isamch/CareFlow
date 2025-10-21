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


export const addVisit = asyncHandler(async (req, res, next) => {
  const { id } = req.params // Patient Profile ID
  const visitData = req.body

  const patient = await Patient.findById(id)
  if (!patient) return next(ApiError.notFound('Patient not found'))

  const record = await PatientRecord.findById(patient.patientRecord)
  if (!record) return next(ApiError.notFound('Patient record not found'))

  visitData.doctorId = req.user.profileId // Doctor's Profile ID from JWT

  record.visits.push(visitData)
  await record.save()

  const newVisit = record.visits[record.visits.length - 1]
  return successResponse(res, 201, 'Visit added successfully', newVisit)
})