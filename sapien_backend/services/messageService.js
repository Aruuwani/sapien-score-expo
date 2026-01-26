

const Message = require('../models/message.model');
const ChatRoom = require('../models/chatroom.model');
const ObjectId = require('mongoose').ObjectId;
exports.sendMessage = async (roomId, senderId, senderName, content, isReply , parentMessageId ) => {
  const message = new Message({
    roomId,
    senderId,
    senderName,
    content,
    isReply,
    parentMessageId,
   
  });
console.log('isReply', isReply)
console.log('parentMessageId', parentMessageId)
  // If this is a reply, update the parent message's updatedAt timestamp
  if (isReply && parentMessageId) {
    await Message.findByIdAndUpdate(
      parentMessageId,
      { $set: { updatedAt: new Date() } },
      { new: true }
    );
  }

  // Save the message and update the chat room's message count in a transaction
  const savedMessage = await message.save();

  // Increment the messageCount in the ChatRoom model
  await ChatRoom.findByIdAndUpdate(
    { _id: roomId },
    { $inc: { messageCount: 1 } },
    { new: true } // This returns the updated document if needed
  );

  return savedMessage;
};
// exports.sendMessage = async (roomId, senderId, senderName, content, isReply = false, parentMessageId = null) => {
//   const message = new Message({
//     roomId,
//     senderId,
//     senderName,
//     content,
//     isReply,
//     parentMessageId,
//     createdAt: new Date() // Ensure timestamp is set
//   });

//   // Save the message and update the chat room's message count in a transaction
//   const savedMessage = await message.save();

//   // If this is a reply, update the parent message's repliedAt timestamp
//   if (isReply && parentMessageId) {
//     await Message.findByIdAndUpdate(
//       parentMessageId,
//       { $set: { repliedAt: new Date() } },
//       { new: true }
//     );
//   }

//   // Increment the messageCount in the ChatRoom model
//   await ChatRoom.findByIdAndUpdate(
//     { _id: roomId },
//     { $inc: { messageCount: 1 } },
//     { new: true }
//   );

//   return savedMessage;
// };

// exports.getRoomMessages = async (roomId) => {
//   return await Message.find({ roomId })
//     .sort({ timestamp: 1 })
//     .lean();
// };

exports.getRoomMessages = async (roomId) => {
  // First get all messages for the room
  const messages = await Message.find({ roomId })
    .sort({ updatedAt: 1 })
    .lean();

  // Update the messageCount in ChatRoom to match the actual message count
  await ChatRoom.findByIdAndUpdate(
    { _id: roomId },
    { $set: { messageCount: messages.length } }, // Use $set instead of $inc to set exact value
    { new: true }
  );

  return messages;
};

// In your message service file
// exports.getRoomMessages = async (roomId) => {
//   // Get all messages for the room sorted by timestamp (ascending for proper threading)
//   const allMessages = await Message.find({ roomId })
//     .sort({ timestamp: 1 })
//     .lean();

//   // Separate parent messages and replies
//   const parentMessages = [];
//   const replies = [];
  
//   allMessages.forEach(message => {
//     if (message.isReply && message.parentMessageId) {
//       replies.push(message);
//     } else {
//       parentMessages.push(message);
//     }
//   });

//   // Group replies with their parent messages
//   const messagesWithReplies = parentMessages.map(parent => {
//     const messageReplies = replies
//       .filter(reply => reply.parentMessageId.toString() === parent._id.toString())
//       .sort((a, b) => a.timestamp - b.timestamp); // Sort replies chronologically
    
//     return {
//       ...parent,
//       replies: messageReplies
//     };
//   });

//   // Sort parent messages by timestamp (newest first)
//   messagesWithReplies.sort((a, b) => b.timestamp - a.timestamp);

//   // Update the messageCount in ChatRoom to match the actual message count
//   await ChatRoom.findByIdAndUpdate(
//     { _id: roomId },
//     { $set: { messageCount: allMessages.length } },
//     { new: true }
//   );

//   return messagesWithReplies;
// };

exports.addReaction = async (messageId, userId, emoji) => {
  const message = await Message.findById(messageId);
  if (!message) throw new Error('Message not found');

  // First check for existing reaction from this user
  const userReactionIndex = message.reactions.findIndex(
    r => r.userId?.toString() === userId?.toString() && r.emoji === emoji
  );

  if (userReactionIndex >= 0) {
    // Remove only this user's specific reaction
    message.reactions.splice(userReactionIndex, 1);
  } else {
    // For legacy reactions (no userId), convert them to the new user's reaction
    const legacyReactionIndex = message.reactions.findIndex(
      r => !r.userId && r.emoji === emoji
    );

    if (legacyReactionIndex >= 0) {
      // Update the legacy reaction to include userId
      message.reactions[legacyReactionIndex].userId = userId;
      message.reactions[legacyReactionIndex].timestamp = new Date();
    } else {
      // Add completely new reaction
      message.reactions.push({
        userId,
        emoji,
        timestamp: new Date()
      });
    }
  }

  return await message.save();
};
// exports.addReaction = async (messageId, userId, emoji) => {
//   const message = await Message.findById(messageId);
//   if (!message) throw new Error('Message not found');

//   // Check if this user already has this exact reaction
//   const existingReactionIndex = message.reactions.findIndex(
//     r => r.userId?.toString() === userId?.toString() && r.emoji === emoji
//   );

//   if (existingReactionIndex >= 0) {
//     // Remove this specific reaction if it exists (toggle behavior)
//     message.reactions.splice(existingReactionIndex, 1);
//   } else {
//     // Add new reaction
//     message.reactions.push({
//       userId: userId,
//       emoji: emoji,
//       timestamp: new Date()
//     });
//   }

//   return await message.save();
// };

exports.deleteMessage = async (messageId) => {
  return await Message.findByIdAndDelete(messageId);
};
