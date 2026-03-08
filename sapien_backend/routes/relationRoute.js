const express = require('express');
const router = express.Router();
const relationController = require('../controllers/relationController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// All relation routes now require authentication
router.post('/', authMiddleware, relationController.createRelation);
router.get('/', authMiddleware, relationController.getAllRelations);
router.get('/:id', authMiddleware, relationController.getRelationById);
router.put('/:id', authMiddleware, relationController.updateRelation);
router.delete('/:id', authMiddleware, relationController.deleteRelation);

module.exports = router;