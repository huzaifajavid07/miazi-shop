import express from 'express';
import {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    toggleWishlist
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { registerValidation, loginValidation } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/').post(registerValidation, registerUser).get(protect, admin, getUsers);
router.post('/login', loginValidation, authUser);
router.post('/logout', logoutUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.post('/wishlist', protect, toggleWishlist);

export default router;
