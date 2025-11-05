import User from "../models/User.js";
import Role from "../models/Role.js";


import connectDB from "../config/db.js";

import dotenv from 'dotenv'

import { hashPassword } from "../utils/hashing.js";

// Load env vars
dotenv.config()


connectDB();


const setAdmin = async () => {

  const adminInfo = {
    fullName: "admin",
    email: "admin123@gmail.com",
    password: hashPassword("admin123"),
    role: "690b55d0f3990422f769bde0",
    status: "active",
    isEmailVerified: "true",
    emailVerificationToken: "",
    emailVerificationExpires: ""
  }

  const role = await Role.findOne({ name: admin })



  const admin = new User(adminInfo);
  await admin.save();
  
}


setAdmin();
