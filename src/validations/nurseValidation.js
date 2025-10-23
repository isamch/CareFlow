import Joi from 'joi'
const objectId = Joi.string().hex().length(24)


export const getPatientRecord = {
  params: Joi.object().keys({
    patientId: objectId.required()
  })
}

export const updateMyProfile = {
  body: Joi.object().keys({
    shift: Joi.string().valid('day', 'night', 'rotating'),
    fullName: Joi.string().min(3).max(100),
    email: Joi.string().email()
  }).min(1)
}

export const getNurseProfile = { // Used when getting specific nurse profile by Admin
    params: Joi.object().keys({
        id: objectId.required() // Nurse Profile ID
    })
}


