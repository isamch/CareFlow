import mongoose from "mongoose";


const AppointmentSchema = new mongoose.Schema({
  // add your fields here


}, { timestamps: true });


export default mongoose.model("Appointment", AppointmentSchema);
