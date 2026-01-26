import apiClient from './apiClient';

export const getAllRelations = async () => {
  const response = await apiClient.get(`/relations`);

  return response.data;
};
export const getRelationsById = async (id:any) => {
  try {
    console.log('📡 getRelationsById API call');
    console.log('   Relation ID:', id);
    console.log('   URL:', `/relations/${id}`);

    const response = await apiClient.get(`/relations/${id}`);

    console.log('✅ getRelationsById API response:');
    console.log('   Status:', response.status);
    console.log('   Data:', response.data);
    console.log('   Data type:', typeof response.data);

    return response.data;
  } catch (error: any) {
    console.error('❌ getRelationsById API error:', error);
    console.error('   Error message:', error?.message);
    console.error('   Error response:', error?.response?.data);
    console.error('   Error status:', error?.response?.status);
    throw error;
  }
};

export const updateUserProfile = async (data: any) => {
  const response = await apiClient.put(`/users/user`, data);

  return response.data;
};  