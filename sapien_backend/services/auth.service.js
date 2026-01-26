const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const SALT_ROUNDS = 10;

/**
 * Hash a password
 */
const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare password with hashed password
 */
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            phone_number: user.phone_number
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

/**
 * Register a new user
 */
const register = async (userData) => {
    const { phone_number, email, password, agreedTerms, workEmail } = userData;

    // Validate required fields
    if (!email && !phone_number) {
        throw new Error('Either email or phone number is required');
    }
    if (!password) {
        throw new Error('Password is required');
    }
    if (!agreedTerms) {
        throw new Error('You must agree to terms and conditions');
    }

    // Check if user already exists (including work_email for backward compatibility)
    // This query will find:
    // 1. Pending users created via rating (have email/phone but no password)
    // 2. Fully registered users (have email/phone AND password)
    const queryConditions = [];
    if (email) {
        queryConditions.push({ email });
        queryConditions.push({ work_email: email }); // Check work_email too
    }
    if (phone_number) {
        queryConditions.push({ phone_number });
    }
    // Also check if provided workEmail matches an existing user
    // This handles: user scored by work email, registers with different personal email but same work email
    if (workEmail) {
        queryConditions.push({ email: workEmail });
        queryConditions.push({ work_email: workEmail });
    }

    const existingUser = await User.findOne({ $or: queryConditions });

    // Log for debugging
    if (existingUser) {
        console.log('Found existing user:', {
            id: existingUser._id,
            email: existingUser.email,
            work_email: existingUser.work_email,
            phone_number: existingUser.phone_number,
            hasPassword: !!existingUser.password,
            isPending: !existingUser.password
        });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    if (existingUser) {
        // Check if this is a "pending user" (created via rating but never registered)
        // Pending users have email/phone but NO password
        if (!existingUser.password) {
            console.log('🔄 Activating pending user account:', {
                userId: existingUser._id,
                existingEmail: existingUser.email,
                existingWorkEmail: existingUser.work_email,
                existingPhone: existingUser.phone_number,
                newEmail: email,
                newPhone: phone_number
            });

            // This is a pending user - update their record with password and terms
            existingUser.password = hashedPassword;
            existingUser.agreedTerms = agreedTerms;
            existingUser.invited = "true";

            // Update email field if they registered with email
            // This handles cases where:
            // 1. User was created with phone, now signing up with email
            // 2. User was created with email, now providing the same email (no change)
            // 3. User was created with work_email, now providing email field
            if (email) {
                existingUser.email = email;
                // Also update work_email for backward compatibility
                if (!existingUser.work_email) {
                    existingUser.work_email = email;
                }
            }

            // Update phone_number if they registered with phone
            // This handles cases where:
            // 1. User was created with email, now signing up with phone
            // 2. User was created with phone, now providing the same phone (no change)
            if (phone_number) {
                existingUser.phone_number = phone_number;
            }

            // Update work_email if provided
            if (workEmail) {
                existingUser.work_email = workEmail;
            }

            const updatedUser = await existingUser.save();

            console.log('✅ Pending user activated successfully:', {
                userId: updatedUser._id,
                email: updatedUser.email,
                phone: updatedUser.phone_number,
                hasPassword: !!updatedUser.password
            });

            // Generate token
            const token = generateToken(updatedUser);

            return {
                user: {
                    id: updatedUser._id,
                    email: updatedUser.email,
                    phone_number: updatedUser.phone_number,
                    username: updatedUser.username,
                    name: updatedUser.name
                },
                token,
                isPendingUserActivated: true // Flag to indicate this was a pending user
            };
        }

        // User already has a password - they're fully registered
        // This means they're trying to register again with the same credentials
        if (existingUser.email === email || existingUser.work_email === email) {
            throw new Error('Email already registered');
        }
        if (existingUser.phone_number === phone_number) {
            throw new Error('Phone number already registered');
        }
    }

    // Create new user (no existing user found)
    const newUser = new User({
        phone_number,
        email,
        password: hashedPassword,
        agreedTerms,
        work_email: workEmail || null,
        invited: "true" // Set to true for backward compatibility
    });

    const savedUser = await newUser.save();

    // Generate token
    const token = generateToken(savedUser);

    return {
        user: {
            id: savedUser._id,
            email: savedUser.email,
            phone_number: savedUser.phone_number,
            username: savedUser.username,
            name: savedUser.name
        },
        token,
        isPendingUserActivated: false
    };
};

/**
 * Login user with email/phone and password
 */
const login = async (identifier, password) => {
    // Validate inputs
    if (!identifier) {
        throw new Error('Email or phone number is required');
    }
    if (!password) {
        throw new Error('Password is required');
    }

    // Find user by email or phone number
    const user = await User.findOne({
        $or: [
            { email: identifier },
            { phone_number: identifier },
            { work_email: identifier } // Also check work_email for backward compatibility
        ]
    });

    if (!user) {
        throw new Error('Invalid credentials');
    }

    // Check if this is a pending user (created via rating but never registered)
    // Pending users have email/phone but NO password
    if (!user.password) {
        console.log('⚠️ Pending user attempted login:', {
            identifier,
            userId: user._id,
            hasPassword: false
        });
        throw new Error('Account not activated. Please sign up to activate your account and access your pending ratings.');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    // Generate token
    const token = generateToken(user);

    return {
        user: {
            id: user._id,
            email: user.email,
            phone_number: user.phone_number,
            username: user.username,
            name: user.name,
            photo_url: user.photo_url
        },
        token
    };
};

/**
 * Verify user exists by email for password reset
 */
const verifyUserByEmail = async (email) => {
    if (!email) {
        throw new Error('Email is required');
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('No account found with this email');
    }

    return user;
};

/**
 * Reset password
 */
const resetPassword = async (email, newPassword) => {
    if (!email || !newPassword) {
        throw new Error('Email and new password are required');
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return { message: 'Password reset successfully' };
};

module.exports = {
    hashPassword,
    comparePassword,
    generateToken,
    register,
    login,
    verifyUserByEmail,
    resetPassword
};

