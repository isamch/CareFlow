import Appointment from '../../models/Appointment.js'
import { successResponse } from '../../utils/apiResponse.js'
import asyncHandler from '../../utils/asyncHandler.js'




export const getMyAppointments = asyncHandler(async (req, res) => {
  const nurseId = req.user.profileId

  const appointments = await Appointment.find({ nurse: nurseId })
    .populate({
      path: 'doctor',
      populate: {
        path: 'userId',
        select: 'fullName'
      }
    })
    .populate({
      path: 'patient',
      populate: {
        path: 'userId',
        select: 'fullName'
      }
    })
    .sort({ startTime: 1 })

  return successResponse(res, 200, 'Assigned appointments retrieved', appointments)
})