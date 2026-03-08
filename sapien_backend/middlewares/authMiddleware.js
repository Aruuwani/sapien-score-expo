const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.authMiddleware = async (req, res, next) => {
    try {
        // Extract token from header
        const token = req.headers['x-access-token'] || req.headers['authorization'];
        if (!token) {
            return res.status(401).json({ error: 'No authentication token provided' });
        }

        // Clean token (remove Bearer prefix if present)
        const cleanToken = token.replace('Bearer ', '').trim();
        if (!cleanToken) {
            return res.status(401).json({ error: 'Invalid token format' });
        }

        // Verify token
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);

        // Check if user still exists in database (prevents deleted/banned users from accessing)
        const user = await User.findById(decoded.id).select('_id');
        if (!user) {
            return res.status(401).json({ error: 'User no longer exists. Please register again.' });
        }

        req.userId = user._id;
        next();
    } catch (err) {
        // Handle specific JWT errors with sanitized messages
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please login again.' });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid authentication token' });
        }
        console.error('Auth middleware error:', err.message);
        res.status(401).json({ error: 'Authentication failed' });
    }
};
