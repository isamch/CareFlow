import Log from './../../models/Log.js'
import { successResponse } from './../../utils/apiResponse.js'
import asyncHandler from './../../utils/asyncHandler.js'
import getPagination from './../../utils/pagination.js'

export const getLogs = asyncHandler(async (req, res) => {
  const { page, perPage, skip } = getPagination(req.query)
  const logs = await Log.find()
    .populate('user', 'fullName email')
    .limit(perPage)
    .skip(skip)
    .sort({ createdAt: -1 })

  const total = await Log.countDocuments()
  return successResponse(res, 200, 'Logs retrieved', { total, page, perPage, data: logs })
})