import apiClient from "./apiClient";


export const getNotifications = async () => {
    const response = await apiClient.get('/notifications');
    return response.data?.data;
};
  

export const markAllNotificationsAsRead = async () => {
    const response = await apiClient.put('/notifications/mark-all-read');
    return response.data;
  };
export const savePushToken = async (emailOrPhone: string | undefined, token: string | undefined) => {
    const response = await apiClient.post('/notifications/save-push-token', { emailOrPhone, token });
    return response.data;
};


