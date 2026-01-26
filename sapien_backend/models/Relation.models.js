const mongoose = require('mongoose');

const TraitSchema = new mongoose.Schema({
  subTopic: { type: String, required: true },
  trait: { type: String, required: true },
});

const TopicSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  traits: [TraitSchema]
});

const RelationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., 'colleague', 'friend'
  topics: [TopicSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Relation', RelationSchema);