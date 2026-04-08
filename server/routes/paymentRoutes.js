import express from 'express';
import {
    initPayment,
    paymentSuccess,
    paymentFail,
    paymentCancel
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/init', protect, initPayment);
router.post('/success', paymentSuccess); // Callback from SSLCommerz (Public)
router.post('/fail', paymentFail);       // Callback from SSLCommerz (Public)
router.post('/cancel', paymentCancel);   // Callback from SSLCommerz (Public)

export default router;
