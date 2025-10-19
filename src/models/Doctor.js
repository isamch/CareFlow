import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  specialty: { type: String, required: true },
  nurse: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // يمكن تغييره
  availability: [
    {
      dayOfWeek: { type: String }, // e.g. Monday, Tuesday
      startTime: { type: String }, // "09:00"
      endTime: { type: String },   // "17:00"
    },
  ],
});

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
