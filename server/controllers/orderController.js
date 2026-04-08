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
        paymentScreenshot,
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
            paymentScreenshot: paymentScreenshot || null,
            paymentStatus: (paymentMethod === 'Online' || paymentMethod === 'bKash/Nagad Manual') ? 'Pending Approval' : 'None',
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
                                <tr><td style="padding:3px 0;color:#666;">Handling Fee / Tax:</td><td style="text-align:right;">৳${taxPrice}</td></tr>
                                <tr><td style="padding:8px 0;font-weight:bold;font-size:18px;border-top:1px solid #ddd;">Total:</td><td style="text-align:right;font-weight:bold;font-size:18px;border-top:1px solid #ddd;color:#333e48;">৳${totalPrice}</td></tr>
                            </table>
                        </div>
                        
                        <p style="color:#666;font-size:12px;margin-top:20px;text-align:center;">Payment Method: ${paymentMethod}</p>
                        ${paymentScreenshot ? `
                        <div style="margin-top:20px; text-align:center; background:#f9f9f9; padding:15px; border-radius:10px;">
                            <p style="font-size:11px; font-black uppercase text-gray-400">Manual Payment Receipt</p>
                            <img src="${process.env.BASE_URL}${paymentScreenshot}" style="max-width:200px; border:2px solid #ddd; border-radius:5px; margin-top:10px;" />
                        </div>` : ''}
                    </div>
                    <div style="background:#333e48;padding:15px;text-align:center;color:#999;font-size:12px;">
                        MIAZI SHOP &copy; 2026 | +880 1612-893871
                    </div>
                </div>
            `;

            // Send to admin
            await sendEmail({
                email: process.env.ADMIN_EMAIL || 'saad489254@gmail.com',
                subject: `⚠️ ACTION REQUIRED: New Order Pending Approval #${createdOrder._id.toString().slice(-8).toUpperCase()} — ৳${totalPrice}`,
                html: emailHtml.replace('🛒 New Order Received!', '🕵️ New Order Pending Approval'),
            });

            // Send Confirmation to Customer
            const customerEmailHtml = `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #ddd;border-radius:16px;overflow:hidden;">
                    <div style="background:#f59e0b;padding:30px;text-align:center;">
                        <h1 style="margin:0;color:white;">⏳ Order Pending Approval</h1>
                        <p style="margin:5px 0 0;color:white;opacity:0.9;">MIAZI SHOP — Order #${createdOrder._id.toString().slice(-8).toUpperCase()}</p>
                    </div>
                    <div style="padding:30px;">
                        <p>Hello <strong>${shippingAddress.fullName || req.user.name}</strong>,</p>
                        <p>Thank you for your order! We have received your manual payment receipt and your order is now <strong>PENDING APPROVAL</strong>.</p>
                        <p>Our team is currently verifying your transaction. You will receive a confirmation email once your payment is verified and your order is confirmed.</p>
                        <div style="background:#fffbeb;padding:20px;border-radius:12px;margin:20px 0;border:1px solid #fef3c7;text-align:center;">
                            <p style="margin:0;font-size:12px;color:#d97706;text-transform:uppercase;font-weight:bold;">Total Amount to Verify</p>
                            <p style="margin:5px 0 0;font-size:32px;font-weight:900;color:#92400e;">৳${totalPrice}</p>
                        </div>
                    </div>
                    <div style="background:#333e48;padding:20px;text-align:center;color:#999;font-size:12px;">
                        Thank you for your patience | MIAZI SHOP
                    </div>
                </div>
            `;

            await sendEmail({
                email: req.user.email,
                subject: `Order Pending Approval #${createdOrder._id.toString().slice(-8).toUpperCase()} - MIAZI SHOP`,
                html: customerEmailHtml,
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

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        await order.deleteOne();
        res.json({ message: 'Order removed' });
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Approve manual payment
// @route   PUT /api/orders/:id/approve-payment
// @access  Private/Admin
const approveOrderPayment = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentStatus = 'Verified';
        order.orderStatus = 'Processing';
        order.paymentResult = {
            id: 'MANUAL_APPROVAL',
            status: 'VERIFIED',
            update_time: new Date().toISOString(),
            email_address: req.user.email,
        };

        const updatedOrder = await order.save();

        // Send Approval Email to Customer
        try {
            const emailHtml = `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #ddd;border-radius:16px;overflow:hidden;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">
                    <div style="background:#10b981;padding:40px 20px;text-align:center;">
                        <h1 style="margin:0;color:white;text-transform:uppercase;letter-spacing:2px;">🎉 Order Confirmed!</h1>
                        <p style="margin:10px 0 0;color:white;font-weight:bold;opacity:0.9;">MIAZI SHOP — Order #${order._id.toString().slice(-8).toUpperCase()}</p>
                    </div>
                    <div style="padding:30px;text-align:center;">
                        <p style="font-size:18px;color:#1f2937;line-height:1.6;">Hello <strong>${order.user.name}</strong>,</p>
                        <p style="font-size:16px;color:#4b5563;line-height:1.6;">Your payment has been <strong>SUCCESSFULLY VERIFIED</strong>. We are excited to inform you that your order is now confirmed and is being prepared for shipment!</p>
                        <div style="margin:40px 0;background:#ecfdf5;padding:30px;border-radius:12px;border:2px solid #a7f3d0;">
                            <p style="margin:0;font-size:12px;color:#059669;text-transform:uppercase;font-weight:bold;">Shipment Status</p>
                            <p style="margin:10px 0 0;font-size:28px;font-weight:900;color:#064e3b;">PREPARING TO SHIP</p>
                        </div>
                        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/order/${order._id}" style="display:inline-block;background:#333e48;color:#fff;padding:18px 40px;border-radius:12px;text-decoration:none;font-weight:bold;text-transform:uppercase;font-size:14px;letter-spacing:1px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">Track Your Delivery</a>
                    </div>
                    <div style="background:#333e48;padding:20px;text-align:center;color:#999;font-size:11px;letter-spacing:1px;">
                        MIAZI SHOP • Quality You Can Trust
                    </div>
                </div>
            `;

            await sendEmail({
                email: order.user.email,
                subject: `🎉 Order Confirmed! #${order._id.toString().slice(-8).toUpperCase()} - Your payment is verified!`,
                html: emailHtml,
            });
        } catch (err) {
             console.error('Approval email failed:', err.message);
        }

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Reject manual payment
// @route   PUT /api/orders/:id/reject-payment
// @access  Private/Admin
const rejectOrderPayment = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        order.paymentStatus = 'Rejected';
        // Optional: Mark as cancelled or keep as pending with rejected status
        const updatedOrder = await order.save();

        // Send Rejection Email
        try {
            const emailHtml = `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #ddd;border-radius:16px;overflow:hidden;">
                    <div style="background:#ef4444;padding:40px 20px;text-align:center;">
                        <h1 style="margin:0;color:#fff;text-transform:uppercase;">❌ Payment Issue</h1>
                    </div>
                    <div style="padding:30px;text-align:center;">
                        <p style="font-size:16px;color:#4a5568;">Hello <strong>${order.user.name}</strong>,</p>
                        <p style="font-size:16px;color:#4a5568;">We were unable to verify your manual payment screenshot for Order #${order._id.toString().slice(-8).toUpperCase()}.</p>
                        <p style="font-size:14px;color:#ef4444;font-weight:bold;margin-top:20px;">Reason: The receipt provided is invalid or could not be matched with our records.</p>
                        <p style="margin-top:20px;font-size:14px;color:#64748b;">Please contact support at +880 1612-893871 immediately for assistance.</p>
                    </div>
                </div>
            `;

            await sendEmail({
                email: order.user.email,
                subject: `Payment Rejection: Order #${order._id.toString().slice(-8).toUpperCase()} - MIAZI SHOP`,
                html: emailHtml,
            });
        } catch (err) {
             console.error('Rejection email failed:', err.message);
        }

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

export {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderStatus,
    getMyOrders,
    getOrders,
    approveOrderPayment,
    rejectOrderPayment,
    deleteOrder,
};
