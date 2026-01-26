// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },       // receiver
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },   // sender
  message: { type: String, required: true },
  type: { type: String, default: 'rating' },
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);
