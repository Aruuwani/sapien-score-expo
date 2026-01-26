const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatroomSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  creatorId: { 
    type: Schema.Types.ObjectId, 
    required: true,
    ref: 'User'
  },
  isAnonymous: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    immutable: true
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  nameHistory: [{
    oldName: { type: String },
    newName: { type: String },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  }],
  favoriteCount: { 
    type: Number, 
    default: 0,
    min: 0
  },

  reportedCount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  messageCount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
});

// Update the updatedAt field before saving
ChatroomSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Chatroom', ChatroomSchema);