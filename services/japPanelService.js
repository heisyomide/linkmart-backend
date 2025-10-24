// services/jpa-service.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const JAP_API_URL = process.env.JAP_API_URL;
const JAP_API_KEY = process.env.JAP_API_KEY;

if (!JAP_API_URL || !JAP_API_KEY) {
  console.error("❌ Missing JAP API credentials in .env file");
}

/**
 * 🔹 Fetch all available services from JPA
 */
export async function fetchJPAservices() {
  try {
    const { data } = await axios.post(JAP_API_URL, {
      key: JAP_API_KEY,
      action: "services",
    });
    return data;
  } catch (error) {
    console.error("❌ Error fetching JAP services:", error.message);
    throw error;
  }
}

/**
 * 🔹 Create a new order (for automatic boosts like TikTok)
 */
export async function createJPAorder(service, link, quantity) {
  try {
    const { data } = await axios.post(JAP_API_URL, {
      key: JAP_API_KEY,
      action: "add",
      service,
      link,
      quantity,
    });
    return data;
  } catch (error) {
    console.error("❌ Error creating JAP order:", error.message);
    throw error;
  }
}

/**
 * 🔹 Check order status
 */
export async function checkJPAorderStatus(orderId) {
  try {
    const { data } = await axios.post(JAP_API_URL, {
      key: JAP_API_KEY,
      action: "status",
      order: orderId,
    });
    return data;
  } catch (error) {
    console.error("❌ Error checking JAP order status:", error.message);
    throw error;
  }
}