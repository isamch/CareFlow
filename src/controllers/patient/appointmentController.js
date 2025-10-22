import mongoose from 'mongoose'
import Appointment from '../../models/Appointment.js'
import Doctor from './../../models/Doctor.js'

import { successResponse } from '../../utils/apiResponse.js'
import * as ApiError from '../../utils/ApiError.js'
import asyncHandler from '../../utils/asyncHandler.js'

/**
 * Helper function: Check if there is a time conflict for a doctor
 */
const checkConflict = async (doctorId, startTime, endTime) => {
  const conflict = await Appointment.findOne({
    doctor: doctorId,
    status: { $ne: 'cancelled' },
    $or: [
      { startTime: { $lt: endTime, $gte: startTime } },
      { endTime: { $gt: startTime, $lte: endTime } },
      {
        startTime: { $lte: startTime },
        endTime: { $gte: endTime }
      }
    ]
  })

  if (conflict) return true;

  return false
}




// @desc patient creates an appointment
// @route POST /api/patients/me/appointments
// @access Private (Patient)
export const createMyAppointment = asyncHandler(async (req, res, next) => {
  const { doctorId, startTime, endTime, reason } = req.body
  const patientId = req.user.profileId // The Patient ID comes from the JWT token

  // Validate doctor existence
  const doctor = await Doctor.findById(doctorId)
  if (!doctor) return next(ApiError.notFound('Doctor not found'))

  // Check for time conflicts
  const hasConflict = await checkConflict(doctorId, startTime, endTime)
  if (hasConflict) {
    return next(ApiError.conflict('The doctor has another appointment during this time slot'))
  }

  const appointment = await Appointment.create({
    patient: patientId,
    doctor: doctorId,
    startTime,
    endTime,
    reason,
    status: 'scheduled'
  })
  return successResponse(res, 201, 'Appointment created successfully', appointment)
})





// @desc patient gets their appointments
// @route GET /api/patients/me/appointments
// @access Private (Patient)
export const getMyAppointments = asyncHandler(async (req, res) => {
  const patientId = req.user.profileId
  const appointments = await Appointment.find({ patient: patientId })
    .populate({
      path: 'doctor',          // first populate of Doctor
      populate: {
        path: 'userId',        // populate the User inside Doctor
        select: 'name email'   // choose fields to return
      }
    })
    .sort({ startTime: 1 })
  return successResponse(res, 200, 'Appointments retrieved successfully', appointments)
})





// @desc patient cancels their appointment
// @route DELETE /api/patients/me/appointments/:id
// @access Private (Patient)
export const cancelMyAppointment = asyncHandler(async (req, res, next) => {
  const { id } = req.params // Appointment ID
  const patientId = req.user.profileId

  const appointment = await Appointment.findOneAndUpdate(
    { _id: id, patient: patientId, status: 'scheduled' }, // Only scheduled appointments can be cancelled
    { status: 'cancelled' },
    { new: true }
  )
  if (!appointment) return next(ApiError.notFound('Appointment not found or cannot be cancelled'))
  return successResponse(res, 200, 'Appointment cancelled', appointment)
})