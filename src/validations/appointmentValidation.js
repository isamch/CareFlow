import Joi from 'joi'
const objectId = Joi.string().hex().length(24)

// Validation for Patient creating appointment
export const createMyAppointment = {
  body: Joi.object().keys({
    doctorId: objectId.required(), // Doctor Profile ID
    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso().required().greater(Joi.ref('startTime')),
    reason: Joi.string().optional()
  })
}

// Validation for Secretary creating appointment
export const createAppointmentBySecretary = {
  body: Joi.object().keys({
    patientId: objectId.required(), // Patient Profile ID
    doctorId: objectId.required(), // Doctor Profile ID
    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso().required().greater(Joi.ref('startTime')),
    reason: Joi.string().optional(),
    notes: Joi.string().optional() // Secretary can add notes
  })
}

// Validation for getting appointments (shared, filters vary)
export const getAppointments = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1),
    perPage: Joi.number().integer().min(1).max(100),
    doctorId: objectId.optional(), // Filter for Secretary/Admin
    patientId: objectId.optional(), // Filter for Secretary/Admin
    from: Joi.date().iso().optional(),
    to: Joi.date().iso().optional()
  })
}

// Validation for getting or cancelling appointment by ID
export const appointmentIdParam = {
  params: Joi.object().keys({
    id: objectId.required() // Appointment ID
  })
}

// Validation for Secretary updating appointment
export const updateAppointmentBySecretary = {
  params: Joi.object().keys({
    id: objectId.required() // Appointment ID
  }),
  body: Joi.object().keys({
    patientId: objectId.optional(),
    doctorId: objectId.optional(),
    nurseId: objectId.optional().allow(null),
    startTime: Joi.date().iso().optional(),
    endTime: Joi.date().iso().optional(),
    status: Joi.string().valid('scheduled', 'in-progress', 'completed', 'cancelled', 'no-show').optional(),
    reason: Joi.string().optional(),
    notes: Joi.string().optional()
  }).min(1)
}

// Validation for Doctor updating status
export const updateAppointmentStatusByDoctor = {
  params: Joi.object().keys({
    id: objectId.required() // Appointment ID
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('scheduled', 'in-progress', 'completed', 'cancelled', 'no-show').required(),
    notes: Joi.string().optional()
  })
}