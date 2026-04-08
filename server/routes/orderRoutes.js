import express from 'express';
import {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderStatus,
    getMyOrders,
    getOrders,
    approveOrderPayment,
    rejectOrderPayment,
    deleteOrder
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById).delete(protect, admin, deleteOrder);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/approve-payment').put(protect, admin, approveOrderPayment);
router.route('/:id/reject-payment').put(protect, admin, rejectOrderPayment);
router.route('/:id/status').put(protect, admin, updateOrderStatus);

export default router;
