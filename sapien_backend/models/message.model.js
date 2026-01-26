const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  roomId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Chatroom', 
    required: true,
    index: true 
  },
  senderId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  senderName: { 
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  content: { 
    type: String, 
    required: true,
    trim: true,
    
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours TTL
    index: { expires: 0 } // Document will be deleted when expiresAt is reached
  },
  isReply: { 
    type: Boolean, 
    default: false 
  },
  parentMessageId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Message' 
  },
  reactions: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    emoji: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  
  isReported: { 
    type: Boolean, 
    default: false 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },


});

// Indexes for better performance
MessageSchema.index({ roomId: 1, timestamp: 1 });
MessageSchema.index({ parentMessageId: 1 });

module.exports = mongoose.model('Message', MessageSchema);