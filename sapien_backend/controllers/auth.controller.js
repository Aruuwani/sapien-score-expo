const authService = require('../services/auth.service');
const { sendOtpToEmail, verifyOtp } = require('../services/otpService');
const nodemailer = require('nodemailer');

// Configure nodemailer for sending emails
const transporter = nodemailer.createTransport({
    pool: true,
    maxConnections: 5,
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Register a new user
 * POST /api/auth/register
 * Body: { phone_number, email, password, agreedTerms, workEmail }
 */
exports.register = async (req, res) => {
    try {
        const { phone_number, email, password, agreedTerms, workEmail } = req.body;

        const result = await authService.register({
            phone_number,
            email,
            password,
            agreedTerms,
            workEmail
        });

        // Check if this was a pending user activation
        const message = result.isPendingUserActivated
            ? 'Account activated successfully! You can now view your pending score requests.'
            : 'User registered successfully';

        // Send welcome email to the candidate
        if (email) {
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'Welcome to SapienScore!',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #FF8541;">Welcome to SapienScore!</h2>
                            <p>Hi there,</p>
                            <p>Thank you for registering with SapienScore. Your account has been successfully created!</p>
                            <p>You can now:</p>
                            <ul>
                                <li>Share your thoughts anonymously</li>
                                <li>Receive and view scores from others</li>
                                <li>Build your professional reputation</li>
                            </ul>
                            <p>Get started by logging in to your account.</p>
                            <p>Best regards,<br/>The SapienScore Team</p>
                        </div>
                    `,
                });
            } catch (emailError) {
                console.error('Error sending welcome email:', emailError);
                // Don't fail registration if email fails
            }
        }

        res.status(201).json({
            message,
            user: result.user,
            token: result.token,
            hasPendingNotifications: result.isPendingUserActivated // Frontend can use this to show notifications
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(400).json({ error: err.message });
    }
};

/**
 * Login user
 * POST /api/auth/login
 * Body: { identifier (email or phone), password }
 */
exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        const result = await authService.login(identifier, password);

        res.status(200).json({
            message: 'Login successful',
            user: result.user,
            token: result.token
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(401).json({ error: err.message });
    }
};

/**
 * Forgot Password - Step 1: Verify email and send OTP
 * POST /api/auth/forgot-password
 * Body: { email }
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Verify user exists
        await authService.verifyUserByEmail(email);

        // Send OTP to email
        await sendOtpToEmail(email);

        res.status(200).json({
            message: 'Verification code sent to your email',
            email
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(400).json({ error: err.message });
    }
};

/**
 * Forgot Password - Step 2: Verify OTP code
 * POST /api/auth/verify-reset-code
 * Body: { email, otp }
 */
exports.verifyResetCode = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and verification code are required' });
        }

        // Verify OTP
        const isValid = verifyOtp(email, otp);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid or expired verification code' });
        }

        res.status(200).json({
            message: 'Verification code verified successfully',
            email
        });
    } catch (err) {
        console.error('Verify reset code error:', err);
        res.status(400).json({ error: err.message });
    }
};

/**
 * Forgot Password - Step 3: Reset password
 * POST /api/auth/reset-password
 * Body: { email, newPassword }
 */
exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ error: 'Email and new password are required' });
        }

        await authService.resetPassword(email, newPassword);

        // Send password changed confirmation email
        if (email) {
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'SapienScore - Password Changed Successfully',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #FF8541;">Password Changed Successfully</h2>
                            <p>Hi there,</p>
                            <p>Your SapienScore account password has been successfully changed.</p>
                            <p>If you did not make this change, please contact our support team immediately.</p>
                            <p>For security reasons, we recommend:</p>
                            <ul>
                                <li>Using a strong, unique password</li>
                                <li>Not sharing your password with anyone</li>
                                <li>Changing your password regularly</li>
                            </ul>
                            <p>You can now log in with your new password.</p>
                            <p>Best regards,<br/>The SapienScore Team</p>
                        </div>
                    `,
                });
            } catch (emailError) {
                console.error('Error sending password changed email:', emailError);
                // Don't fail password reset if email fails
            }
        }

        res.status(200).json({
            message: 'Password reset successfully. You can now login with your new password.'
        });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(400).json({ error: err.message });
    }
};

