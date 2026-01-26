const express = require('express');
const router = express.Router();
const chatroomController = require('../controllers/chatroom.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Chatroom routes
router.post('/rooms',authMiddleware, chatroomController.createChatroom);
router.patch('/rooms/:roomId',authMiddleware, chatroomController.updateChatroomName);
router.post('/rooms/:id/favorite',authMiddleware, chatroomController.favoriteChatroom);
router.delete('/rooms/:id/favorite',authMiddleware, chatroomController.deleteFavoriteChatroom);
router.delete('/rooms/:roomId',authMiddleware, chatroomController.deleteChatroom);
router.get('/rooms/favorite',authMiddleware, chatroomController.GetFavChatrooms);
router.get('/rooms', chatroomController.getChatrooms);

// Report routes
router.post('/report', chatroomController.reportContent);

module.exports = router;
