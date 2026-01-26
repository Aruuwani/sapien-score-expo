const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');


exports.authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'] || req.headers['authorization'];
        if (!token) {
            return res.status(401).json({ error: 'No authentication token provided' });
        }
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        
        req.userId = new ObjectId(decoded.id);
        
        next();
    } catch (err) {
        console.error('Error in auth middleware:', err.message);
        res.status(401).json({ error: 'Invalid authentication token' });
    }
};


