import express from 'express';
import { getPrescriptions } from '../../controllers/doctor/simplePharmacy.controller.js';

const router = express.Router();

// get prescription
router.get('/prescriptions', getPrescriptions);

export default router;
