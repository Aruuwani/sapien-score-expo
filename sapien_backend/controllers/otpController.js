// DEPRECATED FILE: OTP-based authentication has been replaced with password-based authentication
// These endpoints are kept for backward compatibility but return deprecation errors
// New authentication endpoints are in auth.controller.js

// Twilio and AWS disabled - OTP authentication replaced with password-based auth
// const { sendOtpToEmail, verifyOtp } = require('../services/otpService');
// const userService = require('../services/user.service');
// const jwt = require('jsonwebtoken');
// const AWS = require('aws-sdk');
// AWS.config.update({ region: 'us-east-1' });
// const twilio = require('twilio');
// const twilioClient = twilio(
//     process.env.TWILIO_ACCOUNT_SID,
//     process.env.TWILIO_AUTH_TOKEN
// );
// const phoneOtpStore = new Map();
// DEPRECATED: Email OTP login is replaced with password-based authentication
// This endpoint is kept for backward compatibility but should not be used
const sendEmailOtp = async (req, res) => {
    const { work_email } = req.body;
    if (!work_email) return res.status(400).json({ error: 'Email is required' });

    try {
        return res.status(410).json({
            error: 'This login method is deprecated. Please use the new login endpoint with email/phone and password.'
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};



// DEPRECATED: Email OTP verification is replaced with password-based authentication
const verifyEmailOtp = async (req, res) => {
    try {
        return res.status(410).json({
            error: 'This login method is deprecated. Please use the new login endpoint with email/phone and password.'
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// DEPRECATED: Phone OTP login is replaced with password-based authentication
const sendPhoneOtp = async (req, res) => {
    try {
        return res.status(410).json({
            error: 'This login method is deprecated. Please use the new login endpoint with email/phone and password.'
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
// DEPRECATED: Phone OTP verification is replaced with password-based authentication
const verifyPhoneOtp = async (req, res) => {
    try {
        return res.status(410).json({
            error: 'This login method is deprecated. Please use the new login endpoint with email/phone and password.'
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { sendEmailOtp, verifyEmailOtp, sendPhoneOtp, verifyPhoneOtp };
