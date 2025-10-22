import Doctor from '../../models/Doctor.js'
import Appointment from '../../models/Appointment.js'
import { successResponse } from '../../utils/apiResponse.js'
import * as ApiError from '../../utils/ApiError.js'
import asyncHandler from '../../utils/asyncHandler.js'
import dayjs from 'dayjs'


// @desc    Get doctor's availability for a specific date
// @route   GET /api/doctors/:id/availability?date=YYYY-MM-DD
// @access  Public
export const getDoctorAvailability = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const { date } = req.query

  const doctor = await Doctor.findById(id)
  if (!doctor) return next(ApiError.notFound('Doctor not found'))

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayOfWeek = days[dayjs(date).day()]
  const schedule = doctor.workingHours.find(h => h.dayOfWeek === dayOfWeek)

  if (!schedule || !schedule.timeSlots || schedule.timeSlots.length === 0) {
    return successResponse(res, 200, 'Doctor is not available on this day', { date, availableSlots: [] })
  }

  const dayStart = dayjs(date).startOf('day')
  const dayEnd = dayjs(date).endOf('day')

  const existingAppointments = await Appointment.find({
    doctor: id,
    status: { $ne: 'cancelled' },
    startTime: { $gte: dayStart.toDate(), $lt: dayEnd.toDate() }
  }, { startTime: 1, endTime: 1 })

  const bookedSlots = existingAppointments.map(appt => ({
    start: dayjs(appt.startTime),
    end: dayjs(appt.endTime)
  }))

  const availableSlots = []
  schedule.timeSlots.forEach(slot => {
    if (!slot.isAvailable) return

    const slotStart = dayjs(`${date}T${slot.startTime}`)
    const slotEnd = dayjs(`${date}T${slot.endTime}`)

    const isBooked = bookedSlots.some(b => 
      slotStart.isBefore(b.end) && slotEnd.isAfter(b.start)
    )

    if (!isBooked) {
      availableSlots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString()
      })
    }
  })

  return successResponse(res, 200, 'Availability retrieved', { schedule, availableSlots })
})



// @desc    Doctor updates their working hours
// @route   PUT /api/doctors/me/working-hours
// @access  Private (Doctor)
export const updateWorkingHours = asyncHandler(async (req, res, next) => {
  // The Doctor ID comes from the JWT token
  const doctorId = req.user.profileId 
  const { workingHours } = req.body
  
  const doctor = await Doctor.findByIdAndUpdate(
    doctorId, 
    { workingHours },
    { new: true, runValidators: true }
  )
  if (!doctor) return next(ApiError.notFound('Doctor profile not found'))
  
  return successResponse(res, 200, "Working hours updated", doctor.workingHours)
})