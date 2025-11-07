import mongoose from "mongoose";
import ClinicTest from "./../models/clinicTest.model.js"; 


const MONGO_URI = "mongodb://isam:isam2003@localhost:27017/ehr?authSource=admin";

const seedClinicTests = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to Clinic DB");

    await ClinicTest.deleteMany();

    const clinicTests = [
      {
        patientId: "690b6ec0bf0049ae908610a3",
        doctorId: "690b6ebbbf0049ae90861074",
        testType: "Blood Test",
        status: "sent_to_lab"
      },
      {
        patientId: "690b6ec0bf0049ae908610a3",
        doctorId: "690b6ebbbf0049ae90861074",
        testType: "Urine Test",
        status: "sent_to_lab"
      },
      {
        patientId: "690b6ec0bf0049ae908610a3",
        doctorId: "690b6ebbbf0049ae90861074",
        testType: "Glucose Test",
        status: "sent_to_lab"
      }
    ];

    await ClinicTest.insertMany(clinicTests);
    console.log("✅ Seed data for Clinic created!");

    process.exit();
  } catch (err) {
    console.error("❌ Error seeding Clinic:", err.message);
    process.exit(1);
  }
};

seedClinicTests();
