import axios from 'axios';
import apiClient from './apiClient';

export const sendEmailOTP = async (work_email: string) => {
  console.log('work_email', work_email)
  try {
    console.log('apiClient', apiClient)
    const response = await apiClient.post('otp/send-email-otp', { work_email });
    return response.data;
  } catch (error: any) {
    console.log('error', error)
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      console.log('error', error);
    } else {
      console.log('error', error);
    }
    throw error.response?.data || { error: 'Something went wrong' };
  }
};

export const verifyEmailOTP = async (work_email: string,otp:string) => {
  try {
      const response = await apiClient.post('otp/verify-email-otp', { work_email, otp });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      console.log('error', 'Network Error');
    } else {
      console.log('error', error);
    }
    throw error.response?.data || { error: 'Something went wrong' };
  }
};


export const SendPhoneOTP = async (phone_number: string) => {
  console.log('phone_number', phone_number)
  try {
    const response = await apiClient.post('otp/send-phone-otp', { phone_number });
    console.log('response', response)
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      console.log('error', 'Network Error');
    } else {
      console.log('error', error);
    }
    throw error.response?.data || { error: 'Something went wrong' };
  }
};

export const verifyPhoneOTP = async (phone_number: string, otp: string) => {
  console.log('phone_number', phone_number)
  try {
    const response = await apiClient.post('otp/verify-phone-otp', { phone_number, otp });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      console.log('error', 'Network Error');
    } else {
      console.log('error', error);
    }
    throw error.response?.data || { error: 'Something went wrong' };
  }
};

// Password-based authentication
export const loginWithPassword = async (identifier: string, password: string) => {
  console.log('📡 loginWithPassword called');
  console.log('   identifier:', identifier);
  console.log('   password length:', password?.length);

  try {
    const response = await apiClient.post('auth/login', { identifier, password });
    console.log('✅ Login API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.log('❌ Login API error:', error);
    console.log('   error.code:', error.code);
    console.log('   error.response:', error.response);
    console.log('   error.response?.data:', error.response?.data);
    console.log('   error.response?.status:', error.response?.status);
    console.log('   error.message:', error.message);

    // Handle different error types
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        console.log('⏱️ Request timeout');
        throw { error: 'Request timeout. Please check your internet connection and try again.' };
      } else if (error.code === 'ERR_NETWORK') {
        console.log('🌐 Network error');
        throw { error: 'Cannot reach server. Please check your internet connection.' };
      } else if (error.response) {
        // Server responded with error
        console.log('📥 Server error response:', error.response.data);
        throw error.response.data || { error: 'Login failed. Please try again.' };
      } else {
        // Request was made but no response
        console.log('📤 No response from server');
        throw { error: 'No response from server. Please try again.' };
      }
    } else {
      console.log('❓ Unknown error type');
      throw { error: error.message || 'Something went wrong' };
    }
  }
};

export const signupWithPassword = async (phone_number: string, email: string, password: string, agreedTerms: boolean = true) => {
  try {
    const response = await apiClient.post('auth/register', { phone_number, email, password, agreedTerms });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      console.log('error', 'Network Error');
    } else {
      console.log('error', error);
    }
    throw error.response?.data || { error: 'Something went wrong' };
  }
};

// Password reset flow
export const sendPasswordResetEmail = async (email: string) => {
  try {
    const response = await apiClient.post('auth/forgot-password', { email });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      console.log('error', 'Network Error');
    } else {
      console.log('error', error);
    }
    throw error.response?.data || { error: 'Something went wrong' };
  }
};

export const verifyPasswordResetCode = async (email: string, otp: string) => {
  try {
    const response = await apiClient.post('auth/verify-reset-code', { email, otp });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      console.log('error', 'Network Error');
    } else {
      console.log('error', error);
    }
    throw error.response?.data || { error: 'Something went wrong' };
  }
};

export const resetPassword = async (email: string, newPassword: string) => {
  try {
    const response = await apiClient.post('auth/reset-password', { email, newPassword });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      console.log('error', 'Network Error');
    } else {
      console.log('error', error);
    }
    throw error.response?.data || { error: 'Something went wrong' };
  }
};
