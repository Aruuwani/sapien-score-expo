const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportSchema = new Schema({
  reporterId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  roomId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Chatroom'
  },
 
  reason: { 
    type: String, 
    required: true,
    enum: ['Profanity', 'Abusive language', 'Hate speech', 'Explicit wording'],

  },
  
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'resolved'], 
    default: 'pending'
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    immutable: true
  },
  resolvedAt: { 
    type: Date 
  },
  resolvedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }
});


module.exports = mongoose.model('Report', ReportSchema);