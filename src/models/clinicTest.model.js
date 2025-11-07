import mongoose from "mongoose";

const clinicTestSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  doctorId: { type: String, required: true },
  testType: { type: String, required: true },
  status: { type: String, default: "sent_to_lab" },
  result: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("ClinicTest", clinicTestSchema);
