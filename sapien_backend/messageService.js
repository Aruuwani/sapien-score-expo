const Message = require('../models/message.model');
const ChatRoom = require('../models/chatroom.model');
const ObjectId = require('mongoose').ObjectId;
exports.sendMessage = async (roomId, senderId, senderName, content, isReply = false, parentMessageId = null) => {
  const message = new Message({
    roomId,
    senderId,
    senderName,
    content,
    isReply,
    parentMessageId
  });

   // Save the message and update the chat room's message count in a transaction
  const savedMessage = await message.save();
  
  // Increment the messageCount in the ChatRoom model
  await ChatRoom.findByIdAndUpdate(
    {_id:roomId},
    { $inc: { messageCount: 1 } },
    { new: true } // This returns the updated document if needed
  );

  return savedMessage;
};

exports.getRoomMessages = async (roomId) => {
  return await Message.find({ roomId })
    .sort({ timestamp: 1 })
    .lean();
};

exports.addReaction = async (messageId, userId, emoji) => {
  const message = await Message.findById(messageId);
  if (!message) throw new Error('Message not found');

  // Check if this user already has this exact reaction
  const existingReactionIndex = message.reactions.findIndex(
    r => r.userId?.toString() === userId?.toString() && r.emoji === emoji
  );

  if (existingReactionIndex >= 0) {
    // Remove this specific reaction if it exists (toggle behavior)
    message.reactions.splice(existingReactionIndex, 1);
  } else {
    // Add new reaction
    message.reactions.push({
      userId,
      emoji,
      timestamp: new Date()
    });
  }

  return await message.save();
};

exports.deleteMessage = async (messageId) => {
  return await Message.findByIdAndDelete(messageId);
};