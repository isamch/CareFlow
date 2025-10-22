import mongoose from 'mongoose'

import Appointment from './../../models/Appointment.js'
import Doctor from './../../models/Doctor.js'

import { successResponse } from './../../utils/apiResponse.js'
import * as ApiError from './../../utils/ApiError.js'
import asyncHandler from './../../utils/asyncHandler.js'
import getPagination from './../../utils/pagination.js'



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


export const createAppointment = asyncHandler(async (req, res, next) => {
  const { doctorId, patientId, startTime, endTime } = req.body

  const doctor = await Doctor.findById(doctorId)
  if (!doctor) return next(ApiError.notFound('Doctor not found'))

  // Check for time conflicts
  const hasConflict = await checkConflict(doctorId, startTime, endTime)
  if (hasConflict) {
    return next(ApiError.conflict('The doctor has another appointment during this time slot'))
  }

  // Create the appointment 
  const appointment = await Appointment.create({
    createdBy: req.user.id,
    doctor: doctorId,
    patient: patientId,
    startTime,
    endTime,
    status: 'pending'
  })

  return successResponse(res, 201, 'Appointment created successfully', appointment)
})



export const getAppointments = asyncHandler(async (req, res) => {
  const { page, perPage, skip } = getPagination(req.query)
  const { role, profileId } = req.user
  const query = {}

  if (role === 'Patient') query.patient = profileId
  else if (role === 'Doctor') query.doctor = profileId
  else if (role === 'Nurse') query.nurse = profileId
  else if (role === 'Secretary') {
    // Logic to show appointments for managed doctors
  } // Admin sees all

  const appointments = await Appointment.find(query)
    .populate('doctor')
    .populate('patient')
    .limit(perPage)
    .skip(skip)
    .sort({ startTime: 1 })

  const total = await Appointment.countDocuments(query)
  return successResponse(res, 200, 'Appointments retrieved', { total, page, perPage, data: appointments })
})