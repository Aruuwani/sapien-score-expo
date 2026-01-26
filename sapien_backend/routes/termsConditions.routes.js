const express = require('express');
const router = express.Router();
const termsController = require('../controllers/termsConditions.controller');

/**
 * Public Routes
 */

// Get active Terms & Conditions or Privacy Policy
router.get('/:type', termsController.getTermsConditions);

/**
 * Admin Routes (Add authentication middleware when ready)
 */

// Create or update Terms & Conditions
router.post('/', termsController.createOrUpdateTerms);

// Get all versions
router.get('/all/:type', termsController.getAllVersions);

module.exports = router;

