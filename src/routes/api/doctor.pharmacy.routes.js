import express from 'express';
import {
  searchMedicationsInPharmacy,
  sendPrescriptionToPharmacyController,
  getAvailableMedications
} from '../../controllers/doctor/simplePharmacy.controller.js';

const router = express.Router();

// Search medications in pharmacy
router.get('/medications/search', searchMedicationsInPharmacy);

// Get available medications
router.get('/medications/available', getAvailableMedications);

// Send prescription to pharmacy
router.post('/prescriptions/send-to-pharmacy', sendPrescriptionToPharmacyController);

export default router;
