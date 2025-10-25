import express from 'express';
import { sendPrescriptionToPharmacy } from '../../controllers/doctor/prescription.controller.js';
const router = express.Router();

// إرسال وصفة طبية إلى الصيدلية
// POST /api/doctor/prescriptions/send-to-pharmacy
router.post('/prescriptions/send-to-pharmacy', sendPrescriptionToPharmacy);

export default router;
