// utils/notification.js
const Notification = require('../models/Notification');


const createNotification = async ({ userId, createdBy, message, type = 'general' }) => {
  const notification = new Notification({
    user_id: userId,
    created_by: createdBy,
    message,
    type,
    is_read: false,
    created_at: new Date(),
  });
  await notification.save();
  return notification;
};


const getNotificationsForUser = async (userId) => {
  return await Notification.find({ user_id: userId })
    .sort({ created_at: -1 })
    .populate('created_by', 'name email') 
    .lean();
};



const createNotificationData = async (req, res) => {
    try {
      const { userId, message, type } = req.body;
      const createdBy = req.userId; 
  
      if (!userId || !message) {
        return res.status(400).json({ error: 'userId and message are required.' });
      }
  
      const notification = await createNotification({
        userId,
        createdBy,
        message,
        type: type || 'general',
      });
  
      res.status(201).json({ message: 'Notification created successfully.', data: notification });
    } catch (err) {
      console.error('Error creating notification:', err.message);
      res.status(500).json({ error: 'Internal server error.' });
    }
  };



const getMyNotifications = async (req, res) => {
    try {
      const userId = req.userId;
      const notifications = await getNotificationsForUser(userId);
      res.status(200).json({ data: notifications });
    } catch (err) {
      console.error('Error fetching notifications:', err.message);
      res.status(500).json({ error: 'Internal server error.' });
    }
};
  


// controllers/notificationController.js
const markAllAsRead = async (req, res) => {
    try {
      const userId = req.userId; // ✅ Using req.userId from auth middleware
  
      const result = await Notification.updateMany(
        { user_id: userId, is_read: false },
        { $set: { is_read: true } }
      );
  
      res.status(200).json({
        message: 'All notifications marked as read',
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error('Error updating notifications:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

module.exports = {
  createNotification,
    getNotificationsForUser,
    getMyNotifications,
    createNotificationData,
    markAllAsRead
};
