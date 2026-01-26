import apiClient from "./apiClient";


// export const getChatrooms = async () => {
//     const response = await apiClient.get('/rooms');
//     return response.data?.data;
// };

export const createChatrooms = async (roomName: string) => {
    const response = await apiClient.post('/chatroom/rooms',{name:roomName});

    return response.data;
};
  
export const getChatrooms = async () => {
    const response = await apiClient.get('/chatroom/rooms');
    return response.data;
};
  
export const makeFavChatrooms = async (roomId: string) => {
    const response = await apiClient.post(`/chatroom/rooms/${roomId}/favorite`);
    return response.data;
};
export const deleteFavChatrooms = async (roomId: string) => {
    const response = await apiClient.delete(`/chatroom/rooms/${roomId}/favorite`);
    return response.data;
};
export const getFavChatrooms = async () => {
    const response = await apiClient.get('/chatroom/rooms/favorite');

    return response.data;
};
  export const deleteChatrooms = async (roomId: string) => {
 
    const response = await apiClient.delete(`/chatroom/rooms/${roomId}`);

    return response.data;
};
  export const UpdateChatroomsName = async (roomId: string,newName:string) => {
    
    const response = await apiClient.patch(`/chatroom/rooms/${roomId}`,{newName: newName });
    console.log('response', response)
    return response.data;
};



