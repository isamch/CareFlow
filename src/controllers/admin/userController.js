import mongoose from 'mongoose'

import User from "./../../models/User.js";
import Doctor from './../../models/Doctor.js'
import Nurse from './../../models/Nurse..js'
import Secretary from './../../models/Secretary.js'
import Patient from './../../models/Patient.js'
import PatientRecord from './../models/PatientRecord.js'


import { successResponse } from './../../utils/apiResponse.js'
import * as ApiError from './../../utils/ApiError.js'
import asyncHandler from './../../utils/asyncHandler.js'
import { hashPassword } from './../../utils/hashing.js'
import { getPagination } from './../../utils/pagination.js'



export const createUser = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, role, profileData } = req.body
  
  if (await User.findOne({ email })) {
    return next(ApiError.conflict('User with this email already exists'))
  }

  const userData = {
    fullName, email, role,
    isEmailVerified: true,
    status: 'active'
  }
  if (password) {
    userData.password = await hashPassword(password)
  }
  const user = await User.create(userData)

  let profile
  try {
    switch (role) {
      case 'Doctor':
        profile = await Doctor.create({ ...profileData, userId: user._id })
        break
      case 'Nurse':
        profile = await Nurse.create({ ...profileData, userId: user._id })
        break
      case 'Secretary':
        profile = await Secretary.create({ ...profileData, userId: user._id })
        break
      case 'Patient':
        const record = await PatientRecord.create({})
        profile = await Patient.create({ patientRecord: record._id, userId: user._id })
        break
      case 'Admin':
        break // Admin has no profile
      default:
        throw new Error('Invalid role specified')
    }
  } catch (err) {
    await User.findByIdAndDelete(user._id) // Rollback
    return next(ApiError.badRequest(`Failed to create profile: ${err.message}`))
  }
  
  return successResponse(res, 201, `${role} created successfully`, { user: user.toJSON(), profile })
})
