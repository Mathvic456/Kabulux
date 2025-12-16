// apiService.ts
import { api } from './api'; // Your axios instance with interceptor

/**
 * Send ride booking/estimate request
 * @param bookingData - Pickup and dropoff coordinates
 * @returns Promise resolving with server response
 */
export const bookRide = async (bookingData: object): Promise<any> => {
  try {
    const response = await api.post('/rides/requests/estimate/', bookingData);
    return response.data;
  } catch (error: any) {
    console.error('❌ bookRide API Error:', error);

    if (error.response) {
      // Server responded with an error (4xx, 5xx)
      const status = error.response.status;
      const message = error.response.data?.message || `Server error: ${status}`;
      throw new Error(message);
    } else if (error.request) {
      // Request sent but no response
      throw new Error('Network error: Unable to reach server');
    } else {
      // Something else went wrong
      throw new Error(`Request failed: ${error.message}`);
    }
  }
};

/**
 * Optional: Get ride estimate separately
 * @param rideData - Pickup and dropoff coordinates
 */
export const getRideEstimate = async (rideData: object) => {
  try {
    const response = await api.post('/rides/requests/estimate/', rideData);
    return response.data;
  } catch (error: any) {
  if (error.response) {
    console.log("❌ Status:", error.response.status);
    console.log("❌ Headers:", error.response.headers);
    console.log("❌ Data:", error.response.data);
  } else {
    console.log("❌ Network / setup error:", error.message);
  }
  throw error;
}
};

/**
 * Send location for tracking/analytics
 * @param locationData - User's current location
 */
export const sendLocationData = async (locationData: object) => {
  try {
    const response = await api.post('/locations/update', locationData);
    return response.data;
  } catch (error) {
    console.warn('⚠️ Failed to send location data (non-blocking):', error);
    return null; // Fail silently so it doesn't block user flow
  }
};
