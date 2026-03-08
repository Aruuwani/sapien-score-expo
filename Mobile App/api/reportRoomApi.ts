import apiClient from './apiClient';

export const ReportRoom = async (reason:string, roomId:string) => {
  const response = await apiClient.post('/reports',{reason:reason, roomId:roomId});

  return response.data;
};
// export const getRelationsById = async (id:any) => {
//   const response = await apiClient.get(`/relations/${id}`);
//   return response.data;
// };

// export const updateUserProfile = async (data: any) => {
//   const response = await apiClient.put(`/users/user`, data);

//   return response.data;
// };  