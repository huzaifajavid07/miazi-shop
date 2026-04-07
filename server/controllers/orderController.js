import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import sendEmail from '../utils/emailUtils.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        const order = new Order({
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        });

        const createdOrder = await order.save();

        // Send order notification email to admin
        try {
            const itemsList = orderItems.map(item => 
                `<tr>
                    <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
                    <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.qty}</td>
                    <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">৳${item.price}</td>
                </tr>`
            ).join('');

            const emailHtml = `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
                    <div style="background:#fed700;padding:20px;text-align:center;">
                        <h1 style="margin:0;color:#333e48;">🛒 New Order Received!</h1>
                        <p style="margin:5px 0 0;color:#333e48;">MIAZI SHOP — Order #${createdOrder._id}</p>
                    </div>
                    <div style="padding:20px;">
                        <h3 style="color:#333;">Customer Details</h3>
                        <table style="width:100%;margin-bottom:20px;">
                            <tr><td style="padding:4px 0;color:#666;">Name:</td><td style="font-weight:bold;">${shippingAddress.fullName || req.user.name}</td></tr>
                            <tr><td style="padding:4px 0;color:#666;">Email:</td><td>${shippingAddress.email || req.user.email}</td></tr>
                            <tr><td style="padding:4px 0;color:#666;">Phone:</td><td style="font-weight:bold;">${shippingAddress.phone || 'N/A'}</td></tr>
                            <tr><td style="padding:4px 0;color:#666;">Address:</td><td>${shippingAddress.address}, ${shippingAddress.city} ${shippingAddress.postalCode || ''}, ${shippingAddress.country || 'Bangladesh'}</td></tr>
                        </table>
                        
                        <h3 style="color:#333;">Ordered Products</h3>
                        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                            <thead>
                                <tr style="background:#f5f5f5;">
                                    <th style="padding:8px;text-align:left;">Product</th>
                                    <th style="padding:8px;text-align:center;">Qty</th>
                                    <th style="padding:8px;text-align:right;">Price</th>
                                </tr>
                            </thead>
                            <tbody>${itemsList}</tbody>
                        </table>

                        <div style="border-top:2px solid #fed700;padding-top:15px;">
                            <table style="width:100%;">
                                <tr><td style="padding:3px 0;color:#666;">Items:</td><td style="text-align:right;">৳${itemsPrice}</td></tr>
                                <tr><td style="padding:3px 0;color:#666;">Shipping:</td><td style="text-align:right;">৳${shippingPrice}</td></tr>
                                <tr><td style="padding:3px 0;color:#666;">Tax:</td><td style="text-align:right;">৳${taxPrice}</td></tr>
                                <tr><td style="padding:8px 0;font-weight:bold;font-size:18px;border-top:1px solid #ddd;">Total:</td><td style="text-align:right;font-weight:bold;font-size:18px;border-top:1px solid #ddd;color:#333e48;">৳${totalPrice}</td></tr>
                            </table>
                        </div>
                        
                        <p style="color:#666;font-size:12px;margin-top:20px;text-align:center;">Payment Method: ${paymentMethod}</p>
                    </div>
                    <div style="background:#333e48;padding:15px;text-align:center;color:#999;font-size:12px;">
                        MIAZI SHOP &copy; 2026 | +880 1612-893871
                    </div>
                </div>
            `;

            // Send to admin
            await sendEmail({
                email: process.env.ADMIN_EMAIL || 'saad489254@gmail.com',
                subject: `New Order #${createdOrder._id.toString().slice(-8)} — ৳${totalPrice} — ${shippingAddress.fullName || req.user.name}`,
                html: emailHtml,
            });
        } catch (error) {
            console.error('Email could not be sent:', error.message);
        }

        res.status(201).json(createdOrder);
    }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        if (req.user.isAdmin || order.user._id.toString() === req.user._id.toString()) {
            res.json(order);
        } else {
            res.status(404);
            throw new Error('Not authorized to view this order');
        }
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address,
        };
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.orderStatus = req.body.status || order.orderStatus;
        if (req.body.status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
});

export {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderStatus,
    getMyOrders,
    getOrders,
};
