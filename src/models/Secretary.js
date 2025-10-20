import mongoose from 'mongoose'

const secretarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  managingDoctors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }]
}, {
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString()
      delete ret._id
      delete ret.__v
      return ret
    }
  }
})

export default mongoose.model('Secretary', secretarySchema);