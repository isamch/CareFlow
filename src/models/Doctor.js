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

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // doctor data
  specialization: {
    type: String,
    required: true
  },
  assignedNurse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Nurse'
  },
  workingHours: [workingHourSchema]
}, {
  toJSON: {
    transform: (doc, ret) => {
      if (ret._id) {
        ret.id = ret._id.toString()
      }
      delete ret._id
      delete ret.__v
      return ret
    }
  }
})

export default mongoose.model('Doctor', doctorSchema);