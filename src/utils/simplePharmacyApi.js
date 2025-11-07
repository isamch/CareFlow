// Simple pharmacy API utility for MVP
import axios from 'axios';

const PHARMACY_API_URL = process.env.PHARMACY_API_URL || 'http://localhost:5001/api';

/**
 * Search for medications in pharmacy
 */
export async function searchMedications(searchTerm = '') {
  try {
    const response = await axios.get(`${PHARMACY_API_URL}/medications`);
    return response.data;
  } catch (error) {
    console.error('Error searching medications:', error.message);
    throw new Error('Failed to search medications');
  }
}

/**
 * Send prescription to pharmacy
 */
export async function sendPrescriptionToPharmacy(prescriptionData) {
  try {
    const response = await axios.post(`${PHARMACY_API_URL}/prescriptions`, prescriptionData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Pharmacy service error');
    }

    console.error('Error sending prescription:', error.message);
    throw new Error('Failed to send prescription to pharmacy');
  }
}

/**
 * Get prescription status from pharmacy
 */
export async function getPrescriptionStatus(prescriptionId) {
  try {
    const response = await axios.get(`${PHARMACY_API_URL}/prescriptions/${prescriptionId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting prescription status:', error.message);
    throw new Error('Failed to get prescription status');
  }
}