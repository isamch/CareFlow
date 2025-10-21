import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false,
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['Patient', 'Doctor', 'Nurse', 'Secretary', 'Admin'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending_verification'],
    default: 'pending_verification'
  },

  // email verify and password reset
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,

}, {
  timestamps: true,
    toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString()
      delete ret._id
      delete ret.__v
      delete ret.password
      // remove sensitive fields
      delete ret.emailVerificationToken
      delete ret.emailVerificationExpires
      delete ret.passwordResetToken
      delete ret.passwordResetExpires
      return ret
    }
  }
})


export default mongoose.model('User', userSchema);