import apiClient from "./apiClient";
export const SendMessage = async (roomId: string, content: string, isReply?: boolean, parentMessageId?: string) => {
    const response = await apiClient.post('/messages/messages', { roomId: roomId, content: content, isReply: isReply, parentMessageId: parentMessageId });
    return response.data;
};

export const GetMessages = async (roomId: string) => {
    const response = await apiClient.get(`/messages/rooms/${roomId}/messages`);
    console.log('response', response)
    return response.data;
};
export const ReactMessages = async (messageId: string, emoji: string) => {
    const response = await apiClient.post('/messages/messages/react', { messageId: messageId, emoji: emoji })

    return response.data;
};

