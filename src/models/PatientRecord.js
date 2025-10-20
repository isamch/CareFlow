import mongoose from 'mongoose'

const treatmentSchema = new mongoose.Schema(
  {
    name: String, dosage: String, duration: String
  }, { _id: false })

const visitSchema = new mongoose.Schema({
  visitId: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  date: { type: Date, default: Date.now },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  nurseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Nurse' },
  diagnosis: [String],
  symptoms: [String],
  treatments: [treatmentSchema],
  notes: String
}, { timestamps: true })



const patientRecordSchema = new mongoose.Schema({
  bloodType: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] 
  },
  dateOfBirth: { type: Date },
  address: { type: String },
  visits: [visitSchema]
}, {
  timestamps: { updatedAt: 'lastUpdated', createdAt: 'createdAt' },
  toJSON: {
    transform: (doc, ret) => { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; return ret }
  }
})

const PatientRecord = mongoose.model('PatientRecord', patientRecordSchema)
export default PatientRecord