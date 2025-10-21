import Doctor from './../../models/Doctor.js'
import Appointment from './../../models/Appointment.js'
import { successResponse } from './../../utils/apiResponse.js'
import * as ApiError from './../../utils/ApiError.js'
import asyncHandler from './../../utils/asyncHandler.js'
import dayjs from 'dayjs'


export const getDoctorAvailability = asyncHandler(async (req, res, next) => {
  const { id } = req.params // This is the Doctor's Profile ID
  const { date } = req.query

  const doctor = await Doctor.findById(id)
  if (!doctor) return next(ApiError.notFound('Doctor not found'))


  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayOfWeek = days[dayjs(date).day()]
  const schedule = doctor.workingHours.find(h => h.dayOfWeek === dayOfWeek && h.isAvailable)

  if (!schedule) {
    return successResponse(res, 200, 'Doctor is not available on this day', { date, slots: [] })
  }

  const dayStartTime = dayjs(`${date}T${schedule.startTime}`)
  const dayEndTime = dayjs(`${date}T${schedule.endTime}`)


  const existingAppointments = await Appointment.find({
    doctor: id,
    status: { $ne: 'cancelled' },
    startTime: { $gte: dayStartTime.toDate(), $lt: dayEndTime.toDate() }
  }, { startTime: 1 })


  // (Logic to calculate slots based on schedule vs. appointments)

  const slots = []
  let slotStart = dayStartTime

  existingAppointments.forEach(appt => {

    const apptStart = dayjs(appt.startTime)

    if (slotStart.isBefore(apptStart)) {

      slots.push({
        start: slotStart.toISOString(),
        end: apptStart.toISOString()
      })

    }

    slotStart = dayjs(appt.endTime)

  })

  if (slotStart.isBefore(dayEndTime)) {
    slots.push({
      start: slotStart.toISOString(),
      end: dayEndTime.toISOString()
    })
  }


  return successResponse(res, 200, 'Availability retrieved', {
    schedule: { dayOfWeek: schedule.dayOfWeek, startTime: schedule.startTime, endTime: schedule.endTime },
    existingAppointments,
    slots
  })

})