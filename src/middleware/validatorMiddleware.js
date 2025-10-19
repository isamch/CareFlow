import Joi from 'joi'

export default (schema) => (req, res, next) => {
  const requestSchema = Joi.object({
    body: schema.body || Joi.object(),
    params: schema.params || Joi.object(),
    query: schema.query || Joi.object()
  })

  const dataToValidate = {
    body: req.body,
    params: req.params,
    query: req.query
  }

  const { error, value } = requestSchema.validate(dataToValidate, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true
  })

  if (error) {
    error.isJoi = true
    return next(error)
  }

  req.body = value.body
  req.params = value.params
  req.query = value.query

  next()
}
