import apiClient from './apiClient';

export const getUserProfile = async () => {
  const response = await apiClient.get(`/users/user`);
  return response.data;
};
export const getUserNames = async () => {
  const response = await apiClient.get(`/users/usernames`);
  return response.data.usernames;
};
export const getUserByEmailPhone = async (data: { work_email?: string, phone_number?: string }) => {
  try {
    const response = await apiClient.get('/users/userbyemailorphone', {
      params: data  // Use params for GET requests
    });
    
    return response.data;
  } catch (error) {
    console.log('Error in getUserByEmailPhone:', error);
    return error;
  }
};

export const updateUserProfile = async (data: any) => {
  const response = await apiClient.put(`/users/user`, data);

  return response.data;
};


export const UploadFile = async (data: any) => {
  const formData = new FormData();

  formData.append('file', {
    uri: data.uri,
    name: data.fileName || 'upload.jpg',  // Provide a fallback
    type: data.mimeType || 'image/jpeg',
  } as any);
  const response = await apiClient.post(`/upload/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.location
}