import express from "express";
import {
  sendTestToLabController,
  receiveLabResult,
  getClinicTests
} from "./../../controllers/doctor/clinic.controller.js";

const router = express.Router();

router.post("/send-test", sendTestToLabController);

router.post("/receive-result", receiveLabResult);

router.get("/", getClinicTests);


export default router;
