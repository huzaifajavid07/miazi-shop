import asyncHandler from 'express-async-handler';
import SSLCommerzPayment from 'sslcommerz-lts';
import PaymentIntent from '../models/paymentIntentModel.js';
import Order from '../models/orderModel.js';
import sendEmail from '../utils/emailUtils.js';

// SSLCommerz Configuration
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = process.env.IS_LIVE === 'true';

// @desc    Initialize SSLCommerz Payment Session
// @route   POST /api/payment/init
// @access  Private
const initPayment = asyncHandler(async (req, res) => {
    const { orderData } = req.body;
    const tran_id = `TRAN_${Date.now()}`;

    // Prepare data for SSLCommerz
    const data = {
        total_amount: orderData.totalPrice,
        currency: 'BDT',
        tran_id: tran_id,
        success_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/payment/success`,
        fail_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/payment/fail`,
        cancel_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/payment/cancel`,
        ipn_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/payment/ipn`,
        shipping_method: 'Courier',
        product_name: 'Ecommerce Inventory',
        product_category: 'Electronics',
        product_profile: 'general',
        cus_name: req.user.name,
        cus_email: req.user.email,
        cus_add1: orderData.shippingAddress.address,
        cus_city: orderData.shippingAddress.city,
        cus_postcode: orderData.shippingAddress.postalCode,
        cus_country: orderData.shippingAddress.country,
        cus_phone: orderData.shippingAddress.phone,
        ship_name: req.user.name,
        ship_add1: orderData.shippingAddress.address,
        ship_city: orderData.shippingAddress.city,
        ship_state: orderData.shippingAddress.city,
        ship_postcode: orderData.shippingAddress.postalCode,
        ship_country: orderData.shippingAddress.country,
    };

    // Save temporary data to PaymentIntent
    const paymentIntent = new PaymentIntent({
        tran_id,
        user: req.user._id,
        orderData: {
            ...orderData,
            orderItems: orderData.orderItems.map(item => ({
                ...item,
                product: item.product || item._id, // handle different frontend mappings
                image: item.image || (item.images && item.images[0]) || '/uploads/placeholder.png' // ensure image is present
            }))
        }
    });
    await paymentIntent.save();

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    sslcz.init(data).then(apiResponse => {
        let GatewayPageURL = apiResponse.GatewayPageURL;
        if (GatewayPageURL) {
            res.status(200).json({ url: GatewayPageURL });
        } else {
            res.status(400);
            throw new Error('SSLCommerz Session Initialization Failed');
        }
    });
});

