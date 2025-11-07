import ClinicTest from "./../../models/clinicTest.model.js";
import { sendTestToLab } from "../../api/labApi.js";

// Controller to handle sending a new test request to the external Laboratory API
export const sendTestToLabController = async (req, res) => {
  try {
    const { patientId, doctorId, testType } = req.body;

    const test = await ClinicTest.create({ patientId, doctorId, testType, status: "sent_to_lab" });

    const labResponse = await sendTestToLab({ patientId, doctorId, testType });

    return res.status(201).json({
      success: true,
      message: "Test sent to lab successfully",
      clinicTest: test,
      labResponse: labResponse
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Controller to handle receiving the test result back from the Laboratory system
export const receiveLabResult = async (req, res) => {
  try {
    const { patientId, doctorId, testType, result } = req.body;

    const test = await ClinicTest.findOneAndUpdate(
      { patientId, doctorId, testType },
      { result, status: "completed" },
      { new: true, upsert: true }
    );

    return res.json({ success: true, data: test });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Controller to retrieve and display all stored tests within the Clinic database
export const getClinicTests = async (req, res) => {
  try {
    const tests = await ClinicTest.find();
    return res.json({ success: true, data: tests });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};