import Appointment from '../../models/Appointment.js'
import Secretary from '../../models/Secretary.js'
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



// @desc create a new appointment for the patient
// @route POST /api/v1/secretary/appointments
// @access Private (Secretary, Permission: 'create:appointment')
export const createAppointment = asyncHandler(async (req, res, next) => {
  const { patientId, doctorId, startTime, endTime, reason } = req.body
  const secretaryId = req.user.profileId

  // Validate doctor existence
  const doctor = await Doctor.findById(doctorId)
  if (!doctor) return next(ApiError.notFound('Doctor not found'))

  // Check for time conflicts
  const hasConflict = await checkConflict(doctorId, startTime, endTime)
  if (hasConflict) {
    return next(ApiError.conflict('The doctor has another appointment during this time slot'))
  }

  // Create the appointment
  const appointment = await Appointment.create({
    patient: patientId, // Patient Profile ID
    doctor: doctorId, // Doctor Profile ID
    secretary: secretaryId,
    startTime,
    endTime,
    reason,
    status: 'scheduled'
  })

  return successResponse(res, 201, 'Appointment created successfully', appointment)
})





// @desc    Get managed appointments
// @route   GET /api/v1/secretary/appointments
// @access  Private (Secretary, Permission: 'read:appointment')
export const getManagedAppointments = asyncHandler(async (req, res, next) => {

  const secretary = await Secretary.findById(req.user.profileId)
  if (!secretary) return next(ApiError.notFound('Secretary profile not found'))

  const managedDoctorIds = secretary.managingDoctors

  const query = {
    doctor: { $in: managedDoctorIds }
  }

  const appointments = await Appointment.find(query)
    .populate('doctor')
    .populate('patient')
    .sort({ startTime: 1 })

  return successResponse(res, 200, 'Managed appointments retrieved', appointments)
})





// @desc update an appointment
// @route PUT /api/v1/secretary/appointments/:id
// @access Private (Secretary, Permission: 'update:appointment')
export const updateAppointment = asyncHandler(async (req, res, next) => {
  const { id } = req.params // Appointment ID
  const { startTime, endTime, status, doctorId, nurseId } = req.body

  const appointment = await Appointment.findById(id)
  if (!appointment) return next(ApiError.notFound('Appointment not found'))


  if (startTime || endTime || doctorId) {
    const newDoctor = doctorId || appointment.doctor
    const newStart = startTime || appointment.startTime
    const newEnd = endTime || appointment.endTime

    // Check for time conflicts
    const hasConflict = await checkConflict(newDoctor, newStart, newEnd)
    if (hasConflict) {
      return next(ApiError.conflict('The doctor has another appointment during this time slot'))
    }
  }

  const updatedAppt = await Appointment.findByIdAndUpdate(id, req.body, { new: true })
  return successResponse(res, 200, 'Appointment updated', updatedAppt)
})