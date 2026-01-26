const chatroomService = require('../services/chatroomService');
const { io } = require('../socket');

exports.createChatroom = async (req, res) => {
  const userId = req.userId;

  try {
    const { name } = req.body;
    
    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    const room = await chatroomService.createChatroom(name, userId);
    res.status(201).json(room);
  } catch (error) {
    // Handle specific error cases
    if (error.message === 'You can only create up to 3 EchoRooms') {
      return res.status(403).json({ error: error.message });
    }
    res.status(400).json({ error: error.message || 'Failed to create chatroom' });
  }
};

exports.updateChatroomName = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { newName } = req.body;
    const userId = req.userId
    // const io = req.app.get('io');
    const room = await chatroomService.UpdateChatroomName(roomId, newName, userId);
    
    // Notify all room members of name change
    // io.to(id).emit('roomNameChanged', {
    //   roomId: id,
    //   newName,
    //   changedBy: userId,
    //   timestamp: new Date()
    // });
    
    res.json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.favoriteChatroom = async (req, res) => {
  try {
    const { id } = req.params;
    const userId  = req.userId;
    const favorite = await chatroomService.favoriteChatroom(id, userId);
    res.status(201).json(favorite);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteFavoriteChatroom = async (req, res) => {
  try {
    const { id } = req.params;
    const userId  = req.userId;
    const favorite = await chatroomService.DeleteFavoriteChatroom(id, userId);
    res.status(200).json(favorite);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.reportContent = async (req, res) => {
  try {
    const { reporterId, roomId, messageId, reason } = req.body;

    const report = await chatroomService.reportContent(reporterId, roomId, messageId, reason);
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getChatrooms = async (req, res) => {
  try {

    const rooms = await chatroomService.getChatrooms();

    res.json(rooms);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.GetFavChatrooms = async (req, res) => {
  try {
    
     const userId  = req.userId;
    const rooms = await chatroomService.getUserFavorites(userId);

     res.status(200).json(rooms);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteChatroom = async (req, res) => {
  try {
    // console.log('Delete request received. Params:', req.params);
    const { roomId } = req.params;
    const userId = req.userId;
    
    console.log(`Attempting to delete room ${roomId} for user ${userId}`);
    
    await chatroomService.DeleteChatroom(roomId, userId);
    
    console.log('Deletion successful');
    res.status(200).json({ message: 'Chatroom deleted successfully.' });
  } catch (error) {
    console.error('Deletion failed:', error);
    res.status(400).json({ error: error.message });
  }
};