// @desc    Handle Payment Success Callback
// @route   POST /api/payment/success
// @access  Public
const paymentSuccess = asyncHandler(async (req, res) => {
    const { tran_id, amount, val_id } = req.body;

    // Verify Payment with SSLCommerz API
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    sslcz.validate({ val_id }).then(async (validation) => {
        if (validation.status === 'VALID' || validation.status === 'AUTHENTICATED') {
            const intent = await PaymentIntent.findOne({ tran_id }).populate('user', 'name email');
            
            if (!intent) {
                return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/fail?error=IntentNotFound`);
            }

            // check amount matches
            if (parseFloat(amount) !== parseFloat(intent.orderData.totalPrice)) {
                 return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/fail?error=AmountMismatch`);
            }

            // Create Actual Order
            const order = new Order({
                user: intent.user,
                orderItems: intent.orderData.orderItems,
                shippingAddress: intent.orderData.shippingAddress,
                paymentMethod: 'Online Payment (SSLCommerz)',
                itemsPrice: intent.orderData.itemsPrice,
                shippingPrice: intent.orderData.shippingPrice,
                taxPrice: intent.orderData.taxPrice,
                totalPrice: intent.orderData.totalPrice,
                isPaid: true,
                paidAt: Date.now(),
                paymentResult: {
                    id: tran_id,
                    status: 'Paid',
                    update_time: Date.now().toString(),
                    email_address: intent.orderData.shippingAddress.email || req.body.card_no
                },
                orderStatus: 'Processing'
            });

            const createdOrder = await order.save();
            intent.status = 'Completed';
            await intent.save();

            // Send Email Notifications
            try {
                const itemsList = order.orderItems.map(item => 
                    `<tr>
                        <td style="padding:12px; border-bottom:1px solid #edf2f7;">
                            <div style="font-weight:bold; color:#2d3748;">${item.name}</div>
                        </td>
                        <td style="padding:12px; border-bottom:1px solid #edf2f7; text-align:center; color:#4a5568;">${item.qty}</td>
                        <td style="padding:12px; border-bottom:1px solid #edf2f7; text-align:right; font-weight:bold; color:#2d3748;">৳${item.price.toLocaleString()}</td>
                    </tr>`
                ).join('');

                const commonStyles = `
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    border: 1px solid #e2e8f0;
                `;

                // 1. Send Receipt to CUSTOMER
                if (intent.user && intent.user.email) {
                    const userEmailHtml = `
                    <div style="${commonStyles}">
                        <div style="background-color: #facc15; padding: 40px 20px; text-align: center;">
                            <h1 style="margin: 0; color: #1a202c; text-transform: uppercase; letter-spacing: 2px; font-size: 24px;">Order Confirmed</h1>
                            <p style="margin: 10px 0 0; color: #1a202c; font-weight: bold; opacity: 0.8;">Thank you for shopping with MIAZI SHOP</p>
                        </div>
                        <div style="padding: 30px;">
                            <div style="margin-bottom: 25px; display: flex; justify-content: space-between;">
                                <div>
                                    <p style="margin: 0; font-size: 12px; color: #718096; text-transform: uppercase; font-weight: 800;">Order ID</p>
                                    <p style="margin: 4px 0 0; font-weight: bold; color: #2d3748;">#${createdOrder._id.toString().slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                                <thead>
                                    <tr style="background-color: #f8fafc;">
                                        <th style="padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #718096;">Item</th>
                                        <th style="padding: 12px; text-align: center; font-size: 11px; text-transform: uppercase; color: #718096;">Qty</th>
                                        <th style="padding: 12px; text-align: right; font-size: 11px; text-transform: uppercase; color: #718096;">Price</th>
                                    </tr>
                                </thead>
                                <tbody>${itemsList}</tbody>
                            </table>
                            <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; text-align: right;">
                                <p style="margin: 0; font-size: 14px; color: #4a5568;">Total Amount Paid</p>
                                <p style="margin: 5px 0 0; font-size: 24px; font-weight: 900; color: #1a202c;">৳${order.totalPrice.toLocaleString()}</p>
                            </div>
                            <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 13px; color: #718096; text-align: center;">
                                <p>We are processing your shipment. You will receive another update soon.</p>
                                <p style="margin-top: 10px; font-weight: bold; color: #1a202c;">MIAZI SHOP — Premium Electronics Hub</p>
                            </div>
                        </div>
                    </div>
                `;

                    await sendEmail({
                        email: intent.user.email,
                        subject: `Order Confirmation #${createdOrder._id.toString().slice(-8).toUpperCase()} - MIAZI SHOP`,
                        html: userEmailHtml,
                    });
                }

                // 2. Send Alert to ADMIN (Saad)
                const adminName = intent.user?.name || 'Guest User';
                const adminEmail = intent.user?.email || 'N/A';
                const adminEmailHtml = `
                    <div style="${commonStyles}">
                        <div style="background-color: #1a202c; padding: 30px 20px; text-align: center;">
                            <h2 style="margin: 0; color: #facc15; text-transform: uppercase; letter-spacing: 1px;">New Order Received</h2>
                        </div>
                        <div style="padding: 30px;">
                            <div style="background-color: #fffaf0; border: 1px solid #feebc8; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                                <h4 style="margin: 0 0 15px; color: #9c4221; text-transform: uppercase; font-size: 12px;">Customer Manifest</h4>
                                <table style="width: 100%; font-size: 14px; color: #2d3748;">
                                    <tr><td style="padding: 4px 0; font-weight: bold; width: 100px;">Name:</td><td>${adminName}</td></tr>
                                    <tr><td style="padding: 4px 0; font-weight: bold;">Email:</td><td>${adminEmail}</td></tr>
                                    <tr><td style="padding: 4px 0; font-weight: bold;">Phone:</td><td>${intent.orderData.shippingAddress.phone}</td></tr>
                                    <tr><td style="padding: 4px 0; font-weight: bold; vertical-align: top;">Address:</td><td>${intent.orderData.shippingAddress.address}, ${intent.orderData.shippingAddress.city}, ${intent.orderData.shippingAddress.country}</td></tr>
                                </table>
                            </div>
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                                <tbody style="font-size: 13px;">${itemsList}</tbody>
                            </table>
                            <div style="text-align: right; border-top: 2px solid #1a202c; padding-top: 15px;">
                                <p style="margin: 0; font-size: 18px; font-weight: 900; color: #1a202c;">Total: ৳${order.totalPrice.toLocaleString()}</p>
                            </div>
                            <div style="margin-top: 30px; text-align: center;">
                                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/dashboard" style="background-color: #1a202c; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 12px; text-transform: uppercase;">View Fulfillment Center</a>
                            </div>
                        </div>
                    </div>
                `;

                await sendEmail({
                    email: process.env.ADMIN_EMAIL || 'saad489254@gmail.com',
                    subject: `🚨 NEW PAID ORDER: #${createdOrder._id.toString().slice(-8).toUpperCase()} - ৳${order.totalPrice}`,
                    html: adminEmailHtml,
                });

            } catch (err) {
                console.error('Email Dispatch Error:', err.message);
            }

            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/success?orderId=${createdOrder._id}&tranId=${tran_id}`);
        } else {
            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/fail`);
        }
    });
});

// @desc    Handle Payment Fail Callback
// @route   POST /api/payment/fail
// @access  Public
const paymentFail = asyncHandler(async (req, res) => {
    const { tran_id } = req.body;
    await PaymentIntent.findOneAndUpdate({ tran_id }, { status: 'Failed' });
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/fail?tranId=${tran_id}`);
});

// @desc    Handle Payment Cancel Callback
// @route   POST /api/payment/cancel
// @access  Public
const paymentCancel = asyncHandler(async (req, res) => {
    const { tran_id } = req.body;
    await PaymentIntent.findOneAndUpdate({ tran_id }, { status: 'Cancelled' });
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/cancel?tranId=${tran_id}`);
});

export { initPayment, paymentSuccess, paymentFail, paymentCancel };
