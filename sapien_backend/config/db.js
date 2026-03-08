const mongoose = require('mongoose');
const os = require('os');

const connectDB = async () => {
    try {
        // Auto-detect environment: macOS = local dev, Linux = EC2 production
        const isProduction = os.platform() === 'linux';
        const mongoURI = isProduction
            ? process.env.MONGO_URI_PROD
            : process.env.MONGO_URI_LOCAL;

        const env = isProduction ? '🟢 PRODUCTION' : '🟡 DEVELOPMENT';
        console.log(`Environment: ${env}`);

        await mongoose.connect(mongoURI, {
            // Connection pool settings
            maxPoolSize: 10,
            minPoolSize: 2,

            // Timeouts
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,

            // Heartbeat
            heartbeatFrequencyMS: 10000,
        });
        console.log('✅ MongoDB connected securely');

        // Monitor connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });

    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
