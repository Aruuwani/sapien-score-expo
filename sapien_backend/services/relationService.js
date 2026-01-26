const Relation = require('../models/Relation.models');

exports.createRelation = async (data) => {
  const relation = new Relation(data);
  return await relation.save();
};

exports.getAllRelations = async () => {
  return await Relation.find();
};

exports.getRelationById = async (id) => {
  return await Relation.findById(id);
};

exports.updateRelation = async (id, data) => {
  return await Relation.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

exports.deleteRelation = async (id) => {
  return await Relation.findByIdAndDelete(id);
};