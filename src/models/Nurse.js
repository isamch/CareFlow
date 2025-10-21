import mongoose from 'mongoose'

const workingHourSchema = new mongoose.Schema({
  dayOfWeek: {
    type: String,
    required: true,
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  timeSlots: [
    {
      startTime: { type: String, required: true }, // 09:00
      endTime: { type: String, required: true },   // 09:30
      isAvailable: { type: Boolean, default: true }
    }
  ]
}, { _id: false })


const nurseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // nurse data
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  shift: {
    type: String,
    enum: ['day', 'night', 'rotating']
  },
  workingHours: [workingHourSchema]
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

export default mongoose.model('Nurse', nurseSchema);