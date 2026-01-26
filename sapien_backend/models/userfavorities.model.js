const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserFavoriteSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  roomId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Chatroom',
    required: true,
    index: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    immutable: true
  }
}, {
  // Ensure a user can only favorite a room once
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to enforce uniqueness
UserFavoriteSchema.index({ userId: 1, roomId: 1 }, { unique: true });

module.exports = mongoose.model('UserFavorite', UserFavoriteSchema);