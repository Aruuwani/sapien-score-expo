const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { getMyNotifications, createNotificationData, markAllAsRead } = require('../controllers/notification');

// GET /api/notifications
router.get('/', authMiddleware, getMyNotifications);
router.post('/', authMiddleware, createNotificationData);
router.put('/mark-all-read', authMiddleware, markAllAsRead);

module.exports = router;
