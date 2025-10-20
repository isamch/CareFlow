import mongoose from 'mongoose'

const logSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  role: String,
  action: {
    type: String,
    required: true
  },
  target: {
    type: { type: String },
    id: { type: String }
  },
  description: String
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret
    }
  }
})

logSchema.index({ action: 1, createdAt: -1 })
logSchema.index({ user: 1, createdAt: -1 })

export default mongoose.model('Log', logSchema);