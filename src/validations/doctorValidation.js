import Joi from 'joi'
const objectId = Joi.string().hex().length(24)

// --- Profile Schemas for Different Roles ---
const timeSlotSchema = Joi.object({
  startTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(), // "HH:MM"
  endTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  isAvailable: Joi.boolean().default(true)
})

// Schema for working hours per day
const workingHourSchema = Joi.object({
  dayOfWeek: Joi.string()
    .valid('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')
    .required(),
  timeSlots: Joi.array().items(timeSlotSchema).min(1).required()
})


export const updateMyProfile = {
  body: Joi.object().keys({
    specialization: Joi.string(),
    workingHours: Joi.array().items(workingHourSchema)
  }).min(1)
}

export const getDoctorAvailability = {
    params: Joi.object().keys({
        doctorId: objectId.required() // Doctor Profile ID (used in home route)
    }),
    query: Joi.object().keys({
        date: Joi.date().iso().required()
    })
}