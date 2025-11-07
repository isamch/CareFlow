import axios from "axios";

const LAB_URL = "http://localhost:5002/api/laboratory";

export const sendTestToLab = async (data) => {
  try {
    const response = await axios.post(LAB_URL, data);
    return response.data;
  } catch (err) {
    console.error("❌ Error sending test to lab:", err.message);
    throw err;
  }
};
