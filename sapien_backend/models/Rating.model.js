const mongoose = require('mongoose');

const traitSchema = new mongoose.Schema({
  trait: { type: String, required: true },        // e.g., "Self-Belief"

    score: { type: Number, min: 0, max: 10 }
 
}, { _id: false });

const categorySchema = new mongoose.Schema({
  topic: { type: String, required: true },         // e.g., "Awareness & Emotional Intelligence"
    traits: [traitSchema],
   comment: { type: String } ,                         // List of traits
}, { _id: false });

const ratingSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender_relation: {
  type: String,
    required: true
  },
  rating_data: {
    type: [categorySchema],                     
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'blocked', 'reported'],
    default: 'pending'
    },

  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});
ratingSchema.index(
  { 
    sender_id: 1, 
    receiver_id: 1, 
    sender_relation: 1 
  }, 
  { 
    unique: true,
    partialFilterExpression: { 
      status: { $in: ['pending', 'approved'] } 
    }
  }
);
ratingSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
