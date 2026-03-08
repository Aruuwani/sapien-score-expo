import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://sapio.one/node/api',
  // baseURL: 'http://192.168.1.43:5000/api',
  // baseURL: 'http://192.168.1.6:5000/node/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
  // Remove validateStatus - let axios handle errors normally
  // 2xx = success, 4xx/5xx = error (will be caught in catch block)
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config: any) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MTVkNWU4YjlmMzY1OWNlZGEyMTk0OCIsIndvcmtfZW1haWwiOiJhYnJhaGltLndlYnBhaW50QGdtYWlsLmNvbSIsImlhdCI6MTc0NjczNzA4MSwiZXhwIjoxNzQ2NzQwNjgxfQ.VsgUHsLTH7kR5cmy0v2YpIryrVDDiFG-xUAbgIfKyyw"
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log request details
      console.log('🌐 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.baseURL + config.url,
        hasAuth: !!token
      });
    } catch (error) {
      console.error('Error retrieving token', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - log responses and handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses (2xx status codes)
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      dataKeys: Object.keys(response.data || {})
    });
    return response;
  },
  (error) => {
    // Enhanced error logging for failed requests (4xx, 5xx, network errors, etc.)
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Request timeout:', {
        url: error.config?.url,
        timeout: error.config?.timeout
      });
    } else if (error.code === 'ERR_NETWORK') {
      console.error('❌ Network error:', {
        message: 'Cannot reach server',
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
    } else if (error.response) {
      // Server responded with error status (4xx, 5xx)
      console.error('❌ API Error Response:', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data
      });
    } else {
      console.error('❌ Unknown API error:', {
        message: error.message,
        code: error.code,
        url: error.config?.url
      });
    }
    return Promise.reject(error);
  }
);

export default apiClient;
