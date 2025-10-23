import Joi from 'joi'
const objectId = Joi.string().hex().length(24)


export const getPatientRecord = {
  params: Joi.object().keys({
    patientId: objectId.required()
  })
}