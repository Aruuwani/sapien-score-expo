const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * Authentication Routes
 * 
 * POST /api/auth/register - Register a new user
 * POST /api/auth/login - Login with email/phone and password
 * POST /api/auth/forgot-password - Request password reset (sends OTP to email)
 * POST /api/auth/verify-reset-code - Verify the OTP code
 * POST /api/auth/reset-password - Reset password with new password
 */

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Forgot password flow
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-code', authController.verifyResetCode);
router.post('/reset-password', authController.resetPassword);

module.exports = router;

