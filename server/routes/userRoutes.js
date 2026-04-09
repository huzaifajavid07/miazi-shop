import express from 'express';
import {
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
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateMiddleware.js';
import { 
    registerUserSchema, 
    authUserSchema, 
    forgotPasswordSchema, 
    resetPasswordSchema 
} from '../utils/validators.js';

const router = express.Router();

router.route('/').post(validateRequest(registerUserSchema), registerUser).get(protect, admin, getUsers);
router.post('/login', validateRequest(authUserSchema), authUser);
router.post('/google-login', googleAuth);
router.post('/logout', logoutUser);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);

export default router;
