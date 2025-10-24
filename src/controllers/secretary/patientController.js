import User from '../../models/User.js'
import Role from '../../models/Role.js'
import Patient from '../../models/Patient.js'
import PatientRecord from '../../models/PatientRecord.js'
import { successResponse } from '../../utils/apiResponse.js'
import * as ApiError from '../../utils/ApiError.js'
import asyncHandler from '../../utils/asyncHandler.js'



// @desc create a new patient
// @route POST /api/v1/secretary/patients
// @access Private (Secretary, Permission: 'create:patient')
export const createPatient = asyncHandler(async (req, res, next) => {
  const { fullName, email, dateOfBirth, bloodType, address } = req.body
  
  if (await User.findOne({ email })) {
    return next(ApiError.conflict('User with this email already exists'))
  }

  const patientRole = await Role.findOne({ name: 'Patient' })
  if (!patientRole) return next(ApiError.badRequest('Patient role not configured'))

  // 1. create user account
  const user = await User.create({
    fullName,
    email,
    role: patientRole._id,
    isEmailVerified: true,
    status: 'active'
  })

  // 2. create patient record
  const record = await PatientRecord.create({ dateOfBirth, bloodType, address })
  
  // 3. create patient profile
  const profile = await Patient.create({
    userId: user._id,
    patientRecord: record._id
  })
  
  return successResponse(res, 201, 'Patient created successfully', { user: user.toJSON(), profile })
})





// @desc   Search Patients
// @route  GET /api/v1/secretary/patients/search?q=
// @access Private (Secretary, Permission: 'read:patient')
export const searchPatients = asyncHandler(async (req, res) => {
  const { q } = req.query
  if (!q) return successResponse(res, 200, 'Search query is required', [])

  const patientRole = await Role.findOne({ name: 'Patient' })
  
  const users = await User.find({
    role: patientRole._id,
    $or: [
      { fullName: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ]
  })
  
  return successResponse(res, 200, 'Patients found', users)
})



// @desc    Get Patient by User ID
// @route   GET /api/v1/secretary/patients/:userId
// @access  Private (Secretary, Permission: 'read:patient')
export const getPatientById = asyncHandler(async (req, res, next) => {
  const { userId } = req.params
  const user = await User.findById(userId).populate('role')
  
  if (!user || user.role.name !== 'Patient') {
    return next(ApiError.notFound('Patient user not found'))
  }
  
  const profile = await Patient.findOne({ userId: user._id }).populate('patientRecord')
  if (!profile) return next(ApiError.notFound('Patient profile not found'))
  
  return successResponse(res, 200, 'Patient retrieved', { user, profile })
})