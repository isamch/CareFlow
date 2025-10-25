// pharmacyApi.js
// Utility to call pharmacy API with API Token
import axios from 'axios';

const PHARMACY_API_URL = process.env.PHARMACY_API_URL || 'http://localhost:5001/api';
const PHARMACY_API_TOKEN = process.env.PHARMACY_API_TOKEN || '';

export async function callPharmacyApi(endpoint, method = 'GET', data = null) {
  try {
    const response = await axios({
      url: `${PHARMACY_API_URL}${endpoint}`,
      method,
      data,
      headers: {
        Authorization: `Bearer ${PHARMACY_API_TOKEN}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}
