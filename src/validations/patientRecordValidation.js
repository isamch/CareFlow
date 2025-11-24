import Joi from 'joi'
const objectId = Joi.string().hex().length(24)

// Validation for getting record or adding visit (uses patient profile ID)
export const patientIdParam = {
  params: Joi.object().keys({
    patientId: objectId.required() // Patient Profile ID
  })
}

// Validation for the payload when adding a visit
export const addVisitPayload = {
    params: Joi.object().keys({
    patientId: objectId.required() // Patient Profile ID
  }),
  body: Joi.object().keys({
    date: Joi.date().iso().optional(),
    diagnosis: Joi.array().items(Joi.string()).optional(),
    symptoms: Joi.array().items(Joi.string()).optional(),
    treatments: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        dosage: Joi.string().optional(),
        duration: Joi.string().optional()
      })
    ).optional(),
    notes: Joi.string().optional(),
    // doctorId / nurseId are added by the controller
    doctorId: objectId.optional(),
    nurseId: objectId.optional()
  })
}

