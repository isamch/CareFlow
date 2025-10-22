import Role from '../../models/Role.js'
import { successResponse } from '../../utils/apiResponse.js'
import * as ApiError from '../../utils/ApiError.js'
import asyncHandler from '../../utils/asyncHandler.js'


// @desc    Create a new role (e.g., "Receptionist")
export const createRole = asyncHandler(async (req, res, next) => {
  const { name, description, permissions } = req.body
  if (await Role.findOne({ name })) {
    return next(ApiError.conflict('Role with this name already exists'))
  }
  const role = await Role.create({ name, description, permissions })
  return successResponse(res, 201, 'Role created successfully', role)
})



// @desc    Get all roles
export const getAllRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find()
  return successResponse(res, 200, 'Roles retrieved', roles)
})


// @desc    Update a role (add/remove permissions or update status)
export const updateRole = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const { name, description, permissions, status } = req.body
  const updateFields = {}

  if (name !== undefined) updateFields.name = name
  if (description !== undefined) updateFields.description = description
  if (permissions !== undefined) updateFields.permissions = permissions
  if (status !== undefined) updateFields.status = status

  const role = await Role.findByIdAndUpdate(id, updateFields, { new: true })
  if (!role) return next(ApiError.notFound('Role not found'))
  return successResponse(res, 200, 'Role updated', role)
})


// @desc    Soft delete (deactivate) a role
export const deleteRole = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const role = await Role.findById(id)
  if (!role) return next(ApiError.notFound('Role not found'))

  // Soft delete: set status to 'inactive'
  role.status = 'inactive'
  await role.save()

  return successResponse(res, 200, 'Role deactivated', role)
})