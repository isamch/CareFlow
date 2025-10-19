import mongoose from "mongoose";


const PatientSchema = new mongoose.Schema({

  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  insuranceNumber: String,
  emergencyContact: {
    name: String,
    phone: String,
    relation: String,
  },
  allergies: [String],
  medicalHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "MedicalHistory" }],
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  consent: { type: Boolean, default: true },
}, { timestamps: true });


export default mongoose.model("Patient", PatientSchema);
