import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://sapio.one/node/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config: any) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log request details
      const logData: any = {
        method: config.method?.toUpperCase(),
        url: config.baseURL + config.url,
        hasAuth: !!token
      };

      // Log payload for POST/PUT/PATCH requests
      if (['post', 'put', 'patch'].includes(config.method?.toLowerCase())) {
        logData.payload = config.data;
      }

      // Log query params for GET requests
      if (config.params) {
        logData.params = config.params;
      }

      console.log('🌐 API Request:', logData);
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

