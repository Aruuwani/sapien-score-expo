const Chatroom = require('../models/chatroom.model');
const UserFavorite = require('../models/userfavorities.model');
const Report = require('../models/reportedContent.model');
const Message = require('../models/message.model');
const ObjectId = require('mongoose').Types.ObjectId;
exports.createChatroom = async (name, userId) => {
  // First count how many rooms this user has already created
  const roomCount = await Chatroom.countDocuments({ creatorId: userId });
  
  if (roomCount >= 3) {
    throw new Error('You can only create up to 3 EchoRooms'); // Throw error instead of returning
  }

  const room = new Chatroom({
    name,
    creatorId: userId,
    nameHistory: [{
      oldName: '',
      newName: name,
      changedAt: new Date(),
      changedBy: userId
    }]
  });
  
  return await room.save();
};

exports.UpdateChatroomName = async (roomId, newName, userId) => {
  const room = await Chatroom.findById({_id:roomId});
  if (!room) throw new Error('Room not found');
  
  room.nameHistory.push({
    oldName: room.name,
    newName,
    changedAt: new Date(),
    changedBy: userId
  });
  
  room.name = newName;
  room.updatedAt = new Date();
  return await room.save();
};

exports.favoriteChatroom = async (roomId, userId) => {
  const existing = await UserFavorite.findOne({ userId, roomId });
  if (existing) throw new Error('Already favorited');
  
  const favorite = new UserFavorite({ userId, roomId });
  await favorite.save();
  
  await Chatroom.findByIdAndUpdate(roomId, { $inc: { favoriteCount: 1 } });
  return favorite;
};

exports.DeleteFavoriteChatroom = async (roomId, userId) => {
  // 1. Validate if the room exists
  const room = await Chatroom.findById(roomId);
  if (!room) throw new Error('Chatroom not found');

  // 2. Check if the user exists (optional, if you have a User model)
  // const user = await User.findById(userId);
  // if (!user) throw new Error('User not found');

  // 3. Check if the favorite exists
  const favorite = await UserFavorite.findOne({ userId, roomId });
  if (!favorite) throw new Error('You have not favorited this room');

  // 4. Delete the favorite record
  await UserFavorite.deleteOne({ _id: favorite._id });

  // 5. Decrement favoriteCount in Chatroom (only if favoriteCount > 0)
  if (room.favoriteCount > 0) {
    await Chatroom.findByIdAndUpdate(roomId, { $inc: { favoriteCount: -1 } });
  }

  return favorite;
};

exports.reportContent = async (reporterId, roomId, messageId, reason) => {
  const report = new Report({
    reporterId,
    roomId,
    messageId,
    reason
  });
  
  await report.save();
  
  if (messageId) {
    await Message.findByIdAndUpdate(messageId, { isReported: true });
  } else if (roomId) {
    await Chatroom.findByIdAndUpdate(roomId, { $inc: { reportedCount: 1 } });
  }
  
  return report;
};

exports.getChatrooms = async () => {
  return await Chatroom.find({ isActive: true })
    .sort({ favoriteCount: -1, createdAt: -1 });
};
exports.getUserFavorites = async (userId) => {
  return await UserFavorite.find({ userId })
    .populate({
      path: 'roomId',
      select: 'name favoriteCount', // Include other fields you need
    })
    .lean()
    .exec();
};

exports.DeleteChatroom = async (roomId,userId) => {
  const chatroom = await Chatroom.findById({_id:roomId});
  if (!chatroom) {
    throw new Error('Chatroom not found');
  }

  console.log('chatroom', chatroom)
  if (!chatroom.creatorId.equals(userId)) {
    throw new Error('You are not the creator of this chatroom');
  }

  await Message.deleteMany({ roomId });
  await UserFavorite.deleteMany({ roomId });
  return await chatroom.deleteOne();
};
