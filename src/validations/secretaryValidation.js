import Joi from 'joi'
const objectId = Joi.string().hex().length(24)

// --- Patient Management ---
export const createPatient = {
  body: Joi.object().keys({
    fullName: Joi.string().required(),
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    dateOfBirth: Joi.date().iso(),
    bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    address: Joi.string()
  })
}

export const searchPatients = {
  query: Joi.object().keys({
    q: Joi.string().min(1).required()
  })
}

export const getPatientById = {
  params: Joi.object().keys({
    userId: objectId.required()
  })
}

// --- Appointment Management ---
export const createAppointment = {
  body: Joi.object().keys({
    patientId: objectId.required(), // Patient Profile ID
    doctorId: objectId.required(), // Doctor Profile ID
    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso().required().greater(Joi.ref('startTime')),
    reason: Joi.string(),
    notes: Joi.string()
  })
}

export const updateAppointment = {
  params: Joi.object().keys({
    id: objectId.required() // Appointment ID
  }),
  body: Joi.object().keys({
    patientId: objectId,
    doctorId: objectId,
    nurseId: objectId,
    startTime: Joi.date().iso(),
    endTime: Joi.date().iso(),
    status: Joi.string().valid('scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'),
    reason: Joi.string(),
    notes: Joi.string()
  }).min(1)
}