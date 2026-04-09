import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        generateToken(res, user._id);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        generateToken(res, user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });

    res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            address: user.address,
            phone: user.phone,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.address) user.address = req.body.address;
        if (req.body.phone) user.phone = req.body.phone;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            address: updatedUser.address,
            phone: updatedUser.phone,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.status(200).json(users);
});

// @desc    Auth user with Google
// @route   POST /api/users/google-login
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
    const { name, email, googleId } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
        // Create new user if they don't exist
        user = await User.create({
            name,
            email,
            password: Math.random().toString(36).slice(-10), // Random password for social login
            isAdmin: false,
        });
    }

    if (user) {
        generateToken(res, user._id);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

import sendEmail from '../utils/emailUtils.js';

// @desc    Forgot Password (Generate OTP)
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('No user found with this email');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before saving
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    user.resetOtp = hashedOtp;
    user.resetOtpExpire = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
    await user.save();

    // Send Email OR Fallback to Console for Local Dev
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn(`\n[DEV WARNING] EMAIL_USER or EMAIL_PASS not set in .env!`);
        console.warn(`[DEV WARNING] Your password reset OTP is: ${otp}\n`);
        
        return res.status(200).json({ 
            message: 'Email not configured. Check terminal for your OTP.'
        });
    }

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset OTP - Miazii Shop',
            html: `
                <h1>Password Reset</h1>
                <p>You requested a password reset. Here is your 6-digit OTP:</p>
                <h2 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">${otp}</h2>
                <p>This OTP is valid for 5 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
            `,
        });

        res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        user.resetOtp = undefined;
        user.resetOtpExpire = undefined;
        await user.save();
        res.status(500);
        throw new Error('Email could not be sent. Make sure EMAIL_USER and EMAIL_PASS are configured.');
    }
});

// @desc    Verify OTP
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (!user.resetOtp || !user.resetOtpExpire) {
        res.status(400);
        throw new Error('No OTP request found for this user');
    }

    if (Date.now() > user.resetOtpExpire) {
        res.status(400);
        throw new Error('OTP has expired');
    }

    const isMatch = await bcrypt.compare(otp, user.resetOtp);

    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid OTP');
    }

    res.status(200).json({ message: 'OTP verified successfully' });
});

// @desc    Reset Password
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.resetOtp || !user.resetOtpExpire) {
        res.status(400);
        throw new Error('Invalid request');
    }

    if (Date.now() > user.resetOtpExpire) {
        res.status(400);
        throw new Error('OTP has expired');
    }

    const isMatch = await bcrypt.compare(otp, user.resetOtp);
    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid OTP');
    }

    user.password = newPassword; // Pre-save hook will hash it
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
});

export {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    googleAuth,
    forgotPassword,
    verifyOTP,
    resetPassword
};
