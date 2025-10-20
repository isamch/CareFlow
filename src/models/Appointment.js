import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient', required: true
  },
  doctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor', 
    required: true 
  },
  nurse: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Nurse' 
  },
  secretary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Secretary'
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  reason: String,
  notes: String
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

appointmentSchema.index({ doctor: 1, startTime: 1, endTime: 1 })
appointmentSchema.index({ patient: 1, startTime: 1, endTime: 1 })


export default mongoose.model('Appointment', appointmentSchema);