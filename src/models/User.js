import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "doctor", "nurse", "secretary", "patient"],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    phone: String,
    address: String,
    avatar: String,
    createdAt: { type: Date, default: Date.now },



    // email verification fields 
    verified: { type: Boolean, default: false },
    verificationCode: { type: String, select: false },
    verificationCodeValidationTime: { type: Date, select: false },

    // password reset fields  
    resetPasswordCode: { type: String, select: false },
    resetPasswordCodeValidationTime: { type: Date, select: false },

  },
  { timestamps: true }
);


export default mongoose.model("User", userSchema);
