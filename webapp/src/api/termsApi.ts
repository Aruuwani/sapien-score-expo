import apiClient from './apiClient';

/**
 * Get Terms & Conditions
 */
export const getTermsConditions = async () => {
  try {
    const response = await apiClient.get('/terms/terms');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching terms & conditions:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get Privacy Policy
 */
export const getPrivacyPolicy = async () => {
  try {
    const response = await apiClient.get('/terms/privacy');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching privacy policy:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get Terms or Privacy by type
 */
export const getTermsByType = async (type: 'terms' | 'privacy') => {
  try {
    const response = await apiClient.get(`/terms/${type}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching ${type}:`, error.response?.data || error.message);
    throw error;
  }
};

