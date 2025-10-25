// controller to send prescription to pharmacy
import Prescription from '../../models/Prescription.js';
import { callPharmacyApi } from '../../utils/pharmacyApi.js';
import asyncHandler from '../../utils/asyncHandler.js';

// POST /api/prescriptions/send-to-pharmacy
export const sendPrescriptionToPharmacy = asyncHandler(async (req, res) => {
  const { prescriptionId } = req.body;
  const prescription = await Prescription.findById(prescriptionId)
    .populate('patient doctor');
  if (!prescription) {
    return res.status(404).json({ message: 'Prescription not found' });
  }

  // Prepare data for pharmacy
  const payload = {
    patientId: prescription.patient.id,
    patientName: prescription.patient.name,
    doctorName: prescription.doctor.name,
    medications: prescription.medications,
    notes: prescription.notes,
    prescriptionDate: prescription.createdAt
  };

  // Send to pharmacy
  const result = await callPharmacyApi('/prescriptions', 'POST', payload);
  res.json({ message: 'Prescription sent to pharmacy', result });
});
