// apiService.js
import { api } from './api'; // Import your existing axios instance

/**
 * Sends ride booking data to the backend using the existing axios configuration
 * @param {Object} bookingData - Contains pickup and destination information
 * @returns {Promise} - Promise that resolves with the server response
 */
export const bookRide = async (bookingData: object): Promise<any> => {
  try {
    // Use the existing api instance which already has token interception
    const response = await api.post('rides/requests/estimate', bookingData);
    
    // No need to manually set headers - the interceptor already handles tokens
    return response.data;
  } catch (error) {
    console.error('Error booking ride:', error);
    
    // Enhanced error handling using axios error structure
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const err = error as { response: { data: { message?: string }, status: number } };
      // Server responded with error status (4xx, 5xx)
      throw new Error(err.response.data.message || `Server error: ${err.response.status}`);
    } else if (typeof error === 'object' && error !== null && 'request' in error) {
      // Request made but no response received
      throw new Error('Network error: Unable to connect to server');
    } else {
      // Something else happened
      throw new Error('Request failed: ' + (error as Error).message);
    }
  }
};

/**
 * Send location data for tracking or analytics
 * @param {Object} locationData - User's current location data
 */
export const sendLocationData = async (locationData: object) => {
  try {
    const response = await api.post('/locations/update', locationData);
    return response.data;
  } catch (error) {
    console.error('Error sending location data:', error);
    // Fail silently for analytics to avoid disrupting user flow
    return null;
  }
};

/**
 * Optional: Get ride estimates from backend
 * @param {Object} rideData - Pickup and destination data for estimation
 */
export const getRideEstimate = async (rideData: object) => {
  try {
    const response = await api.post('/rides/estimate', rideData);
    return response.data;
  } catch (error) {
    console.error('Error getting ride estimate:', error);
    throw error;
  }
};