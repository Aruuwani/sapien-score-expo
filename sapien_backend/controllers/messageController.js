const messageService = require('../services/messageService');
const userService = require('../services/user.service');
const { getIo } = require('../socket');

exports.sendMessage = async (req, res) => {
  console.log('req.body', req.body)
  try {
    const userId = req.userId; // Assuming you have auth middleware
    console.log('req.user', userId)
    const { roomId, content, isReply, parentMessageId } = req.body;
    // Retrieve the username from the userId
    const user = await userService.findOne({ _id: userId });
    const username = user ? user.username : null;
    console.log('user', user)
    const message = await messageService.sendMessage(
      roomId,
      senderId = userId,
      senderName = username,
      content,
      isReply,
      parentMessageId
    );

    // Broadcast to room using Socket.io
    const io = getIo();
    if (io) {
      io.to(roomId).emit('newMessage', message);
      console.log(`Message broadcasted to room ${roomId}`);
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await messageService.getRoomMessages(roomId);
    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.reactToMessage = async (req, res) => {
  try {
    const { messageId, emoji } = req.body;
    const userId = req.userId;

    if (!messageId || !emoji) {
      return res.status(400).json({ error: 'messageId and emoji are required' });
    }

    const updatedMessage = await messageService.addReaction(messageId, userId, emoji);

    if (!updatedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Broadcast reaction update to room using Socket.io
    const io = getIo();
    if (io && updatedMessage.roomId) {
      io.to(updatedMessage.roomId.toString()).emit('messageReaction', {
        messageId,
        reactions: updatedMessage.reactions
      });
      console.log(`Reaction broadcasted to room ${updatedMessage.roomId}`);
    }

    res.json(updatedMessage);
  } catch (error) {
    console.log('Error reacting to message:', error);
    res.status(400).json({
      error: error.message || 'Failed to add reaction to message'
    });
  }
};