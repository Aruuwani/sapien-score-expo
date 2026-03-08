/**
 * Global Error Handler Middleware
 * 
 * Catches all unhandled errors and returns sanitized responses.
 * Prevents leaking stack traces, internal paths, or DB details to clients.
 */

const errorHandler = (err, req, res, next) => {
    // Log full error for debugging (server-side only)
    console.error('❌ Unhandled Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.originalUrl,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString(),
    });

    // Default error values
    let statusCode = err.statusCode || 500;
    let message = 'Something went wrong. Please try again later.';

    // Handle specific Mongoose errors
    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    }

    if (err.name === 'ValidationError') {
        statusCode = 400;
        const messages = Object.values(err.errors).map(e => e.message);
        message = `Validation failed: ${messages.join(', ')}`;
    }

    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate value for ${field}. This ${field} already exists.`;
    }

    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    // Send sanitized response
    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = { errorHandler };
