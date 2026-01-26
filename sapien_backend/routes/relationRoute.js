const express = require('express');
const router = express.Router();
const relationController = require('../controllers/relationController');

router.post('/', relationController.createRelation);
router.get('/', relationController.getAllRelations);

router.get('/:id', relationController.getRelationById);
router.put('/:id', relationController.updateRelation);
router.delete('/:id', relationController.deleteRelation);

module.exports = router;