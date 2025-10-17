import Joi from "joi";

/**
 * ✅ Register (signup) validation
 */
export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  // name: Joi.string()
  //   .min(3)
  //   .max(30)
  //   .required()
  //   .messages({
  //     "string.base": "Name must be a string",
  //     "string.empty": "Name cannot be empty",
  //     "string.min": "Name should have at least 3 characters",
  //     "string.max": "Name should have at most 30 characters",
  //     "any.required": "Name is required"
  //   }),
    
  // username: Joi.string().alphanum().min(3).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  // confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  // age: Joi.number().integer().min(18).max(100),
  // phone: Joi.string().pattern(/^[0-9]{10,15}$/),
  // gender: Joi.string().valid('male', 'female', 'other'),
  // terms: Joi.boolean().valid(true).required(),
});

/**
 * ✅ Login validation
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

/**
 * ✅ Email validation (مثلاً نسيت كلمة السر)
 */
export const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});

/**
 * ✅ Password reset/change validation
 */
export const passwordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
});

/**
 * ✅ Profile update validation
 */
export const updateProfileSchema = Joi.object({
  name: Joi.string().min(3).max(30),
  username: Joi.string().alphanum().min(3).max(20),
  email: Joi.string().email(),
  password: Joi.string().min(6),
  age: Joi.number().integer().min(18).max(100),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/),
  gender: Joi.string().valid('male', 'female', 'other'),
});
