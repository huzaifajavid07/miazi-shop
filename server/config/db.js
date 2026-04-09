import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        logger.info('✅ [DB] Using existing connection');
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 20000,
            socketTimeoutMS: 45000,
            family: 4, // Use IPv4 for stability on some hosts
        });
        logger.info(`✅ [DB] Connected: ${conn.connection.host}`);
        
        // Listen for connection drops
        mongoose.connection.on('error', err => {
            console.error(`❌ [DB] Runtime Error: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ [DB] Connection Dropped. Attempting re-connect...');
        });

    } catch (error) {
        console.error(`❌ [DB] INITIAL CONNECTION FAILED: ${error.message}`);
        // Log stack trace for deep debugging
        if (process.env.NODE_ENV !== 'production') console.error(error.stack);
    }
};

export default connectDB;
