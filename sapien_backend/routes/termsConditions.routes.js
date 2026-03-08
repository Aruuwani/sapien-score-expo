const express = require('express');
const router = express.Router();
const termsController = require('../controllers/termsConditions.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

/**
 * Public Routes (no auth needed - users must be able to read T&C)
 */
router.get('/:type', termsController.getTermsConditions);

/**
 * Admin/Protected Routes (require authentication)
 */
router.post('/', authMiddleware, termsController.createOrUpdateTerms);
router.get('/all/:type', authMiddleware, termsController.getAllVersions);

module.exports = router;
