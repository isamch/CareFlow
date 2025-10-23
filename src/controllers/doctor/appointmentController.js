import Appointment from '../../models/Appointment.js'
import { successResponse } from '../../utils/apiResponse.js'
import * as ApiError from '../../utils/ApiError.js'
import asyncHandler from '../../utils/asyncHandler.js'
import getPagination from '../../utils/pagination.js'



// @desc    Doctor gets all of their appointments
// @route   GET /api/doctors/me/appointments
// @access  Private (Doctor)
export const getMyAppointments = asyncHandler(async (req, res) => {
  const doctorId = req.user.profileId

  // get pagination params
  const { page, perPage, skip } = getPagination(req.query)

  // get appointments with pagination
  const [appointments, total] = await Promise.all([
    Appointment.find({ doctor: doctorId })
      .populate('patient')
      .sort({ startTime: 1 })
      .skip(skip)
      .limit(perPage),
    Appointment.countDocuments({ doctor: doctorId })
  ])

  return successResponse(res, 200, 'Appointments retrieved', {
    appointments,
    total,
    page,
    limit: perPage
  })
})




// @desc    Doctor updates an appointment status (e.g., 'completed')
// @route   PUT /api/doctors/me/appointments/:id/status
// @access  Private (Doctor)
export const updateAppointmentStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params // Appointment ID
  const { status } = req.body
  const doctorId = req.user.profileId

  const appointment = await Appointment.findOneAndUpdate(
    { _id: id, doctor: doctorId }, // Ensure the doctor owns the appointment
    { status },
    { new: true }
  )
  if (!appointment) return next(ApiError.notFound('Appointment not found or not owned by you'))
  return successResponse(res, 200, 'Appointment status updated', appointment)
})