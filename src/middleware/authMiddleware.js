import { verifyAccessToken } from '../utils/jwt.js'
import User from '../models/User.js'
import { unauthorized, forbidden } from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'


export const protect = asyncHandler(async (req, res, next) => {
  let token
  const authHeader = req.headers.authorization

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  }

  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token
  }

  if (!token) {
    throw unauthorized('Not authorized, no token')
  }

  const payload = verifyAccessToken(token)

  if (!payload) {
    throw unauthorized('Not authorized, token invalid')
  }

  const user = await User.findById(payload.id).select('-password')

  if (!user || user.status !== 'active') {
    throw unauthorized('User not found or suspended')
  }

  req.user = {
    ...user.toObject(),
    profileId: payload.profileId,
  }

  next()
})

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw forbidden(`User role '${req.user.role}' is not authorized to access this route`)
    }
    next()
  }
}