const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authMiddleware } = require('../middlewares/authMiddleware');


router.post('/messages',authMiddleware, messageController.sendMessage);
router.get('/rooms/:roomId/messages', messageController.getMessages);
router.post('/messages/react',authMiddleware, messageController.reactToMessage);

module.exports = router;