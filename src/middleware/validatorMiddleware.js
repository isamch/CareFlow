import Joi from 'joi'

/**
 * @desc Middleware factory to validate request body, params, and query against a Joi schema
 * @param {object} schema - An object containing optional 'body', 'params', 'query' Joi schemas
 * @returns {function} Express middleware function
 */
export default (schema) => (req, res, next) => {
  // Define a combined schema for validation
  const requestSchema = Joi.object({
    body: schema.body || Joi.object(), // Default to empty object if not provided
    params: schema.params || Joi.object(),
    query: schema.query || Joi.object()
  })

  // Data object to validate
  const dataToValidate = {
    body: req.body,
    params: req.params,
    query: req.query
  }

  // Perform validation
  const { error, value } = requestSchema.validate(dataToValidate, {
    abortEarly: false, // Return all validation errors
    allowUnknown: true, // Allow properties not defined in schema (for safety)
    stripUnknown: { // Remove unknown properties from validated output
      body: true,
      params: true,
      query: true
    }
  })

  if (error) {
    // Mark error as Joi error for the errorHandler
    error.isJoi = true
    return next(error)
  }

  // --- 🛑 FIX APPLIED HERE 🛑 ---
  // Instead of assigning, we clear and merge properties.
  // This avoids the "Cannot set property query" error on read-only objects like req.query.

  // 1. **Handle req.body** (usually reassignable, but safer to merge if not)
  if (value.body !== undefined) {
    // Clear existing keys
    Object.keys(req.body).forEach(key => delete req.body[key])
    // Merge new/validated keys
    Object.assign(req.body, value.body)
  }

  // 2. **Handle req.params** (usually reassignable, but safer to merge if not)
  if (value.params !== undefined) {
    // Clear existing keys
    Object.keys(req.params).forEach(key => delete req.params[key])
    Object.assign(req.params, value.params)
  }

  // 3. **Handle req.query** (The problematic one: cannot be reassigned)
  if (value.query !== undefined) {
    // Clear existing keys from the read-only object
    Object.keys(req.query).forEach(key => delete req.query[key])
    // Merge new/validated keys into the existing read-only object
    Object.assign(req.query, value.query)
  }
  // --- 🛑 END OF FIX 🛑 ---

  next() // Proceed to the next middleware or controller
}