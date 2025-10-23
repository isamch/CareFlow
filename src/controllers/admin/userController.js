import mongoose from 'mongoose'

import User from "./../../models/User.js";
import Role from "./../../models/Role.js";
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



// @desc    Create a new user (Doctor, Nurse, etc.)
export const createUser = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, roleName, profileData } = req.body
  
  if (await User.findOne({ email })) {
    return next(ApiError.conflict('User with this email already exists'))
  }
  
  const role = await Role.findOne({ name: roleName })
  if (!role) return next(ApiError.badRequest(`Role '${roleName}' not found`))

  const userData = {
    fullName, email,
    role: role._id,
    isEmailVerified: true, // Assuming admin-created users are pre-verified
    status: 'active'
  }
  if (password) {
    userData.password = await hashPassword(password)
  }
  const user = await User.create(userData)

  let profile
  try {
    const data = { ...profileData, userId: user._id }
    switch (roleName) {
      case 'Doctor': profile = await Doctor.create(data); break
      case 'Nurse': profile = await Nurse.create(data); break
      case 'Secretary': profile = await Secretary.create(data); break
      case 'Patient':
        // For patients, create their record and profile
        const record = await PatientRecord.create({})
        profile = await Patient.create({ patientRecord: record._id, userId: user._id })
        break
      case 'Admin': break // Admins might not have a separate profile
      default: throw new Error('Invalid role specified')
    }
  } catch (err) {
    await User.findByIdAndDelete(user._id) // Rollback user creation on profile failure
    return next(ApiError.badRequest(`Failed to create profile: ${err.message}`))
  }
  
  return successResponse(res, 201, `${roleName} created successfully`, { user: user.toJSON(), profile })
})













// @desc    Get all users (with filtering and pagination)
export const getUsers = asyncHandler(async (req, res) => {
  const { roleName, page, limit } = req.query
  const query = {}

  if (roleName) {
    const role = await Role.findOne({ name: roleName })
    if (role) query.role = role._id
  }

  const { skip, perPage } = getPagination(page, limit)
  const [users, total] = await Promise.all([
    User.find(query)
      .populate('role', 'name')
      .skip(skip)
      .limit(perPage),
    User.countDocuments(query)
  ])

  return successResponse(res, 200, 'Users retrieved', {
    users,
    total,
    page: Number(page) || 1,
    limit: perPage
  })
})


// @desc    Get a single user with their profile
export const getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params // User ID
  const user = await User.findById(id).populate('role')
  if (!user) return next(ApiError.notFound('User not found'))
  
  let profile = null
  if (user.role.name !== 'Admin') {
    // Dynamically find the profile based on the role name
    profile = await mongoose.model(user.role.name).findOne({ userId: user._id })
  }
  return successResponse(res, 200, 'User retrieved', { user, profile })
})




// @desc    Update basic user data
export const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const updateFields = {}

  // Only update fields that are present in the request body
  const allowedFields = ['fullName', 'email', 'status']
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateFields[field] = req.body[field]
    }
  })

  // Handle role update if roleName is provided
  if (req.body.roleName) {
    const role = await Role.findOne({ name: req.body.roleName })
    if (!role) return next(ApiError.badRequest('Role not found'))
    updateFields.role = role._id
  }

  if (Object.keys(updateFields).length === 0) {
    return next(ApiError.badRequest('No valid fields provided for update'))
  }

  const user = await User.findByIdAndUpdate(id, updateFields, { new: true })
  if (!user) return next(ApiError.notFound('User not found'))
  return successResponse(res, 200, 'User updated', user)
})



// @desc    Update user profile (e.g., doctor's specialization)
export const updateUserProfile = asyncHandler(async (req, res, next) => {
  const { id } = req.params // User ID
  const profileData = req.body
  const user = await User.findById(id).populate('role')
  if (!user || user.role.name === 'Admin') return next(ApiError.notFound('User or profile not found'))

  const ProfileModel = mongoose.model(user.role.name)
  const profile = await ProfileModel.findOneAndUpdate({ userId: id }, profileData, { new: true })
  if (!profile) return next(ApiError.notFound('Profile not found'))
  return successResponse(res, 200, 'Profile updated', profile)
})


// @desc    Delete (suspend) a user
export const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  // This is a soft delete by changing status
  const user = await User.findByIdAndUpdate(id, { status: 'suspended' })
  if (!user) return next(ApiError.notFound('User not found'))
  return successResponse(res, 204, 'User suspended') // 204 No Content is common for deletes
})