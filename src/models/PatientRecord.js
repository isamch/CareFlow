import mongoose from "mongoose";


const patientRecordSchema = new mongoose.Schema({
  // add your fields here


}, { timestamps: true });


export default mongoose.model("patientRecord", patientRecordSchema);
