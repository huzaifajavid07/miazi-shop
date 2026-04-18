import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config(); // Initialize early for ESM
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import connectDB from './config/db.js';
import logger from './utils/logger.js';

import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Connect to MongoDB
logger.info('🚀 [Server] Initializing database connection...');
connectDB();

// Verification of Cloudinary setup
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    logger.error('❌ [Server] CLOUDINARY configuration is MISSING! Uploads will fail.');
} else {
    logger.info('✅ [Server] CLOUDINARY configuration detected.');
}

const app = express();

// Database connection - top-level call handles it
// connectDB() is already called at line 25

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(mongoSanitize()); // Prevent NoSQL Injection
app.use(xss()); // Filter XSS attacks

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://miazi-shop.vercel.app',
        process.env.CLIENT_URL
    ].filter(Boolean),
    credentials: true,
}));
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
}));
app.use(morgan('dev'));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // Max 10 attempts per 15 mins for login/register
    message: 'Too many auth attempts from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', limiter);
app.use('/api/users/login', authLimiter);
app.use('/api/users/forgot-password', authLimiter);
app.use('/api/users/register', authLimiter);

// Static Folders
const __dirname = process.cwd();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route for diagnostics
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP', environment: process.env.NODE_ENV, timestamp: new Date().toISOString() });
});

// Server running check route for Vercel
app.get('/', (req, res) => {
    res.send('MIAZI SHOP API is running...');
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only start the server locally (Vercel handles this automatically in the cloud)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}

export default app;
