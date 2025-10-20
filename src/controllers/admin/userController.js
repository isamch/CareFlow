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



export const getUsers = asyncHandler(async (req, res) => {
  const { page, perPage, skip } = getPagination(req.query)
  const { role } = req.query

  const query = {}
  if (role) query.role = role

  const users = await User.find(query)
    .limit(perPage)
    .skip(skip)
    .sort({ createdAt: -1 })

  const total = await User.countDocuments(query)

  return successResponse(res, 200, 'Users retrieved', {
    total, page, perPage, data: users
  })
})




export const getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params // User ID
  const user = await User.findById(id)
  if (!user) return next(ApiError.notFound('User not found'))

  let profile = null
  if (user.role !== 'Admin') {
    profile = await mongoose.model(user.role).findOne({ userId: user._id })
  }
  return successResponse(res, 200, 'User retrieved', { user, profile })
})



export const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params // User ID
  const { fullName, email, status, role } = req.body

  const user = await User.findByIdAndUpdate(id, { fullName, email, status, role }, { new: true })
  if (!user) return next(ApiError.notFound('User not found'))
  return successResponse(res, 200, 'User updated', user)
})



export const updateUserProfile = asyncHandler(async (req, res, next) => {
  const { id } = req.params // User ID
  const profileData = req.body

  const user = await User.findById(id)
  if (!user || user.role === 'Admin') return next(ApiError.notFound('User or profile not found'))

  const ProfileModel = mongoose.model(user.role)
  const profile = await ProfileModel.findOneAndUpdate({ userId: id }, profileData, { new: true })
  if (!profile) return next(ApiError.notFound('Profile not found'))

  return successResponse(res, 200, 'Profile updated', profile)
})


export const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const user = await User.findById(id)
  if (!user) return next(ApiError.notFound('User not found'))
  
  user.status = 'suspended' // Soft delete
  await user.save()
  return successResponse(res, 204, 'User suspended')
})