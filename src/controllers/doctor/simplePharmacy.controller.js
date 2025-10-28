// Simple doctor controller for pharmacy integration
import { searchMedications, sendPrescriptionToPharmacy } from '../../utils/simplePharmacyApi.js';
import asyncHandler from '../../utils/asyncHandler.js';

/**
 * Search medications in pharmacy
 * GET /api/doctor/medications/search
 */
export const searchMedicationsInPharmacy = asyncHandler(async (req, res) => {
  const { search } = req.query;
  
  try {
    const medications = await searchMedications(search);
    res.json({
      success: true,
      message: 'Search completed successfully',
      data: medications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Send prescription to pharmacy
 * POST /api/doctor/prescriptions/send-to-pharmacy
 */
export const sendPrescriptionToPharmacyController = asyncHandler(async (req, res) => {
  const {
    patientName,
    patientAge,
    patientPhone,
    doctorName,
    clinicName,
    clinicCode,
    medications,
    prescriptionNotes
  } = req.body;

  // Validate required fields
  if (!patientName || !doctorName || !clinicCode || !medications || !Array.isArray(medications)) {
    return res.status(400).json({
      success: false,
      message: 'Patient name, doctor name, clinic code and medications are required'
    });
  }

  // Validate medications
  for (const med of medications) {
    if (!med.medicationName || !med.quantity || !med.dosage) {
      return res.status(400).json({
        success: false,
        message: 'Each medication must have name, quantity and dosage'
      });
    }
  }

  try {
    const prescriptionData = {
      patientName,
      patientAge,
      patientPhone,
      doctorName,
      clinicName,
      clinicCode,
      medications,
      prescriptionNotes
    };

    const result = await sendPrescriptionToPharmacy(prescriptionData);
    
    res.json({
      success: true,
      message: 'Prescription sent to pharmacy successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get available medications
 * GET /api/doctor/medications/available
 */
export const getAvailableMedications = asyncHandler(async (req, res) => {
  try {
    const medications = await searchMedications();
    res.json({
      success: true,
      message: 'Available medications retrieved successfully',
      data: medications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});