const relationService = require('../services/relationService');

const mongoose = require('mongoose');
exports.createRelation = async (req, res) => {
  try {
    const newRelation = await relationService.createRelation(req.body);
    res.status(201).json(newRelation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllRelations = async (req, res) => {
  try {
    const relations = await relationService.getAllRelations();
    console.log("relations", relations)
    res.status(200).json(relations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getRelationById = async (req, res) => {
  try {
    const relation = await relationService.getRelationById(req.params.id);
    if (!relation) return res.status(404).json({ error: 'Relation not found' });
    res.status(200).json(relation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRelation = async (req, res) => {
  try {
    const updated = await relationService.updateRelation(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Relation not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteRelation = async (req, res) => {
  try {
    const deleted = await relationService.deleteRelation(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Relation not found' });
    res.status(200).json({ message: 'Relation deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};